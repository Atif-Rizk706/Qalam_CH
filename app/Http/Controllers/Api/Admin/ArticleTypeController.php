<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleTypeResource;
use App\Models\ArticleType;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ArticleTypeController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->successResponse(
            ArticleTypeResource::collection(ArticleType::orderBy('name')->get()),
            'Article types retrieved successfully'
        );
    }

    public function show($id)
    {
        return $this->successResponse(
            new ArticleTypeResource(ArticleType::findOrFail($id)),
            'Article type retrieved successfully'
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'required|string|unique:article_types,slug|max:100',
        ]);

        $type = ArticleType::create($validated);

        return $this->successResponse(new ArticleTypeResource($type), 'Article type created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $type = ArticleType::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'slug' => 'sometimes|string|unique:article_types,slug,' . $type->id . '|max:100',
        ]);

        $type->update($validated);

        return $this->successResponse(new ArticleTypeResource($type), 'Article type updated successfully');
    }

    public function destroy($id)
    {
        $type = ArticleType::findOrFail($id);
        $type->delete();

        return $this->successResponse(null, 'Article type deleted successfully');
    }
}

