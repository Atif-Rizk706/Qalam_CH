<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use App\Services\Auth\GeneralLoginService;
use App\Services\Auth\GoogleLoginService;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    /**
     * Register a new user with Email/Password.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->successResponse([
            'user' => $user,
            'token' => $token,
        ], 'User registered successfully.');
    }

    /**
     * Login using Email/Password.
     */
    public function login(Request $request, GeneralLoginService $loginService)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $result = $loginService->login($request->only('email', 'password'));

        return $this->successResponse($result, 'Logged in successfully.');
    }

    /**
     * Login using Google token.
     */
    public function googleLogin(Request $request, GoogleLoginService $loginService)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $result = $loginService->login($request->only('token'));

        return $this->successResponse($result, 'Logged in with Google successfully.');
    }

    /**
     * Logout.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Logged out successfully.');
    }
}
