<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Api\TrashApiController;
use App\Models\Document;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrashController extends Controller
{
    public function index(Request $request): Response
    {
        // Use the API controller's method to get trash items
        $apiController = new TrashApiController();
        $paginatedItems = $apiController->getTrashItemsQuery($request);

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
                'sort_by' => $request->get('sort_by', 'deleted_at'),
                'sort_order' => $request->get('sort_order', 'desc'),
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
