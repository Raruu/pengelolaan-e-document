<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['category' => 'Undangan', 'direction' => 'Masuk'],
            ['category' => 'Undangan', 'direction' => 'Keluar'],
            ['category' => 'Telegram Biasa', 'direction' => 'Masuk'],
            ['category' => 'Telegram Biasa', 'direction' => 'Keluar'],
            ['category' => 'Telegram Rahasia', 'direction' => 'Masuk'],
            ['category' => 'Telegram Rahasia', 'direction' => 'Keluar'],
        ];

        DB::table('categories')->insert($categories);
    }
}
