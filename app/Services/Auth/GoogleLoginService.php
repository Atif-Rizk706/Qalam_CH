<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Exceptions\ApiException;
use App\Interfaces\AuthServiceInterface;
use Laravel\Socialite\Facades\Socialite;
use Exception;

class GoogleLoginService implements AuthServiceInterface
{
    /**
     * Login user using Google Access Token.
     *
     * @param array $data
     * @return array
     * @throws ApiException
     */
    public function login(array $data)
    {
        if (empty($data['token'])) {
            throw new ApiException('Google token is required.', 400);
        }

        try {
            // Verify token with Google
            $googleUser = Socialite::driver('google')->stateless()->userFromToken($data['token']);
        } catch (Exception $e) {
            throw new ApiException('Invalid Google token.', 401);
        }

        // Find or create user
        $user = User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            // If user exists but doesn't have google_id, update it
            if (!$user->google_id) {
                $user->update(['google_id' => $googleUser->getId()]);
            }
        } else {
            // Create new user
            $user = User::create([
                'name' => $googleUser->getName(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'password' => null, // No password for Google users
            ]);
        }

        // Create token
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }
}
