<?php

namespace App\Exceptions;

use Exception;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ApiException extends Exception
{
    use ApiResponse;

    protected $message;
    protected $code;
    protected $errors;

    /**
     * Create a new custom exception instance.
     *
     * @param string $message
     * @param int $code
     * @param mixed $errors
     */
    public function __construct($message = "An error occurred.", $code = 400, $errors = null)
    {
        parent::__construct($message, $code);
        $this->message = $message;
        $this->code = $code;
        $this->errors = $errors;
    }

    /**
     * Render the exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function render($request): JsonResponse
    {
        return $this->errorResponse($this->message, $this->code, $this->errors);
    }
}
