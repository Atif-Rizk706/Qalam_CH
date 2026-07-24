<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Traits\FileUpload;
use Illuminate\Http\Request;

class BookController extends Controller
{
    use FileUpload;

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

        return response()->json([
            'message' => 'Book created successfully with compressed file storage',
            'data' => $book
        ], 201);
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
            $this->deleteFile($book->file_path);
            if ($request->boolean('compress_file', true)) {
                $validated['file_path'] = $this->uploadAndCompressFile($request->file('file'), 'books');
            } else {
                $validated['file_path'] = $this->uploadFile($request->file('file'), 'books');
            }
        }

        // Handle cover image update
        if ($request->hasFile('cover_image')) {
            $this->deleteFile($book->cover_image_path);
            $validated['cover_image_path'] = $this->uploadFile($request->file('cover_image'), 'covers');
        }

        $book->update($validated);

        return response()->json([
            'message' => 'Book updated successfully',
            'data' => $book
        ]);
    }

    public function destroy($id)
    {
        $book = Book::findOrFail($id);
        $book->delete(); // Soft delete / archive

        return response()->json(['message' => 'Book archived successfully']);
    }

    public function archived()
    {
        $archivedBooks = Book::onlyTrashed()->with(['author', 'category'])->get();

        return response()->json([
            'message' => 'Archived books retrieved successfully',
            'data' => $archivedBooks
        ]);
    }

    public function restore($id)
    {
        $book = Book::onlyTrashed()->findOrFail($id);
        $book->restore();

        return response()->json(['message' => 'Book restored successfully', 'data' => $book]);
    }
}
