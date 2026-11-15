<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

trait FileUpload
{
    /**
     * Upload a file directly.
     *
     * @param \Illuminate\Http\UploadedFile|null $file
     * @param string $folder
     * @param string $disk
     * @return string|null
     */
    public function uploadFile(?UploadedFile $file, string $folder = 'uploads', string $disk = 'public'): ?string
    {
        if ($file) {
            return $file->store($folder, $disk);
        }

        return null;
    }

    /**
     * Upload a file and compress it into a ZIP archive to reduce storage space.
     *
     * @param \Illuminate\Http\UploadedFile|null $file
     * @param string $folder
     * @param string $disk
     * @return string|null
     */
    public function uploadAndCompressFile(?UploadedFile $file, string $folder = 'books', string $disk = 'public'): ?string
    {
        if (!$file) {
            return null;
        }

        // Try zip compression only if ZipArchive extension is available
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
                        return $relativeZipPath;
                    }
                }
            } catch (\Throwable $e) {
                // If zip compression fails for any reason, cleanly fallback to normal upload
            }
        }

        // Fallback to standard direct upload
        return $file->store($folder, $disk);
    }

    /**
     * Delete a file from storage.
     *
     * @param string|null $path
     * @param string $disk
     * @return bool
     */
    public function deleteFile(?string $path, string $disk = 'public'): bool
    {
        if ($path && Storage::disk($disk)->exists($path)) {
            return Storage::disk($disk)->delete($path);
        }

        return false;
    }
}
