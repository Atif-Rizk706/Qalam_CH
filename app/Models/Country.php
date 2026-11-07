<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name_en',
        'name_ar',
        'flag_emoji',
        'flag_url',
    ];

    public function authors()
    {
        return $this->hasMany(Author::class);
    }

    public function visitors()
    {
        return $this->hasMany(SiteVisitor::class);
    }
}

