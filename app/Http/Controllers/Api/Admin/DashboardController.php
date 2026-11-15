<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\Article;
use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use App\Models\Contact;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $booksCount = Book::count();
        $authorsCount = Author::count();
        $categoriesCount = Category::count();
        $usersCount = User::count();
        $adsCount = Advertisement::count();
        $contactsCount = Contact::count();
        $totalViews = (int) Book::sum('views_count');

        // Also count articles if the model exists
        $articlesCount = 0;
        if (class_exists(\App\Models\Article::class)) {
            $articlesCount = \App\Models\Article::count();
        }
        $recentBooks = Book::with(['author:id,name', 'category:id,name'])
            ->latest()
            ->take(5)
            ->get();

        $mostReadBooks = Book::with(['author:id,name', 'category:id,name'])
            ->orderByDesc('views_count')
            ->take(5)
            ->get();

        $recentUsers = User::select('id', 'name', 'email', 'created_at')
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                // flat keys — matches what Dashboard.jsx reads
                'books_count' => $booksCount,
                'authors_count' => $authorsCount,
                'categories_count' => $categoriesCount,
                'articles_count' => $articlesCount,
                'users_count' => $usersCount,
                'ads_count' => $adsCount,
                'contacts_count' => $contactsCount,
                'total_book_views' => $totalViews,
                // nested for backward compat
                'counts' => [
                    'books' => $booksCount,
                    'authors' => $authorsCount,
                    'categories' => $categoriesCount,
                    'articles' => $articlesCount,
                    'users' => $usersCount,
                    'advertisements' => $adsCount,
                    'contact_messages' => $contactsCount,
                    'total_book_views' => $totalViews,
                ],
                'recent_books' => $recentBooks,
                'most_read_books' => $mostReadBooks,
                'recent_users' => $recentUsers,
            ],
        ]);
    }
}
