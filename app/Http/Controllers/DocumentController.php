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

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $documents = $query->paginate(24);

        // Get categories for filter
        $categories = Category::select('category')->distinct()->get();
        $directions = Category::select('direction')->distinct()->get();

        // Get recent files (last 4 uploaded)
        $recentFiles = Document::with(['category', 'files'])
            ->where('uploaded_by', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->limit(4)
            ->get();

        return Inertia::render('my-documents/index', [
            'documents' => $documents,
            'categories' => $categories,
            'directions' => $directions,
            'recentFiles' => $recentFiles,
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'files' => 'required|array',
            'files.*' => 'file|max:10240', // 10MB max per file
            'document_date' => 'required|date',
        ]);

        $document = Document::create([
            'category_id' => $validated['category_id'],
            'uploaded_by' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'document_date' => $validated['document_date'],
        ]);

        // Store each file
        foreach ($request->file('files') as $file) {
            $path = $file->store('documents', 'public');
            $document->files()->create([
                'file_path' => $path,
                'file_size_kb' => round($file->getSize() / 1024),
            ]);
        }

        return redirect()->back()->with('success', 'Document uploaded successfully.');
    }

    public function destroy(Request $request, Document $document)
    {
        // Check authorization
        if ($document->uploaded_by !== $request->user()->id) {
            abort(403);
        }

        if ($document->trashed()) {
            foreach ($document->files as $file) {
                Storage::disk('public')->delete($file->file_path);
            }
            $document->forceDelete();
            return redirect()->back()->with('success', 'Document permanently deleted.');
        }

        $document->delete();
        return redirect()->back()->with('success', 'Document moved to trash.');
    }
}
