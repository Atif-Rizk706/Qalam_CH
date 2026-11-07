<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use App\Http\Resources\AuthorResource;

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
        $author = Author::with(['country', 'books'])->findOrFail($id);
        return $this->successResponse(new AuthorResource($author), 'Author retrieved successfully.');
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
