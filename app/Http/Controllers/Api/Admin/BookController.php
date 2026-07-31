<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Traits\FileUpload;
use App\Traits\ApiResponse;
use App\Http\Resources\BookResource;
use Illuminate\Http\Request;

class BookController extends Controller
{
    use FileUpload, ApiResponse;

    // ==========================================
    // 1. الأساسيات (Full CRUD)
    // ==========================================

    public function index(Request $request)
    {
        $query = Book::with(['author', 'category'])->latest();

        // تفعيل ميزة البحث إذا تم تمرير كلمة بحث في الرابط (?search=...)
        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;

            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")
                    ->orWhere('slug', 'like', "%{$searchTerm}%")
                    // البحث داخل اسم المؤلف أيضاً (عن طريق العلاقة)
                    ->orWhereHas('author', function ($authorQuery) use ($searchTerm) {
                        $authorQuery->where('name', 'like', "%{$searchTerm}%");
                    });
            });
        }

        $books = $query->paginate(15);

        return $this->successResponse(
            BookResource::collection($books)->response()->getData(true),
            'Books retrieved successfully',
            200
        );
    }

    public function show($id)
    {
        $book = Book::with(['author', 'category'])->findOrFail($id);

        return $this->successResponse(
            new BookResource($book),
            'Book retrieved successfully',
            200
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:books,slug',
            'description' => 'nullable|string',
            'author_id' => 'required|exists:authors,id',
            'category_id' => 'required|exists:categories,id',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'cover_image_path' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,epub,doc,docx,txt|max:51200', // max 50MB
            'file_path' => 'nullable|string',
            'views_count' => 'integer',
            'is_book_of_the_day' => 'boolean',
            'is_suggested' => 'boolean',
            'compress_file' => 'boolean', // Option to explicitly compress file
        ]);

        // Upload and compress book file if uploaded
        if ($request->hasFile('file')) {
            if ($request->boolean('compress_file', true)) {
                $validated['file_path'] = $this->uploadAndCompressFile($request->file('file'), 'books');
            } else {
                $validated['file_path'] = $this->uploadFile($request->file('file'), 'books');
            }
        }

        // Upload cover image
        if ($request->hasFile('cover_image')) {
            $validated['cover_image_path'] = $this->uploadFile($request->file('cover_image'), 'covers');
        }

        $book = Book::create($validated);

        return $this->successResponse(
            new BookResource($book),
            'Book created successfully with compressed file storage',
            201
        );
    }

    public function update(Request $request, $id)
    {
        $book = Book::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:books,slug,' . $book->id,
            'description' => 'nullable|string',
            'author_id' => 'sometimes|exists:authors,id',
            'category_id' => 'sometimes|exists:categories,id',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'cover_image_path' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,epub,doc,docx,txt|max:51200',
            'file_path' => 'nullable|string',
            'views_count' => 'integer',
            'is_book_of_the_day' => 'boolean',
            'is_suggested' => 'boolean',
            'compress_file' => 'boolean',
        ]);

        // Handle book file update and compression
        if ($request->hasFile('file')) {
            if ($book->file_path) {
                $this->deleteFile($book->file_path);
            }
            if ($request->boolean('compress_file', true)) {
                $validated['file_path'] = $this->uploadAndCompressFile($request->file('file'), 'books');
            } else {
                $validated['file_path'] = $this->uploadFile($request->file('file'), 'books');
            }
        }

        // Handle cover image update
        if ($request->hasFile('cover_image')) {
            if ($book->cover_image_path) {
                $this->deleteFile($book->cover_image_path);
            }
            $validated['cover_image_path'] = $this->uploadFile($request->file('cover_image'), 'covers');
        }

        $book->update($validated);

        return $this->successResponse(
            new BookResource($book),
            'Book updated successfully',
            200
        );
    }

    public function destroy($id)
    {
        $book = Book::findOrFail($id);
        $book->delete(); // Soft delete / archive

        return $this->successResponse(null, 'Book archived successfully', 200);
    }

    // ==========================================
    // 2. سلة المهملات (Archived / Restore)
    // ==========================================

    public function archived()
    {
        $archivedBooks = Book::onlyTrashed()->with(['author', 'category'])->get();

        return $this->successResponse(
            BookResource::collection($archivedBooks),
            'Archived books retrieved successfully',
            200
        );
    }

    public function restore($id)
    {
        $book = Book::onlyTrashed()->findOrFail($id);
        $book->restore();

        return $this->successResponse(new BookResource($book), 'Book restored successfully', 200);
    }

    // ==========================================
    // 3. كتاب اليوم والمقترحات (Endpoints منفصلة)
    // ==========================================

    // جلب كتاب اليوم الحالي
    public function bookOfTheDay()
    {
        $book = Book::where('is_book_of_the_day', true)->with(['author', 'category'])->first();

        return $this->successResponse(
            $book ? new BookResource($book) : null,
            'Book of the day retrieved',
            200
        );
    }

    // تعيين كتاب كـ "كتاب اليوم" (وإلغاء الباقي لتجنب وجود أكثر من كتاب)
    public function setBookOfTheDay($id)
    {
        $book = Book::findOrFail($id);

        // إزالة حالة "كتاب اليوم" من كل الكتب الأخرى
        Book::where('is_book_of_the_day', true)->update(['is_book_of_the_day' => false]);

        // تفعيلها للكتاب المطلوب
        $book->update(['is_book_of_the_day' => true]);

        return $this->successResponse(new BookResource($book), 'Book set as Book of the Day successfully', 200);
    }

    // جلب الكتب المقترحة
    public function suggestedBooks()
    {
        $books = Book::where('is_suggested', true)->with(['author', 'category'])->latest()->get();

        return $this->successResponse(
            BookResource::collection($books),
            'Suggested books retrieved',
            200
        );
    }

    // تفعيل/إلغاء تفعيل حالة "مقترح" لكتاب معين
    public function toggleSuggested($id)
    {
        $book = Book::findOrFail($id);
        $book->update(['is_suggested' => !$book->is_suggested]);

        $status = $book->is_suggested ? 'added to' : 'removed from';

        return $this->successResponse(new BookResource($book), "Book $status suggested list successfully", 200);
    }
}