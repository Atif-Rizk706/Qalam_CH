<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Article extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'short_description',
        'body',
        'excerpt',
        'cover_image_path',
        'read_time',
        'views_count',
        'is_published',
        'published_at',
        'author_id',
        'type_id',
    ];

    protected $casts = [
        'is_published'  => 'boolean',
        'published_at'  => 'datetime',
        'views_count'   => 'integer',
        'read_time'     => 'integer',
    ];

    // ---- Relations ----

    public function author()
    {
        return $this->belongsTo(Author::class);
    }

    public function type()
    {
        return $this->belongsTo(ArticleType::class, 'type_id');
    }

    // ---- Scopes ----

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}

