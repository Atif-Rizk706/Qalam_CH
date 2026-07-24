<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Exceptions\ApiException;
use App\Interfaces\AuthServiceInterface;

class GeneralLoginService implements AuthServiceInterface
{
    /**
     * Login user using email and password.
     *
     * @param array $data
     * @return array
     * @throws ApiException
     */
    public function login(array $data)
    {
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw new ApiException('Invalid credentials.', 401);
        }

        // Create token
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }
}
