<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['category' => 'Undangan', 'direction' => 'Masuk', 'icon_path' => 'category-icon/2.webp'],
            ['category' => 'Undangan', 'direction' => 'Keluar', 'icon_path' => 'category-icon/2.webp'],
            ['category' => 'Telegram Biasa', 'direction' => 'Masuk', 'icon_path' => 'category-icon/4.webp'],
            ['category' => 'Telegram Biasa', 'direction' => 'Keluar', 'icon_path' => 'category-icon/4.webp'],
            ['category' => 'Telegram Rahasia', 'direction' => 'Masuk', 'icon_path' => 'category-icon/6.webp'],
            ['category' => 'Telegram Rahasia', 'direction' => 'Keluar', 'icon_path' => 'category-icon/6.webp'],
        ];

        DB::table('categories')->insert($categories);
    }
}
