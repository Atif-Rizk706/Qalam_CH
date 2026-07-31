<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// Public Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Library Routes (Requires Auth)
    Route::post('/library/favorites', [\App\Http\Controllers\Api\LibraryController::class, 'toggleFavorite']);
    Route::post('/library/shelf', [\App\Http\Controllers\Api\LibraryController::class, 'toggleShelf']);
    Route::post('/library/history', [\App\Http\Controllers\Api\LibraryController::class, 'recordHistory']);
    Route::get('/library', [\App\Http\Controllers\Api\LibraryController::class, 'getUserLibrary']);

    // Ratings
    Route::post('/ratings', [\App\Http\Controllers\Api\RatingController::class, 'store']);
});

// Public Library Routes
Route::apiResource('categories', \App\Http\Controllers\Api\CategoryController::class)->only(['index', 'show']);
Route::apiResource('authors', \App\Http\Controllers\Api\AuthorController::class)->only(['index', 'show']);

Route::get('/books/latest', [\App\Http\Controllers\Api\BookController::class, 'latest']);
Route::get('/books/most-read', [\App\Http\Controllers\Api\BookController::class, 'mostRead']);
Route::get('/books/suggested', [\App\Http\Controllers\Api\BookController::class, 'suggested']);
Route::get('/books/book-of-the-day', [\App\Http\Controllers\Api\BookController::class, 'bookOfTheDay']);
Route::get('/books/loved', [\App\Http\Controllers\Api\BookController::class, 'lovedBooks']); // Popular/Loved books
Route::apiResource('books', \App\Http\Controllers\Api\BookController::class)->only(['index', 'show']);
Route::post('/books/{id}/archive', [\App\Http\Controllers\Api\BookController::class, 'archive']); // Admin route normally, but for now we place it here
Route::post('/books/{id}/restore', [\App\Http\Controllers\Api\BookController::class, 'restore']); // Admin route

Route::post('/contact', [\App\Http\Controllers\Api\ContactController::class, 'store']);

// Public Advertisements Route
Route::get('/advertisements', [\App\Http\Controllers\Api\AdvertisementController::class, 'index']);

// Admin Routes
Route::prefix('admin')->group(function () {
    Route::post('/login', [\App\Http\Controllers\Api\Admin\AuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'ability:admin'])->group(function () {
        Route::post('/logout', [\App\Http\Controllers\Api\Admin\AuthController::class, 'logout']);
        Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\DashboardController::class, 'index']);


        Route::apiResource('authors', \App\Http\Controllers\Api\Admin\AuthorController::class);
        Route::apiResource('categories', \App\Http\Controllers\Api\Admin\CategoryController::class);
        Route::apiResource('advertisements', \App\Http\Controllers\Api\Admin\AdvertisementController::class);
        Route::apiResource('admins', \App\Http\Controllers\Api\Admin\AdminController::class);
        Route::apiResource('users', \App\Http\Controllers\Api\Admin\UserController::class);

        Route::get('/books/book-of-the-day', [\App\Http\Controllers\Api\Admin\BookController::class, 'bookOfTheDay']);
        Route::patch('/books/{id}/set-book-of-the-day', [\App\Http\Controllers\Api\Admin\BookController::class, 'setBookOfTheDay']);

        // مسارات الكتب المقترحة (مفصولة)
        Route::get('/books/suggested', [\App\Http\Controllers\Api\Admin\BookController::class, 'suggestedBooks']);
        Route::patch('/books/{id}/toggle-suggested', [\App\Http\Controllers\Api\Admin\BookController::class, 'toggleSuggested']);

        // مسارات الأرشيف (Soft Deletes)
        Route::get('/books/archived', [\App\Http\Controllers\Api\Admin\BookController::class, 'archived']);
        Route::post('/books/{id}/restore', [\App\Http\Controllers\Api\Admin\BookController::class, 'restore']);

        // مسارات الـ CRUD الأساسية (يجب أن تكون في النهاية لتجنب تداخل مسار المعرف {id})
        Route::apiResource('books', \App\Http\Controllers\Api\Admin\BookController::class);


    });
});
