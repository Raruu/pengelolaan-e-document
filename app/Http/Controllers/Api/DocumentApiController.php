<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class DocumentApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'category' => 'nullable|string',
            'direction' => 'nullable|string',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'date_updated' => 'nullable|date',
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|string|in:created_at,updated_at,title,document_date',
            'sort_order' => 'nullable|string|in:asc,desc',
            'starred' => 'nullable|boolean',
        ]);

        $query = Document::with(['category', 'uploader', 'files'])
            ->where('uploaded_by', $request->user()->id);

        // Filter by category
        if (!empty($validated['category'])) {
            $query->whereHas('category', function ($q) use ($validated) {
                $q->where('category', $validated['category']);
            });
        }

        // Filter by direction
        if (!empty($validated['direction'])) {
            $query->whereHas('category', function ($q) use ($validated) {
                $q->where('direction', $validated['direction']);
            });
        }

        // Filter by date range
        if (!empty($validated['date_from'])) {
            $query->whereDate('document_date', '>=', $validated['date_from']);
        }

        if (!empty($validated['date_to'])) {
            $query->whereDate('document_date', '<=', $validated['date_to']);
        }

        if (!empty($validated['date_updated'])) {
            $query->whereDate('updated_at', '<=', $validated['date_updated']);
        }

        // Starred
        if (!empty($validated['starred'])) {
            $query->where('starred', true);
        }

        // Search
        if (!empty($validated['search'])) {
            $query->where(function ($q) use ($validated) {
                $q->where('title', 'like', '%' . $validated['search'] . '%')
                    ->orWhere('description', 'like', '%' . $validated['search'] . '%');
            });
        }

        // Sort
        $sortBy = $validated['sort_by'] ?? 'created_at';
        $sortOrder = $validated['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $validated['per_page'] ?? 24;
        $documents = $query->paginate($perPage);

        return response()->json($documents);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|exists:categories,category',
            'direction' => 'required|in:Masuk,Keluar',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'document_date' => 'required|date',
        ]);

        $category = Category::where([
            ['category', $validated['category']],
            ['direction', $validated['direction']],
        ])->first();

        if (empty($category)) {
            return response()->json([
                'message' => 'Category does not exists'
            ], 422);
        }

        $document = Document::create([
            'category_id' => $category->id,
            'uploaded_by' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'document_date' => $validated['document_date'],
        ]);

        return response()->json([
            'message' => 'Document created successfully.',
            'document' => $document->load(['files', 'category'])
        ], 201);
    }

    public function storeFile(Request $request): JsonResponse
    {
        $request->validate([
            'document_id' => 'required|exists:documents,id',
            'file' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:25600',
        ]);

        $document = Document::find($request->document_id);

        if ($document->uploaded_by !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $file = $request->file('file');
        $filename = $file->getClientOriginalName();
        $path = $file->storeAs('documents/' . $document->id, $filename, 'public');

        $documentFile = $document->files()->create([
            'file_path' => $path,
            'file_size' => round($file->getSize() / 1024, 2),
        ]);

        return response()->json([
            'message' => 'File added successfully.',
            'file' => $documentFile
        ], 201);
    }

    public function update(Request $request, Document $document): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|exists:categories,category',
            'direction' => 'required|in:Masuk,Keluar',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'document_date' => 'required|date',
        ]);

        $category = Category::where([
            ['category', $validated['category']],
            ['direction', $validated['direction']],
        ])->first();

        if (empty($category)) {
            return response()->json([
                'message' => 'Category does not exists'
            ], 422);
        }

        $document->update([
            'category_id' => $category->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'document_date' => $validated['document_date'],
        ]);

        return response()->json([
            'message' => 'Document updated successfully.',
            'document' => $document->load(['files', 'category'])
        ], );
    }

    public function destroy(Request $request, Document $document): JsonResponse
    {
        if ($document->uploaded_by !== $request->user()->id) {
            abort(403);
        }

        if ($document->trashed()) {
            foreach ($document->files as $file) {
                Storage::disk('public')->delete($file->file_path);
            }
            $document->forceDelete();

            return response()->json(['message' => 'Document permanently deleted.'], status: 204);
        }

        $document->delete();

        return response()->json(['message' => 'Document moved to trash.']);
    }
}
