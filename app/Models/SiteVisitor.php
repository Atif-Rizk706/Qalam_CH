<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteVisitor extends Model
{
    use HasFactory;

    protected $fillable = [
        'ip_address',
        'country_id',
        'user_agent',
        'visits_count',
        'last_visited_at',
    ];

    protected $casts = [
        'last_visited_at' => 'datetime',
        'visits_count' => 'integer',
    ];

    public function country()
    {
        return $this->belongsTo(Country::class);
    }
}

