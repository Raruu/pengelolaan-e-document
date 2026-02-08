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
        $recentDocuments = Document::with(['category'])
            ->withCount('files')
            ->orderBy('document_date', 'desc')
            ->limit(4)
            ->get();

        $starredDocuments = Document::with(['category', 'files'])
            ->withCount('files')
            ->where('starred', true)
            ->orderBy('document_date', 'desc')
            ->limit(4)
            ->get();

        return Inertia::render('dashboard', [
            'recentDocuments' => $recentDocuments,
            'starredDocuments' => $starredDocuments,
        ]);
    }

}
