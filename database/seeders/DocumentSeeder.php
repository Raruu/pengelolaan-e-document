<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Faker\Generator as Faker;
use Carbon\Carbon;

class DocumentSeeder extends Seeder
{
    public function run()
    {
        // Ambil ID referensi
        $adminId = DB::table('users')->value('id');
        $catUndanganId = DB::table('categories')->where('category', 'Undangan')->value('id');
        $catRahasiaId = DB::table('categories')->where('category', 'Telegram Rahasia')->value('id');

        // Insert 100 documents
        $faker = app(Faker::class);

        for ($i = 0; $i < 100; $i++) {
            $categoryId = rand(1, 2) === 1 ? $catUndanganId : $catRahasiaId;
            $docId = DB::table('documents')->insertGetId([
                'category_id' => $categoryId,
                'uploaded_by' => $adminId,
                'no_document' => $faker->unique()->regexify('DOC-[0-9]{4}-[0-9]{3}'),
                'title' => $faker->sentence(),
                'description' => $faker->paragraph(),
                'starred' => rand(0, 1) === 1 ? true : false,
                'document_date' => $faker->dateTimeBetween('-1 years', 'now'),
                'created_at' => now(),
            ]);

            // Insert document files
            DB::table('document_files')->insert([
                [
                    'document_id' => $docId,
                    'file_path' => '/uploads/' . rand(2000, 2026) . '/' . $faker->unique()->regexify('[a-zA-Z0-9]{8}\.pdf'),
                    'file_size' => rand(1024, 102400),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            ]);
        }
    }
}

