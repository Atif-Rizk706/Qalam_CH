<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Author extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'country',
        'country_id',
        'bio',
        'image_path',
        'is_contemporary',
        'death_year',
        'birth_year',
    ];

    protected $casts = [
        'is_contemporary' => 'boolean',
    ];

    protected $appends = [
        'life_status',
    ];

    public function getLifeStatusAttribute(): string
    {
        if ($this->is_contemporary) {
            return 'معاصر';
        }

        if (!empty($this->death_year)) {
            return "متوفي سنة {$this->death_year}";
        }

        return 'متوفي';
    }

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function books()
    {
        return $this->hasMany(Book::class);
    }
}
