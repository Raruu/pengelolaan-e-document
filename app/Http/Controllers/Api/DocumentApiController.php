<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

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

        // if (!empty($validated['date_to'])) {
        //     $query->whereDate('document_date', '<=', $validated['date_to']);
        // }

        // if (!empty($validated['date_updated'])) {
        //     $query->whereDate('updated_at', '<=', $validated['date_updated']);
        // }

        // Starred
        if (!empty($validated['starred'])) {
            $query->where('starred', true);
        }

        // Search
        if (!empty($validated['search'])) {
            $query->where(function ($q) use ($validated) {
                $q->where('title', 'like', '%' . $validated['search'] . '%')
                    ->orWhere('description', 'like', '%' . $validated['search'] . '%')
                    ->orWhere('no_document', 'like', '%' . $validated['search'] . '%');
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
            'no_document' => 'required|string|max:50',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'document_date' => 'required|date',
            'starred' => 'nullable|boolean',
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
            'no_document' => $validated['no_document'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'document_date' => $validated['document_date'],
            'starred' => $validated['starred'] ?? false,
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

        $document->touch();

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
            'no_document' => 'required|string|max:50',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'document_date' => 'required|date',
            'deleted_files' => 'nullable|array',
            'deleted_files.*' => 'integer|exists:document_files,id',
            'starred' => 'nullable|boolean',
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
            'no_document' => $validated['no_document'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'document_date' => $validated['document_date'],
            'starred' => $validated['starred'] ?? false,
        ]);

        if (!empty($validated['deleted_files'])) {
            $document->files()
                ->whereIn('id', $validated['deleted_files'])
                ->delete();
        }

        return response()->json([
            'message' => 'Document updated successfully.',
            'document' => $document->load(['files', 'category'])
        ], );
    }

    public function toggleStarred(Request $request, Document $document): JsonResponse
    {
        if ($document->uploaded_by !== $request->user()->id) {
            abort(403);
        }

        $document->starred = !$document->starred;
        $document->save();

        return response()->json([
            'message' => $document->starred ? 'Document starred.' : 'Document unstarred.',
            'starred' => $document->starred
        ]);
    }

    public function destroy(Request $request, Document $document): JsonResponse
    {
        if ($document->uploaded_by !== $request->user()->id) {
            abort(403);
        }

        $document->files()->delete();
        $document->delete();

        return response()->json(['message' => 'Document moved to trash.']);
    }

    public function downloadAll(Request $request, Document $document): StreamedResponse
    {
        if ($document->uploaded_by !== $request->user()->id) {
            abort(403);
        }

        $files = $document->files;

        if ($files->isEmpty()) {
            abort(404, 'No files found for this document.');
        }

        $zipFileName = 'document_' . $document->id . '_' . $document->title . '_' . time() . '.zip';
        $zipPath = storage_path('app/temp/' . $zipFileName);

        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        $zip = new ZipArchive();

        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            abort(500, 'Could not create zip file.');
        }

        // metadata.json
        $metadata = [
            'id' => $document->id,
            'title' => $document->title,
            'description' => $document->description,
            'document_date' => $document->document_date->format('d-m-Y'),
            'created_at' => $document->created_at->toIso8601String(),
            'updated_at' => $document->updated_at->toIso8601String(),
            'category' => [
                'name' => $document->category->category,
                'direction' => $document->category->direction,
            ],
            'uploader' => [
                'id' => $document->uploader->id,
                'name' => $document->uploader->name,
                'email' => $document->uploader->email,
            ],
            'files' => $files->map(function ($file) {
                return [
                    'id' => $file->id,
                    'filename' => basename($file->file_path),
                    'size' => $file->file_size,
                    'created_at' => $file->created_at->toIso8601String(),
                ];
            })->toArray(),
        ];

        $zip->addFromString('metadata.json', json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // Add all files
        foreach ($files as $file) {
            $filePath = Storage::disk('public')->path($file->file_path);
            if (file_exists($filePath)) {
                $zip->addFile($filePath, basename($file->file_path));
            }
        }

        $zip->close();

        return response()->streamDownload(function () use ($zipPath) {
            readfile($zipPath);
            unlink($zipPath); // Delete temp file after streaming
        }, $zipFileName, [
            'Content-Type' => 'application/zip',
        ]);
    }
}
