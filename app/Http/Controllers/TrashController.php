<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\DocumentFile;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrashController extends Controller
{
    public function index(Request $request): Response
    {
        // Get deleted documents owned by the user
        $documentsQuery = Document::onlyTrashed()
            ->with(['category', 'uploader', 'files'])
            ->where('uploaded_by', $request->user()->id);

        // Get deleted files from non-deleted documents
        $filesQuery = DocumentFile::onlyTrashed()
            ->with(['document.category', 'document.uploader'])
            ->whereHas('document', function ($query) use ($request) {
                $query->where('uploaded_by', $request->user()->id)
                    ->whereNull('deleted_at'); // Only files from non-deleted documents
            });

        // Filter by category
        if ($request->has('category')) {
            $documentsQuery->where('category_id', $request->category);
            $filesQuery->whereHas('document', function ($query) use ($request) {
                $query->where('category_id', $request->category);
            });
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $documentsQuery->where('deleted_at', '>=', $request->date_from);
            $filesQuery->where('deleted_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $documentsQuery->where('deleted_at', '<=', $request->date_to);
            $filesQuery->where('deleted_at', '<=', $request->date_to);
        }

        // Search
        if ($request->has('search')) {
            $documentsQuery->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
            $filesQuery->whereHas('document', function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'deleted_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $documentsQuery->orderBy($sortBy, $sortOrder);
        $filesQuery->orderBy($sortBy, $sortOrder);

        // Get both documents and files
        $documents = $documentsQuery->get();
        $files = $filesQuery->get();

        // Group files by document
        $filesByDocument = $files->groupBy('document_id');

        // Build document items with deleted files info
        $items = collect();

        // Fully deleted documents
        foreach ($documents as $doc) {
            $items->push([
                'id' => $doc->id,
                'type' => 'document',
                'deletion_type' => 'full',
                'title' => $doc->title,
                'no_document' => $doc->no_document,
                'description' => $doc->description,
                'category' => $doc->category,
                'deleted_at' => $doc->deleted_at?->toISOString() ?? $doc->files()->onlyTrashed()->max('deleted_at')->toISOString(),
                'document_date' => $doc->document_date,
                'files_count' => $doc->files()->withTrashed()->count(),
                'starred' => $doc->starred,
                'deleted_files' => [],
            ]);
        }

        // Partially deleted files
        foreach ($filesByDocument as $documentId => $deletedFiles) {
            $document = $deletedFiles->first()->document;
            $totalFiles = $document->files()->withTrashed()->count();

            $deletedFilesData = $deletedFiles->map(function ($file) {
                return [
                    'id' => $file->id,
                    'filename' => $file->file_name . '.' . $file->file_extension,
                    'size' => $file->file_size_kb,
                    'deleted_at' => $file->deleted_at,
                ];
            })->toArray();

            $items->push([
                'id' => $document->id,
                'type' => 'document',
                'deletion_type' => 'partial',
                'title' => $document->title,
                'no_document' => $document->no_document,
                'description' => $document->description,
                'category' => $document->category,
                'deleted_at' => $document->deleted_at?->toISOString() ?? $deletedFiles->max('deleted_at')->toISOString(),
                'document_date' => $document->document_date,
                'files_count' => $totalFiles,
                'deleted_files_count' => $deletedFiles->count(),
                'starred' => $document->starred,
                'deleted_files' => $deletedFilesData,
            ]);
        }

        // Sort by deletion date
        $items = $items->sortByDesc('deleted_at');

        // Pagination
        $perPage = 10;
        $page = $request->get('page', 1);
        $total = $items->count();
        $items = $items->forPage($page, $perPage)->values();

        $paginatedItems = [
            'data' => $items,
            'current_page' => (int) $page,
            'last_page' => (int) ceil($total / $perPage),
            'per_page' => $perPage,
            'total' => $total,
            'from' => ($page - 1) * $perPage + 1,
            'to' => min($page * $perPage, $total),
        ];

        $categories = Category::select('category', 'icon_path')
            ->distinct('category')
            ->get()
            ->map(function ($cat) {
                $cat->icon_url;
                return $cat;
            });

        $directions = Category::select('direction')->distinct()->get();

        return Inertia::render('trash/index', [
            'items' => $paginatedItems,
            'categories' => $categories,
            'directions' => $directions,
            'filters' => [
                'category' => $request->category,
                'date_from' => $request->date_from,
                'date_to' => $request->date_to,
                'search' => $request->search,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    public function preview(Request $request, int $id): Response
    {
        $document = Document::onlyTrashed()
            ->with(['category', 'uploader'])
            ->where('uploaded_by', $request->user()->id)
            ->find($id);

        if (!$document) {
            // Non-deleted document with deleted files
            $document = Document::with(['category', 'uploader'])
                ->where('uploaded_by', $request->user()->id)
                ->findOrFail($id);
        }

        $allFiles = $document->files()->withTrashed()->get();
        $deletedFiles = $document->files()->onlyTrashed()->get();

        $filesData = $deletedFiles->map(function ($file) {
            return [
                'id' => $file->id,
                'filename' => $file->file_name . '.' . $file->file_extension,
                'size' => $file->file_size_kb,
                'fileurl' => $file->file_url,
                'deleted_at' => $file->deleted_at,
            ];
        });

        $documentData = [
            'id' => $document->id,
            'title' => $document->title,
            'no_document' => $document->no_document,
            'description' => $document->description,
            'category' => $document->category,
            'document_date' => $document->document_date,
            'starred' => $document->starred,
            'deleted_at' => $document->deleted_at?->toISOString() ?? $deletedFiles->max('deleted_at')->toISOString(),
            'deletion_type' => $document->deleted_at ? 'full' : 'partial',
            'total_files' => $allFiles->count(),
            'deleted_files_count' => $deletedFiles->count(),
        ];

        return Inertia::render('trash/preview/index', [
            'document' => $documentData,
            'deletedFiles' => $filesData,
        ]);
    }
}
