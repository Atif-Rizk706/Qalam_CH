<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Traits\ApiResponse;
use App\Http\Resources\AuthorResource;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Author::latest();

        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('slug', 'like', "%{$searchTerm}%")
                  ->orWhere('country', 'like', "%{$searchTerm}%");
            });
        }

        $authors = $query->paginate(15);

        return $this->successResponse(
            AuthorResource::collection($authors)->response()->getData(true),
            'Authors retrieved successfully',
            200
        );
    }

    public function show($id)
    {
        $author = Author::findOrFail($id);

        return $this->successResponse(
            new AuthorResource($author),
            'Author retrieved successfully',
            200
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:authors,slug',
            'country' => 'nullable|string',
            'bio' => 'nullable|string',
            'image_path' => 'nullable|string',
        ]);

        $author = Author::create($validated);

        return $this->successResponse(new AuthorResource($author), 'Author created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $author = Author::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:authors,slug,' . $author->id,
            'country' => 'nullable|string',
            'bio' => 'nullable|string',
            'image_path' => 'nullable|string',
        ]);

        $author->update($validated);

        return $this->successResponse(new AuthorResource($author), 'Author updated successfully', 200);
    }

    public function destroy($id)
    {
        $author = Author::findOrFail($id);
        $author->delete();

        return $this->successResponse(null, 'Author deleted successfully', 200);
    }
}
