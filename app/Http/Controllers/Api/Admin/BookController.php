<?php

namespace App\Http\Controllers\Api\Admin;

use Illuminate\Support\Str;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Traits\FileUpload;
use App\Traits\ApiResponse;
use App\Http\Resources\BookResource;
use Illuminate\Http\Request;

class BookController extends Controller
{
    use FileUpload, ApiResponse;

    // ==========================================
    // 1. الأساسيات (Full CRUD)
    // ==========================================

    public function index(Request $request)
    {
        $query = Book::with(['author', 'category'])->latest();

        // تفعيل ميزة البحث إذا تم تمرير كلمة بحث في الرابط (?search=...)
        if ($request->has('search') && $request->search != '') {
            $searchTerm = $request->search;

            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")
                    ->orWhere('slug', 'like', "%{$searchTerm}%")
                    // البحث داخل اسم المؤلف أيضاً (عن طريق العلاقة)
                    ->orWhereHas('author', function ($authorQuery) use ($searchTerm) {
                        $authorQuery->where('name', 'like', "%{$searchTerm}%");
                    });
            });
        }

        // فلترة بالقسم / التصنيف (سواء بالإيدي أو الـ slug)
        if ($request->filled('category_id')) {
            $categoryIds = is_array($request->category_id)
                ? $request->category_id
                : explode(',', $request->category_id);
            $query->whereIn('category_id', $categoryIds);
        } elseif ($request->filled('category')) {
            $cat = $request->category;
            $query->whereHas('category', function ($cq) use ($cat) {
                if (is_numeric($cat)) {
                    $cq->where('id', $cat);
                } else {
                    $cq->where('slug', $cat)->orWhere('name', $cat);
                }
            });
        }

        // فلترة بالمؤلف (بالإيدي أو slug أو الاسم)
        if ($request->filled('author_id')) {
            $authorIds = is_array($request->author_id)
                ? $request->author_id
                : explode(',', $request->author_id);
            $query->whereIn('author_id', $authorIds);
        } elseif ($request->filled('author')) {
            $auth = $request->author;
            $query->whereHas('author', function ($aq) use ($auth) {
                if (is_numeric($auth)) {
                    $aq->where('id', $auth);
                } else {
                    $aq->where('slug', $auth)->orWhere('name', 'like', "%{$auth}%");
                }
            });
        }

        $perPage = (int) $request->input('per_page', 15);
        $books = $query->paginate($perPage);

        return $this->successResponse(
            BookResource::collection($books)->response()->getData(true),
            'Books retrieved successfully',
            200
        );
    }

    public function show($id)
    {
        $book = Book::with(['author', 'category'])->findOrFail($id);

        return $this->successResponse(
            new BookResource($book),
            'Book retrieved successfully',
            200
        );
    }

    public function store(Request $request)
    {
        // Auto-generate slug from title if not provided
        if (empty($request->slug) && $request->filled('title')) {
            $baseSlug = 'book-' . time() . '-' . \Str::random(6);
            $request->merge(['slug' => $baseSlug]);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:books,slug',
            'description' => 'nullable|string',
            'author_id' => 'required|exists:authors,id',
            'category_id' => 'required|exists:categories,id',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'cover_image_path' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,epub,doc,docx,txt|max:51200',
            'file_path' => 'nullable|string',
            'views_count' => 'integer',
            'is_book_of_the_day' => 'boolean',
            'is_suggested' => 'boolean',
            'compress_file' => 'boolean',
        ]);

        $uploadedPaths = [];

        try {
            // تأكد من المساحة للملفين مع بعض قبل أي رفع
            $incoming = 0;
            if ($request->hasFile('file')) {
                $incoming += $request->file('file')->getSize();
            }
            if ($request->hasFile('cover_image')) {
                $incoming += $request->file('cover_image')->getSize();
            }
            $this->ensureEnoughStorage($incoming);

            // Upload book file directly without archiving/compressing
            if ($request->hasFile('file')) {
                $path = $this->uploadFile($request->file('file'), 'books');

                $validated['file_path'] = $path;
                $uploadedPaths[] = $path;
            }

            // Upload cover image
            if ($request->hasFile('cover_image')) {
                $path = $this->uploadFile($request->file('cover_image'), 'covers');

                $validated['cover_image_path'] = $path;
                $uploadedPaths[] = $path;
            }

            $book = Book::create($validated);
        } catch (\RuntimeException $e) {
            // مفيش حاجة اترفعت لسه في الحالة دي، بس نمسح احتياطي
            foreach ($uploadedPaths as $p) {
                $this->deleteFile($p);
            }

            return response()->json(['message' => $e->getMessage()], 507);
        } catch (\Throwable $e) {
            // أي خطأ تاني: امسح الملفات اللي اتحفظت عشان ماتتبقاش يتيمة
            foreach ($uploadedPaths as $p) {
                $this->deleteFile($p);
            }

            throw $e;
        }

        return $this->successResponse(
            new BookResource($book),
            'Book created successfully',
            201
        );
    }

    public function update(Request $request, $id)
    {
        $book = Book::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:books,slug,' . $book->id,
            'description' => 'nullable|string',
            'author_id' => 'sometimes|exists:authors,id',
            'category_id' => 'sometimes|exists:categories,id',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'cover_image_path' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,epub,doc,docx,txt|max:51200',
            'file_path' => 'nullable|string',
            'views_count' => 'integer',
            'is_book_of_the_day' => 'boolean',
            'is_suggested' => 'boolean',
            'compress_file' => 'boolean',
        ]);

        $newPaths = [];      // ملفات جديدة اترفعت (نمسحها لو حصل خطأ)
        $oldPaths = [];      // ملفات قديمة (نمسحها بعد النجاح)

        try {
            // تأكد من المساحة للملفين مع بعض قبل أي رفع
            $incoming = 0;
            if ($request->hasFile('file')) {
                $incoming += $request->file('file')->getSize();
            }
            if ($request->hasFile('cover_image')) {
                $incoming += $request->file('cover_image')->getSize();
            }
            if ($incoming > 0) {
                $this->ensureEnoughStorage($incoming);
            }

            // Book file (uploaded directly without archiving)
            if ($request->hasFile('file')) {
                $path = $this->uploadFile($request->file('file'), 'books');

                $validated['file_path'] = $path;
                $newPaths[] = $path;

                if ($book->file_path) {
                    $oldPaths[] = $book->file_path;
                }
            }

            // Cover image
            if ($request->hasFile('cover_image')) {
                $path = $this->uploadFile($request->file('cover_image'), 'covers');

                $validated['cover_image_path'] = $path;
                $newPaths[] = $path;

                if ($book->cover_image_path) {
                    $oldPaths[] = $book->cover_image_path;
                }
            }

            $book->update($validated);
        } catch (\RuntimeException $e) {
            foreach ($newPaths as $p) {
                $this->deleteFile($p);
            }

            return response()->json(['message' => $e->getMessage()], 507);
        } catch (\Throwable $e) {
            foreach ($newPaths as $p) {
                $this->deleteFile($p);
            }

            throw $e;
        }

        // التحديث نجح: دلوقتي نمسح الملفات القديمة
        foreach ($oldPaths as $p) {
            $this->deleteFile($p);
        }

        return $this->successResponse(
            new BookResource($book->fresh()),
            'Book updated successfully',
            200
        );
    }

    public function destroy($id)
    {
        $book = Book::findOrFail($id);
        $book->delete(); // Soft delete / archive

        return $this->successResponse(null, 'Book archived successfully', 200);
    }

    // ==========================================
    // 2. سلة المهملات (Archived / Restore)
    // ==========================================

    public function archived(Request $request)
    {
        $perPage = (int) $request->input('per_page', 15);
        $archivedBooks = Book::onlyTrashed()->with(['author', 'category'])->latest()->paginate($perPage);

        return $this->successResponse(
            BookResource::collection($archivedBooks)->response()->getData(true),
            'Archived books retrieved successfully',
            200
        );
    }

    public function restore($id)
    {
        $book = Book::onlyTrashed()->findOrFail($id);
        $book->restore();

        return $this->successResponse(new BookResource($book), 'Book restored successfully', 200);
    }

    // ==========================================
    // 3. كتاب اليوم والمقترحات (Endpoints منفصلة)
    // ==========================================

    // جلب كتاب اليوم الحالي
    public function bookOfTheDay()
    {
        $book = Book::where('is_book_of_the_day', true)->with(['author', 'category'])->first();

        return $this->successResponse(
            $book ? new BookResource($book) : null,
            'Book of the day retrieved',
            200
        );
    }

    // تعيين كتاب كـ "كتاب اليوم" (وإلغاء الباقي لتجنب وجود أكثر من كتاب)
    public function setBookOfTheDay($id)
    {
        $book = Book::findOrFail($id);

        // إزالة حالة "كتاب اليوم" من كل الكتب الأخرى
        Book::where('is_book_of_the_day', true)->update(['is_book_of_the_day' => false]);

        // تفعيلها للكتاب المطلوب
        $book->update(['is_book_of_the_day' => true]);

        return $this->successResponse(new BookResource($book), 'Book set as Book of the Day successfully', 200);
    }

    // جلب الكتب المقترحة
    public function suggestedBooks(Request $request)
    {
        $perPage = (int) $request->input('per_page', 15);
        $books = Book::where('is_suggested', true)->with(['author', 'category'])->latest()->paginate($perPage);

        return $this->successResponse(
            BookResource::collection($books)->response()->getData(true),
            'Suggested books retrieved',
            200
        );
    }

    // تفعيل/إلغاء تفعيل حالة "مقترح" لكتاب معين
    public function toggleSuggested($id)
    {
        $book = Book::findOrFail($id);
        $book->update(['is_suggested' => !$book->is_suggested]);

        $status = $book->is_suggested ? 'added to' : 'removed from';

        return $this->successResponse(new BookResource($book), "Book $status suggested list successfully", 200);
    }
}