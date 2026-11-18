<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Traits\ApiResponse;
use App\Http\Resources\AdminResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Admin::latest();

        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('email', 'like', "%{$searchTerm}%");
            });
        }

        $admins = $query->paginate(15);

        return $this->successResponse(
            AdminResource::collection($admins)->response()->getData(true),
            'Admins retrieved successfully',
            200
        );
    }

    public function show($id)
    {
        $admin = Admin::findOrFail($id);

        return $this->successResponse(
            new AdminResource($admin),
            'Admin retrieved successfully',
            200
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:admins,email',
            'username' => 'nullable|string|max:255|unique:admins,username',
            'password' => 'required|string|min:6',
        ]);

        if (empty($validated['username'])) {
            $validated['username'] = explode('@', $validated['email'])[0] . '_' . rand(100, 999);
        }

        $validated['password'] = Hash::make($validated['password']);

        $admin = Admin::create($validated);

        return $this->successResponse(new AdminResource($admin), 'Admin created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $admin = Admin::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:admins,email,' . $admin->id,
            'username' => 'nullable|string|max:255|unique:admins,username,' . $admin->id,
            'password' => 'nullable|string|min:6',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $admin->update($validated);

        return $this->successResponse(new AdminResource($admin), 'Admin updated successfully', 200);
    }

    public function destroy($id)
    {
        $admin = Admin::findOrFail($id);
        $admin->delete();

        return $this->successResponse(null, 'Admin deleted successfully', 200);
    }
}
