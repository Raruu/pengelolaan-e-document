<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(Request $request, bool $starred = false): Response
    {
        $query = Document::with(['category', 'uploader', 'files'])
            ->where('uploaded_by', $request->user()->id);

        // Filter by category
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('document_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('document_date', '<=', $request->date_to);
        }

        // Starred
        if ($starred) {
            $query->where('starred', true);
        }

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('no_document', 'like', '%' . $request->search . '%');
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $documents = $query->paginate(10);

        $categories = Category::select('category', 'icon_path')
            ->distinct('category')
            ->get()
            ->map(function ($cat) {
                $cat->icon_url;
                return $cat;
            });

        $directions = Category::select('direction')->distinct()->get();

        return Inertia::render('documents/index', [
            'documents' => $documents,
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
            'starred' => $starred
        ]);
    }

    public function indexStarred(Request $request): Response
    {
        return $this->index($request, true);
    }

    public function indexPreview(Request $request, Document $document): Response
    {
        if ($document->uploaded_by !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $document->load('files', 'category');

        $files = $document->files->map(function ($file) {
            return [
                'id' => $file->id,
                'filename' => $file->file_name . '.' . $file->file_extension,
                'size' => $file->file_size_kb,
                'fileurl' => $file->file_url,
                'uploaded_at' => $file->created_at
            ];
        });

        return Inertia::render('documents/preview-documents/index', [
            'document' => $document,
            'files' => $files,
        ]);
    }

    public function indexCreate(Request $request): Response
    {
        $categories = Category::select('category', 'icon_path')
            ->distinct('category')
            ->get()
            ->map(function ($cat) {
                $cat->icon_url;
                return $cat;
            });

        $directions = Category::select('direction')->distinct()->get();

        return Inertia::render('documents/alter-documents/index', [
            'categories' => $categories,
            'directions' => $directions,
            'mode' => 'create',
        ]);
    }

    public function indexEdit(Request $request, Document $document): Response
    {
        // Ensure user can only edit their own documents
        if ($document->uploaded_by !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $categories = Category::select('category', 'icon_path')
            ->distinct('category')
            ->get()
            ->map(function ($cat) {
                $cat->icon_url;
                return $cat;
            });

        $directions = Category::select('direction')->distinct()->get();

        $document->load('files', 'category');

        $files = $document->files->map(function ($file) {
            return [
                'id' => $file->id,
                'filename' => $file->file_name . '.' . $file->file_extension,
                'size' => $file->file_size_kb,
                'fileurl' => $file->file_url,
                'uploaded_at' => $file->created_at
            ];
        });

        return Inertia::render('documents/alter-documents/index', [
            'categories' => $categories,
            'directions' => $directions,
            'document' => $document,
            'files' => $files,
            'mode' => 'edit',
        ]);
    }
}
