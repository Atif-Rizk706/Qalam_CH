<?php

namespace Database\Seeders;

use App\Models\ArticleType;
use Illuminate\Database\Seeder;

class ArticleTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'مقال',    'slug' => 'article'],
            ['name' => 'دراسة',   'slug' => 'study'],
            ['name' => 'تأمل',    'slug' => 'meditation'],
            ['name' => 'خطبة',    'slug' => 'sermon'],
            ['name' => 'قصيدة',   'slug' => 'poem'],
            ['name' => 'مقابلة',  'slug' => 'interview'],
        ];

        foreach ($types as $type) {
            ArticleType::updateOrCreate(['slug' => $type['slug']], $type);
        }

        $this->command?->info('Article types seeded: ' . count($types));
    }
}

