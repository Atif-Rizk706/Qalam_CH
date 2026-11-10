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
     * Logout from current device.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Logged out successfully.');
    }

    /**
     * Logout from all devices.
     */
    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();

        return $this->successResponse(null, 'Logged out from all devices successfully.');
    }

    /**
     * Send password reset code (Forgot Password via Email).
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ], [
            'email.exists' => 'No user found with this email address.',
        ]);

        $user = User::where('email', $request->email)->first();
        $code = sprintf("%06d", mt_rand(100000, 999999));

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($code),
                'created_at' => now(),
            ]
        );

        // Send Email with reset code
        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->send(
                new \App\Mail\ResetPasswordCodeMail($code, $user->name)
            );
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Password reset email error: ' . $e->getMessage());
        }

        return $this->successResponse([
            'email' => $request->email,
            'reset_code' => config('app.debug') ? $code : null, // returned only when APP_DEBUG=true for local dev
        ], 'Password reset code has been sent to your email.');
    }

    /**
     * Verify the 6-digit reset code (Step 2 in UI flow).
     */
    public function verifyResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string',
        ]);

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return $this->errorResponse('Invalid or expired reset code.', 422);
        }

        // Check if code expired (60 minutes)
        if (\Carbon\Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return $this->errorResponse('Reset code has expired. Please request a new one.', 422);
        }

        // Validate code
        if (!Hash::check($request->code, $record->token) && $request->code !== $record->token) {
            return $this->errorResponse('Invalid reset code.', 422);
        }

        // Issue a single-use reset_token for the next screen (changing password)
        $resetToken = \Illuminate\Support\Str::random(64);

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'token' => Hash::make($resetToken),
                'created_at' => now(),
            ]
        );

        return $this->successResponse([
            'email' => $request->email,
            'reset_token' => $resetToken,
        ], 'Code verified successfully. You can now reset your password.');
    }

    /**
     * Reset password using verified reset_token (or code).
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Accept either 'reset_token' (recommended after verification) or 'code'
        $tokenInput = $request->input('reset_token') ?? $request->input('code');

        if (!$tokenInput) {
            return $this->errorResponse('Reset token or code is required.', 422);
        }

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return $this->errorResponse('Invalid or expired reset session.', 422);
        }

        // Check if token expired (60 minutes)
        if (\Carbon\Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return $this->errorResponse('Reset session has expired. Please request a new code.', 422);
        }

        // Validate reset token/code
        if (!Hash::check($tokenInput, $record->token) && $tokenInput !== $record->token) {
            return $this->errorResponse('Invalid or already used reset token.', 422);
        }

        $user = User::where('email', $request->email)->first();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Revoke all existing tokens for security
        $user->tokens()->delete();

        // Delete used reset token
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Generate fresh authentication token
        $token = $user->createToken('auth_token')->plainTextToken;

        return $this->successResponse([
            'token' => $token,
            'user' => $user,
        ], 'Password has been reset successfully.');
    }
}
