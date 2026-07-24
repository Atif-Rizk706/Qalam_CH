<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
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

        return response()->json(['message' => 'Author created successfully', 'data' => $author], 201);
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

        return response()->json(['message' => 'Author updated successfully', 'data' => $author]);
    }

    public function destroy($id)
    {
        $author = Author::findOrFail($id);
        $author->delete();

        return response()->json(['message' => 'Author deleted successfully']);
    }
}
