<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Author extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'country', 'bio', 'image_path'];

    public function books()
    {
        return $this->hasMany(Book::class);
    }
}
