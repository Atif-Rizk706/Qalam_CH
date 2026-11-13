<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'display_name',
        'group',
        'type',
    ];

    /**
     * Retrieve a setting value by key with optional fallback.
     */
    public static function get(string $key, $default = null): ?string
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Set/update a setting value by key.
     */
    public static function set(string $key, $value, ?string $displayName = null, ?string $group = null, ?string $type = null): self
    {
        $data = ['value' => $value];

        if ($displayName !== null) {
            $data['display_name'] = $displayName;
        }
        if ($group !== null) {
            $data['group'] = $group;
        }
        if ($type !== null) {
            $data['type'] = $type;
        }

        return static::updateOrCreate(['key' => $key], $data);
    }

    /**
     * Get all settings as a key => value map.
     */
    public static function asMap(): array
    {
        return static::pluck('value', 'key')->toArray();
    }
}

