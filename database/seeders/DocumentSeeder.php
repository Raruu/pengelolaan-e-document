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
        $adminId = DB::table('users')->value('id');
        $catUndanganId = DB::table('categories')->where('category', 'Undangan')->value('id');
        $catRahasiaId = DB::table('categories')->where('category', 'Telegram Rahasia')->value('id');

        // Insert documents
        $docId1 = DB::table('documents')->insertGetId([
            'category_id' => $catUndanganId,
            'uploaded_by' => $adminId,
            'title' => 'Undangan Rapat Koordinasi Tahunan',
            'description' => 'Undangan wajib hadir bagi seluruh kepala divisi',
            'starred' => true,
            'document_date' => Carbon::parse('2026-02-15'),
            'created_at' => now(),
        ]);

        $docId2 = DB::table('documents')->insertGetId([
            'category_id' => $catRahasiaId,
            'uploaded_by' => $adminId,
            'title' => 'Laporan Intelijen Q1',
            'description' => 'Dokumen klasifikasi rahasia',
            'starred' => false,
            'document_date' => Carbon::parse('2024-01-10'), 
            'created_at' => now(),
        ]);

        // Insert document files
        DB::table('document_files')->insert([
            [
                'document_id' => $docId1,
                'file_path' => '/uploads/2026/undangan_rapat.pdf',
                'file_size' => 1024,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'document_id' => $docId2,
                'file_path' => '/uploads/2026/laporan_rahasia.jpg',
                'file_size' => 5120,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}
