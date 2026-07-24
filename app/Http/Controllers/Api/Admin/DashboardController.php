<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
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
        $counts = [
            'books' => Book::count(),
            'authors' => Author::count(),
            'categories' => Category::count(),
            'users' => User::count(),
            'advertisements' => Advertisement::count(),
            'contact_messages' => Contact::count(),
            'total_book_views' => (int) Book::sum('views_count'),
        ];

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
                'counts' => $counts,
                'recent_books' => $recentBooks,
                'most_read_books' => $mostReadBooks,
                'recent_users' => $recentUsers,
            ],
        ]);
    }
}
