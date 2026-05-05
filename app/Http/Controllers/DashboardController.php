<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Document;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $recentDocumentsIn = Document::with(['category'])
            ->whereHas('category', function ($query) {
                $query->where('direction', 'Masuk');
            })
            ->withCount('files')
            ->orderBy('document_date', 'desc')
            ->limit(4)
            ->get();

        $recentDocumentsOut = Document::with(['category'])
            ->whereHas('category', function ($query) {
                $query->where('direction', 'Keluar');
            })
            ->withCount('files')
            ->orderBy('document_date', 'desc')
            ->limit(4)
            ->get();

        return Inertia::render('dashboard', [
            'recentDocumentsIn' => $recentDocumentsIn,
            'recentDocumentsOut' => $recentDocumentsOut,
        ]);
    }

}
