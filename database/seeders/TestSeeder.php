<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Category;
use App\Models\Author;
use App\Models\Book;
use App\Models\Rating;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminAndAdSeeder::class,
        ]);

        // Seed Users
        $user = User::create([
            "name" => "Test User",
            "email" => "test@example.com",
            "password" => Hash::make("password"),
        ]);

        // Seed Categories
        $cat1 = Category::create(["name" => "كتب روحية", "slug" => "spiritual", "icon_path" => "spiritual.png"]);
        $cat2 = Category::create(["name" => "كتب مترجمة", "slug" => "translated", "icon_path" => "translated.png"]);
        $cat3 = Category::create(["name" => "مقالات", "slug" => "articles", "icon_path" => "articles.png"]);

        // Seed Authors
        $auth1 = Author::create(["name" => "سي. إس. لويس", "slug" => "cs-lewis", "country" => "بريطانيا", "bio" => "مؤلف مسيحي شهير."]);
        $auth2 = Author::create(["name" => "القديس أغسطينوس", "slug" => "st-augustine", "country" => "الإمبراطورية الرومانية", "bio" => "عالم لاهوت وفيلسوف."]);

        // Seed Books
        $book1 = Book::create([
            "title" => "المسيحية المجردة",
            "slug" => "mere-christianity",
            "description" => "كتاب لاهوتي.",
            "author_id" => $auth1->id,
            "category_id" => $cat1->id,
            "views_count" => 150,
            "is_book_of_the_day" => true,
        ]);

        $book2 = Book::create([
            "title" => "الاعترافات",
            "slug" => "confessions",
            "description" => "عمل سيرة ذاتية.",
            "author_id" => $auth2->id,
            "category_id" => $cat1->id,
            "views_count" => 300,
            "is_book_of_the_day" => false,
        ]);

        // Seed Ratings
        Rating::create(["user_id" => $user->id, "book_id" => $book1->id, "rating" => 5, "comment" => "Amazing book!"]);
        Rating::create(["user_id" => $user->id, "book_id" => $book2->id, "rating" => 4, "comment" => "Very deep."]);

        // Seed User Library
        $user->favorites()->attach($book1->id, ["type" => "favorite"]);
        $user->shelf()->attach($book2->id, ["type" => "shelf"]);
    }
}
