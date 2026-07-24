<?php

namespace App\Interfaces;

interface AuthServiceInterface
{
    /**
     * Handle the login logic.
     *
     * @param array $data
     * @return mixed
     */
    public function login(array $data);
}
