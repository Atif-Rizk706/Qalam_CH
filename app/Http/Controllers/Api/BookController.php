<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use App\Http\Resources\BookResource;

class BookController extends Controller
{
    use ApiResponse;
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 15);
        $query = Book::with(["author", "category"])->latest();

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")
                    ->orWhere('slug', 'like', "%{$searchTerm}%")
                    ->orWhereHas('author', function ($aq) use ($searchTerm) {
                        $aq->where('name', 'like', "%{$searchTerm}%");
                    });
            });
        }

        // Filter by Category (by ID or Slug)
        if ($request->filled('category_id')) {
            $categoryIds = is_array($request->category_id)
                ? $request->category_id
                : explode(',', $request->category_id);
            $query->whereIn('category_id', $categoryIds);
        } elseif ($request->filled('category')) {
            $cat = $request->category;
            $query->whereHas('category', function ($cq) use ($cat) {
                if (is_numeric($cat)) {
                    $cq->where('id', $cat);
                } else {
                    $cq->where('slug', $cat)->orWhere('name', $cat);
                }
            });
        }

        if ($request->filled('author_id')) {
            $query->where('author_id', $request->author_id);
        }

        $books = $query->paginate($perPage);

        return $this->successResponse(
            BookResource::collection($books)->response()->getData(true),
            'Books retrieved successfully.'
        );
    }

    public function show($id)
    {
        $book = Book::with(["author", "category", "ratings"])->findOrFail($id);

        // Increment views
        $book->increment("views_count");

        // Related books: same category, exclude current
        $related = Book::with(['author', 'category'])
            ->where('category_id', $book->category_id)
            ->where('id', '!=', $book->id)
            ->inRandomOrder()
            ->take(6)
            ->get();

        $data = (new BookResource($book))->toArray(request());
        $data['related_books'] = BookResource::collection($related);

        return $this->successResponse($data, 'Book retrieved successfully.');
    }

    public function latest()
    {
        return $this->successResponse(BookResource::collection(Book::with(["author"])->latest()->take(10)->get()), 'Latest books retrieved successfully.');
    }

    public function mostRead(Request $request)
    {
        $limit = (int) $request->input('limit', 10);
        $books = Book::with(['author', 'category'])
            ->orderByDesc('views_count')
            ->take($limit)
            ->get();

        return $this->successResponse(BookResource::collection($books), 'Most read books retrieved successfully.');
    }

    public function recordRead($id)
    {
        $book = Book::findOrFail($id);
        $book->increment('views_count');

        return $this->successResponse([
            'book_id' => $book->id,
            'views_count' => $book->views_count,
        ], 'Book read count incremented successfully.');
    }

    public function suggested()
    {
        // Check for admin flagged suggested books first
        $books = Book::with(["author", "category"])->where("is_suggested", true)->take(10)->get();

        // Fallback to random non-archived books if none are set by admin
        if ($books->isEmpty()) {
            $books = Book::with(["author", "category"])->inRandomOrder()->take(10)->get();
        }

        return $this->successResponse(BookResource::collection($books), 'Suggested books retrieved successfully.');
    }

    public function bookOfTheDay()
    {
        $book = Book::with(["author"])->where("is_book_of_the_day", true)->first();
        if (!$book) {
            // fallback to random if none is set
            $book = Book::with(["author"])->inRandomOrder()->first();
        }
        return $this->successResponse(new BookResource($book), 'Book of the day retrieved successfully.');
    }

    public function lovedBooks()
    {
        // Fetch books with highest average rating or most favorites
        $books = Book::with(["author"])->withCount("ratings")->orderByDesc("ratings_count")->take(10)->get();
        return $this->successResponse(BookResource::collection($books), 'Loved books retrieved successfully.');
    }

    public function archive($id)
    {
        $book = Book::findOrFail($id);
        $book->delete(); // Soft delete
        return $this->successResponse(null, 'Book archived successfully');
    }

    public function restore($id)
    {
        $book = Book::withTrashed()->findOrFail($id);
        $book->restore();
        return $this->successResponse(null, 'Book restored successfully');
    }
}
