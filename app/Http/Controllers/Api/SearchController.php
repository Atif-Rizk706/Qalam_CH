<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AuthorResource;
use App\Http\Resources\BookResource;
use App\Models\Author;
use App\Models\Book;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    use ApiResponse;

    /**
     * Global search across Books and Authors.
     * Returns 2 separate lists: books and authors.
     */
    public function search(Request $request)
    {
        $term = trim($request->input('q', $request->input('search', '')));
        $limit = (int) $request->input('limit', 15);

        if ($term === '') {
            return $this->successResponse([
                'query'         => '',
                'books'         => [],
                'authors'       => [],
                'books_count'   => 0,
                'authors_count' => 0,
            ], 'Search query is empty.');
        }

        // 1. Search Books by title, description, or slug
        $books = Book::with(['author', 'category'])
            ->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%")
                    ->orWhere('slug', 'like', "%{$term}%");
            })
            ->latest()
            ->take($limit)
            ->get();

        // 2. Search Authors by name, bio, or slug
        $authors = Author::with('country')
            ->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('bio', 'like', "%{$term}%")
                    ->orWhere('slug', 'like', "%{$term}%");
            })
            ->latest()
            ->take($limit)
            ->get();

        return $this->successResponse([
            'query'         => $term,
            'books'         => BookResource::collection($books),
            'authors'       => AuthorResource::collection($authors),
            'books_count'   => $books->count(),
            'authors_count' => $authors->count(),
        ], 'Search results retrieved successfully.');
    }
}

