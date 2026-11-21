<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

trait FileUpload
{
    /**
     * الحد الأقصى للمساحة بالبايت (10 جيجا)
     */
    protected function maxStorageBytes(): int
    {
        return 10 * 1024 * 1024 * 1024;
    }

    /**
     * حساب المساحة المستخدمة حاليا على الـ disk.
     * بنخزن النتيجة في الكاش دقيقة عشان الحساب مايبقاش تقيل.
     */
    public function usedStorageBytes(string $disk = 'public_direct'): int
    {
        return Cache::remember("storage_used_{$disk}", 60, function () use ($disk) {
            $size = 0;
            foreach (Storage::disk($disk)->allFiles() as $path) {
                $size += Storage::disk($disk)->size($path);
            }
            return $size;
        });
    }

    /**
     * التأكد إن في مساحة كافية، وإلا يرمي Exception.
     */
    protected function ensureEnoughStorage(int $incomingBytes, string $disk = 'public_direct'): void
    {
        if ($this->usedStorageBytes($disk) + $incomingBytes > $this->maxStorageBytes()) {
            throw new \RuntimeException('تم الوصول للحد الأقصى للمساحة المسموح بها (10 جيجا).');
        }
    }

    protected function clearStorageCache(string $disk = 'public_direct'): void
    {
        Cache::forget("storage_used_{$disk}");
    }

    public function uploadFile(?UploadedFile $file, string $folder = 'uploads', string $disk = 'public_direct'): ?string
    {
        if (!$file) {
            return null;
        }
        //
        $this->ensureEnoughStorage($file->getSize(), $disk);

        $path = $file->store($folder, $disk);
        $this->clearStorageCache($disk);

        return $path;
    }

    public function uploadAndCompressFile(?UploadedFile $file, string $folder = 'books', string $disk = 'public_direct'): ?string
    {
        if (!$file) {
            return null;
        }

        // بنتأكد من المساحة بحجم الملف الأصلي (أسوأ حالة)
        $this->ensureEnoughStorage($file->getSize(), $disk);

        if (class_exists('ZipArchive')) {
            try {
                $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
                $zipFileName = time() . '_' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $originalName) . '.zip';
                $tempPath = sys_get_temp_dir() . '/' . uniqid('compressed_') . '.zip';

                $zip = new ZipArchive();
                if ($zip->open($tempPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
                    $zip->addFile($file->getRealPath(), $file->getClientOriginalName());
                    $zip->close();

                    if (file_exists($tempPath)) {
                        $relativeZipPath = $folder . '/' . $zipFileName;
                        Storage::disk($disk)->put($relativeZipPath, file_get_contents($tempPath));
                        @unlink($tempPath);
                        $this->clearStorageCache($disk);
                        return $relativeZipPath;
                    }
                }
            } catch (\Throwable $e) {
                // لو الضغط فشل نكمل برفع عادي
            }
        }

        $path = $file->store($folder, $disk);
        $this->clearStorageCache($disk);

        return $path;
    }

    public function deleteFile(?string $path, string $disk = 'public_direct'): bool
    {
        if ($path && Storage::disk($disk)->exists($path)) {
            $deleted = Storage::disk($disk)->delete($path);
            $this->clearStorageCache($disk);
            return $deleted;
        }

        return false;
    }

    /**
     * Format a stored file path to an absolute public URL.
     */
    public function formatUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        if (file_exists(public_path($path))) {
            return asset($path);
        }

        if (str_starts_with($path, 'storage/')) {
            return asset($path);
        }

        return asset('storage/' . ltrim($path, '/'));
    }
}