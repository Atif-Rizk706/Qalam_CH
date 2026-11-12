<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// Public Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/verify-reset-code', [AuthController::class, 'verifyResetCode']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Profile Routes
    Route::get('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'show']);
    Route::put('/profile', [\App\Http\Controllers\Api\ProfileController::class, 'update']);
    Route::put('/profile/password', [\App\Http\Controllers\Api\ProfileController::class, 'updatePassword']);

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
Route::get('/categories/{id}/books', [\App\Http\Controllers\Api\CategoryController::class, 'books']);
Route::apiResource('authors', \App\Http\Controllers\Api\AuthorController::class)->only(['index', 'show']);
Route::get('/countries', [\App\Http\Controllers\Api\CountryController::class, 'index']);
Route::get('/countries/{id}', [\App\Http\Controllers\Api\CountryController::class, 'show']);

// Visitor Tracking & Analytics
Route::post('/track-visit', [\App\Http\Controllers\Api\VisitorController::class, 'track']);
Route::get('/analytics/visitors', [\App\Http\Controllers\Api\VisitorController::class, 'stats']);

Route::get('/books/latest', [\App\Http\Controllers\Api\BookController::class, 'latest']);
Route::get('/books/most-read', [\App\Http\Controllers\Api\BookController::class, 'mostRead']);
Route::post('/books/{id}/read', [\App\Http\Controllers\Api\BookController::class, 'recordRead']);
Route::get('/books/suggested', [\App\Http\Controllers\Api\BookController::class, 'suggested']);
Route::get('/books/book-of-the-day', [\App\Http\Controllers\Api\BookController::class, 'bookOfTheDay']);
Route::get('/books/loved', [\App\Http\Controllers\Api\BookController::class, 'lovedBooks']); // Popular/Loved books
Route::apiResource('books', \App\Http\Controllers\Api\BookController::class)->only(['index', 'show']);
Route::post('/books/{id}/archive', [\App\Http\Controllers\Api\BookController::class, 'archive']); // Admin route normally, but for now we place it here
Route::post('/books/{id}/restore', [\App\Http\Controllers\Api\BookController::class, 'restore']); // Admin route

Route::post('/contact', [\App\Http\Controllers\Api\ContactController::class, 'store']);

// Public Advertisements Route
Route::get('/advertisements', [\App\Http\Controllers\Api\AdvertisementController::class, 'index']);

// Public Articles Routes
Route::get('/article-types', [\App\Http\Controllers\Api\ArticleController::class, 'types']);
Route::get('/articles/latest', [\App\Http\Controllers\Api\ArticleController::class, 'latest']);
Route::get('/articles/most-read', [\App\Http\Controllers\Api\ArticleController::class, 'mostRead']);
Route::get('/articles', [\App\Http\Controllers\Api\ArticleController::class, 'index'])->name('articles.index');
Route::get('/articles/{id}', [\App\Http\Controllers\Api\ArticleController::class, 'show'])->name('articles.show');
Route::post('/articles/{id}/read', [\App\Http\Controllers\Api\ArticleController::class, 'recordRead']);

// Admin Routes
Route::prefix('admin')->group(function () {
    Route::post('/login', [\App\Http\Controllers\Api\Admin\AuthController::class, 'login']);

    Route::middleware(['auth:sanctum', 'ability:admin'])->group(function () {
        Route::post('/logout', [\App\Http\Controllers\Api\Admin\AuthController::class, 'logout']);
        Route::get('/dashboard', [\App\Http\Controllers\Api\Admin\DashboardController::class, 'index']);
        Route::get('/analytics/visitors', [\App\Http\Controllers\Api\VisitorController::class, 'stats']);
        Route::post('/countries/sync', [\App\Http\Controllers\Api\CountryController::class, 'sync']);


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

        // ======= Articles Admin Routes =======
        // Article Types CRUD
        Route::apiResource('article-types', \App\Http\Controllers\Api\Admin\ArticleTypeController::class);

        // Articles - special routes BEFORE apiResource
        Route::get('/articles/archived', [\App\Http\Controllers\Api\Admin\ArticleController::class, 'archived']);
        Route::post('/articles/{id}/restore', [\App\Http\Controllers\Api\Admin\ArticleController::class, 'restore']);
        Route::delete('/articles/{id}/force', [\App\Http\Controllers\Api\Admin\ArticleController::class, 'forceDelete']);
        Route::patch('/articles/{id}/toggle-publish', [\App\Http\Controllers\Api\Admin\ArticleController::class, 'togglePublish']);
        // Articles CRUD
        Route::apiResource('articles', \App\Http\Controllers\Api\Admin\ArticleController::class)->names([
            'show' => 'admin.articles.show',
        ]);


    });
});
