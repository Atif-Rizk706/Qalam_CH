<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

use App\Traits\ApiResponse;

class AuthController extends Controller
{
    use ApiResponse;
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $admin = Admin::where('username', $request->username)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return $this->errorResponse('Invalid credentials', 401);
        }

        $token = $admin->createToken('admin-token', ['admin'])->plainTextToken;

        return $this->successResponse(
            ['token' => $token, 'admin' => $admin],
            'Logged in successfully',
            200
        );
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Logged out successfully', 200);
    }
}
