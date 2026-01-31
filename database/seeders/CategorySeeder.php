<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['categorie' => 'Undangan', 'direction' => 'Masuk'],
            ['categorie' => 'Undangan', 'direction' => 'Keluar'],
            ['categorie' => 'Telegram Biasa', 'direction' => 'Masuk'],
            ['categorie' => 'Telegram Biasa', 'direction' => 'Keluar'],
            ['categorie' => 'Telegram Rahasia', 'direction' => 'Masuk'],
            ['categorie' => 'Telegram Rahasia', 'direction' => 'Keluar'],
        ];

        DB::table('categories')->insert($categories);
    }
}
