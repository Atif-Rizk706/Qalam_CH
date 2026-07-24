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
    public function index()
    {
        return $this->successResponse(BookResource::collection(Book::with(["author", "category"])->get()), 'Books retrieved successfully.');
    }

    public function show($id)
    {
        $book = Book::with(["author", "category", "ratings"])->findOrFail($id);
        
        // Increment views
        $book->increment("views_count");

        return $this->successResponse(new BookResource($book), 'Book retrieved successfully.');
    }

    public function latest()
    {
        return $this->successResponse(BookResource::collection(Book::with(["author"])->latest()->take(10)->get()), 'Latest books retrieved successfully.');
    }

    public function mostRead()
    {
        return $this->successResponse(BookResource::collection(Book::with(["author"])->orderByDesc("views_count")->take(10)->get()), 'Most read books retrieved successfully.');
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
