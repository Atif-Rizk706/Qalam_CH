<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use App\Http\Resources\AuthorResource;
use App\Http\Resources\BookResource;

class AuthorController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Author::with('country');

        if ($request->has('is_contemporary')) {
            $query->where('is_contemporary', $request->boolean('is_contemporary'));
        }

        return $this->successResponse(AuthorResource::collection($query->get()), 'Authors retrieved successfully.');
    }

    public function show(string $id)
    {
        $author = is_numeric($id)
            ? Author::with(['country', 'books'])->findOrFail($id)
            : Author::with(['country', 'books'])->where('slug', $id)->firstOrFail();

        return $this->successResponse(new AuthorResource($author), 'Author retrieved successfully.');
    }

    /**
     * Get paginated books belonging to this author.
     */
    public function books(Request $request, string $id)
    {
        $author = is_numeric($id)
            ? Author::findOrFail($id)
            : Author::where('slug', $id)->firstOrFail();

        $perPage = (int) $request->input('per_page', 15);
        $query = $author->books()->with(['author', 'category'])->latest();

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%")
                    ->orWhere('slug', 'like', "%{$term}%");
            });
        }

        $books = $query->paginate($perPage);

        return $this->successResponse(
            BookResource::collection($books)->response()->getData(true),
            'Author books retrieved successfully.'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
