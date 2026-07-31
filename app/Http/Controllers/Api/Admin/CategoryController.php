<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Traits\ApiResponse;
use App\Http\Resources\CategoryResource;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Category::withCount('books')->latest();

        // تفعيل ميزة البحث إذا تم تمرير كلمة بحث في الرابط (?search=...)
        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;

            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('slug', 'like', "%{$searchTerm}%");
            });
        }

        $categories = $query->paginate(15);

        return $this->successResponse(
            CategoryResource::collection($categories)->response()->getData(true),
            'Categories retrieved successfully',
            200
        );
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:categories,slug',
            'icon_path' => 'nullable|string',
        ]);

        $category = Category::create($validated);

        return $this->successResponse(new CategoryResource($category), 'Category created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:categories,slug,' . $category->id,
            'icon_path' => 'nullable|string',
        ]);

        $category->update($validated);

        return $this->successResponse(new CategoryResource($category), 'Category updated successfully', 200);
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete(); // إذا كان هناك SoftDeletes سيتم أرشفته، وإلا سيحذف نهائياً

        return $this->successResponse(null, 'Category deleted successfully', 200);
    }

    // ==========================================
    // 2. سلة المهملات (Archived / Restore)
    // (استخدمها فقط إذا كنت مفعل الـ SoftDeletes في موديل Category)
    // ==========================================

    public function archived()
    {
        $archivedCategories = Category::onlyTrashed()->get();

        return $this->successResponse(
            CategoryResource::collection($archivedCategories),
            'Archived categories retrieved successfully',
            200
        );
    }

    public function restore($id)
    {
        $category = Category::onlyTrashed()->findOrFail($id);
        $category->restore();

        return $this->successResponse(
            new CategoryResource($category),
            'Category restored successfully',
            200
        );
    }
    public function show($id)
    {
        $category = Category::findOrFail($id);

        return $this->successResponse(
            new CategoryResource($category),
            'Category retrieved successfully',
            200
        );
    }
}
