<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DocumentSeeder extends Seeder
{
    public function run()
    {
        // Ambil ID referensi
        $adminId = DB::table('users')->first()>value('id');
        $catUndanganId = DB::table('categories')->where('category', 'Undangan')->value('id');
        $catRahasiaId = DB::table('categories')->where('category', 'Telegram Rahasia')->value('id');

        DB::table('documents')->insert([
            [
                'category_id' => $catUndanganId,
                'uploaded_by' => $adminId,
                'title' => 'Undangan Rapat Koordinasi Tahunan',
                'description' => 'Undangan wajib hadir bagi seluruh kepala divisi',
                'file_path' => '/uploads/2026/undangan_rapat.pdf',
                // 'file_type' => 'DOCUMENT',
                'file_size_kb' => 1024,
                'document_date' => Carbon::parse('2026-02-15'),
                'created_at' => now(),
            ],
            [
                'category_id' => $catRahasiaId,
                'uploaded_by' => $adminId,
                'title' => 'Laporan Intelijen Q1',
                'description' => 'Dokumen klasifikasi rahasia',
                'file_path' => '/uploads/2026/laporan_rahasia.jpg', 
                // 'file_type' => 'PICTURE',
                'file_size_kb' => 5120,
                'document_date' => Carbon::parse('2024-01-10'), 
                'created_at' => now(),
            ]
        ]);
    }
}
