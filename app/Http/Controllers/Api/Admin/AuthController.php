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
            'email' => 'nullable|string',
            'username' => 'nullable|string',
            'login' => 'nullable|string',
            'password' => 'required|string',
        ]);

        $loginIdentifier = $request->input('email') 
            ?? $request->input('username') 
            ?? $request->input('login');

        if (!$loginIdentifier) {
            return $this->errorResponse('البريد الإلكتروني أو اسم المستخدم مطلوب', 422);
        }

        $admin = Admin::where('email', $loginIdentifier)
            ->orWhere('username', $loginIdentifier)
            ->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return $this->errorResponse('بيانات الدخول غير صحيحة', 401);
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
