<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Traits\ApiResponse;
use App\Traits\FileUpload;
use App\Http\Resources\AuthorResource;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    use ApiResponse, FileUpload;

    public function index(Request $request)
    {
        $query = Author::with('country')->latest();

        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('slug', 'like', "%{$searchTerm}%")
                  ->orWhere('country', 'like', "%{$searchTerm}%")
                  ->orWhere('death_year', 'like', "%{$searchTerm}%")
                  ->orWhereHas('country', function ($cq) use ($searchTerm) {
                      $cq->where('name_ar', 'like', "%{$searchTerm}%")
                        ->orWhere('name_en', 'like', "%{$searchTerm}%");
                  });
            });
        }

        if ($request->has('is_contemporary')) {
            $query->where('is_contemporary', $request->boolean('is_contemporary'));
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
        $author = Author::with('country')->findOrFail($id);

        return $this->successResponse(
            new AuthorResource($author),
            'Author retrieved successfully',
            200
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'slug'           => 'required|string|unique:authors,slug',
            'country'        => 'nullable|string',
            'country_id'     => 'nullable|exists:countries,id',
            'bio'            => 'nullable|string',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'image_path'     => 'nullable|string',
            'is_contemporary'=> 'nullable|boolean',
            'death_year'     => 'nullable|string|max:50',
            'birth_year'     => 'nullable|string|max:50',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $this->uploadFile($request->file('image'), 'images');
        }

        unset($validated['image']);

        $author = Author::create($validated);
        $author->load('country');

        return $this->successResponse(new AuthorResource($author), 'Author created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $author = Author::findOrFail($id);

        $validated = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'slug'           => 'sometimes|string|unique:authors,slug,' . $author->id,
            'country'        => 'nullable|string',
            'country_id'     => 'nullable|exists:countries,id',
            'bio'            => 'nullable|string',
            'image'          => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'image_path'     => 'nullable|string',
            'is_contemporary'=> 'nullable|boolean',
            'death_year'     => 'nullable|string|max:50',
            'birth_year'     => 'nullable|string|max:50',
        ]);

        if ($request->hasFile('image')) {
            // حذف الصورة القديمة إن وجدت
            if ($author->image_path) {
                $this->deleteFile($author->image_path);
            }
            $validated['image_path'] = $this->uploadFile($request->file('image'), 'images');
        }

        unset($validated['image']);

        $author->update($validated);
        $author->load('country');

        return $this->successResponse(new AuthorResource($author), 'Author updated successfully', 200);
    }

    public function destroy($id)
    {
        $author = Author::findOrFail($id);
        $author->delete();

        return $this->successResponse(null, 'Author deleted successfully', 200);
    }
}
