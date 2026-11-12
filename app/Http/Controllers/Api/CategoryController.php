<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use App\Http\Resources\CategoryResource;

class CategoryController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return $this->successResponse(
            CategoryResource::collection(Category::withCount('books')->get()),
            'Categories retrieved successfully.'
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $category = is_numeric($id)
            ? Category::withCount('books')->findOrFail($id)
            : Category::withCount('books')->where('slug', $id)->firstOrFail();

        return $this->successResponse(new CategoryResource($category), 'Category retrieved successfully.');
    }

    /**
     * Get paginated books belonging to this category.
     */
    public function books(Request $request, string $id)
    {
        $category = is_numeric($id)
            ? Category::findOrFail($id)
            : Category::where('slug', $id)->firstOrFail();

        $perPage = (int) $request->input('per_page', 15);
        $query = $category->books()->with(['author', 'category'])->latest();

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('title', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%");
            });
        }

        $books = $query->paginate($perPage);

        return $this->successResponse(
            \App\Http\Resources\BookResource::collection($books)->response()->getData(true),
            'Category books retrieved successfully.'
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
