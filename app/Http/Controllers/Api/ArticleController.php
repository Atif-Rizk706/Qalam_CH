<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Http\Resources\ArticleTypeResource;
use App\Models\Article;
use App\Models\ArticleType;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ArticleController extends Controller
{
    use ApiResponse;

    /**
     * List all published articles with optional filters.
     */
    public function index(Request $request)
    {
        $query = Article::with(['author', 'type'])
            ->published()
            ->latest('published_at');

        // Filter by type slug
        if ($request->filled('type')) {
            $query->whereHas('type', fn($q) => $q->where('slug', $request->type));
        }

        // Search by title or short_description
        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(fn($q) => $q->where('title', 'like', "%{$term}%")
                ->orWhere('short_description', 'like', "%{$term}%"));
        }

        $articles = $query->paginate((int) $request->input('per_page', 15));

        return $this->successResponse(
            ArticleResource::collection($articles)->response()->getData(true),
            'Articles retrieved successfully'
        );
    }

    /**
     * Show a single published article and increment views.
     */
    public function show($id)
    {
        $article = Article::with(['author', 'type'])
            ->published()
            ->findOrFail($id);

        $article->increment('views_count');

        // Fetch related articles by the same type (excluding current article)
        if ($article->type_id) {
            $relatedArticles = Article::with(['author', 'type'])
                ->published()
                ->where('id', '!=', $article->id)
                ->where('type_id', $article->type_id)
                ->latest('published_at')
                ->take(6)
                ->get();

            $article->setRelation('related_articles', $relatedArticles);
        }

        return $this->successResponse(new ArticleResource($article), 'Article retrieved successfully');
    }

    /**
     * Increment read count explicitly (called when user opens the file/reads the article).
     */
    public function recordRead($id)
    {
        $article = Article::published()->findOrFail($id);
        $article->increment('views_count');

        return $this->successResponse([
            'article_id'  => $article->id,
            'views_count' => $article->views_count,
        ], 'Article read count incremented successfully');
    }

    /**
     * List all article types.
     */
    public function types()
    {
        return $this->successResponse(
            ArticleTypeResource::collection(ArticleType::orderBy('name')->get()),
            'Article types retrieved successfully'
        );
    }

    /**
     * Get latest published articles.
     */
    public function latest()
    {
        $articles = Article::with(['author', 'type'])
            ->published()
            ->latest('published_at')
            ->take(10)
            ->get();

        return $this->successResponse(ArticleResource::collection($articles), 'Latest articles retrieved successfully');
    }

    /**
     * Get most read articles.
     */
    public function mostRead()
    {
        $limit = request()->input('limit', 10);
        $articles = Article::with(['author', 'type'])
            ->published()
            ->orderByDesc('views_count')
            ->take($limit)
            ->get();

        return $this->successResponse(ArticleResource::collection($articles), 'Most read articles retrieved successfully');
    }
}

