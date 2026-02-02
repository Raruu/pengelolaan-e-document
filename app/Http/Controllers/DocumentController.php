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
    public function index(Request $request): Response
    {
        $query = Document::with(['category', 'uploader'])
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
        $recentFiles = Document::with(['category'])
            ->where('uploaded_by', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->limit(4)
            ->get();

        return Inertia::render('dokumen-ku/index', [
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
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|max:10240', // 10MB max            
            'document_date' => 'required|date',
        ]);

        $file = $request->file('file');
        $path = $file->store('documents', 'public');

        $document = Document::create([
            'category_id' => $validated['category_id'],
            'uploaded_by' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'file_path' => $path,
            'file_size_kb' => round($file->getSize() / 1024),
            'document_date' => $validated['document_date'],
        ]);

        return redirect()->back()->with('success', 'Document uploaded successfully.');
    }

    public function destroy(Request $request, Document $document)
    {
        // Check authorization
        if ($document->uploaded_by !== $request->user()->id) {
            abort(403);
        }

        // Delete file from storage
        Storage::disk('public')->delete($document->file_path);

        $document->delete();

        return redirect()->back()->with('success', 'Document deleted successfully.');
    }
}
