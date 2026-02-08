<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\DocumentFile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class TrashApiController extends Controller
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
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|string|in:deleted_at,title',
            'sort_order' => 'nullable|string|in:asc,desc',
        ]);

        // Get deleted documents owned by the user
        $documentsQuery = Document::onlyTrashed()
            ->with(['category', 'uploader', 'files'])
            ->where('uploaded_by', $request->user()->id);

        // Get deleted files from non-deleted documents
        $filesQuery = DocumentFile::onlyTrashed()
            ->with(['document.category', 'document.uploader'])
            ->whereHas('document', function ($query) use ($request) {
                $query->where('uploaded_by', $request->user()->id)
                    ->whereNull('deleted_at');
            });

        // Filter by category
        if (!empty($validated['category'])) {
            $documentsQuery->whereHas('category', function ($q) use ($validated) {
                $q->where('category', $validated['category']);
            });
            $filesQuery->whereHas('document.category', function ($q) use ($validated) {
                $q->where('category', $validated['category']);
            });
        }

        // Filter by direction
        if (!empty($validated['direction'])) {
            $documentsQuery->whereHas('category', function ($q) use ($validated) {
                $q->where('direction', $validated['direction']);
            });
            $filesQuery->whereHas('document.category', function ($q) use ($validated) {
                $q->where('direction', $validated['direction']);
            });
        }

        // Filter by date range
        if (!empty($validated['date_from'])) {
            $documentsQuery->where('deleted_at', '>=', $validated['date_from']);
            $filesQuery->where('deleted_at', '>=', $validated['date_from']);
        }

        if (!empty($validated['date_to'])) {
            $documentsQuery->where('deleted_at', '<=', $validated['date_to']);
            $filesQuery->where('deleted_at', '<=', $validated['date_to']);
        }

        // Search
        if (!empty($validated['search'])) {
            $documentsQuery->where(function ($q) use ($validated) {
                $q->where('title', 'like', '%' . $validated['search'] . '%')
                    ->orWhere('description', 'like', '%' . $validated['search'] . '%');
            });
            $filesQuery->whereHas('document', function ($q) use ($validated) {
                $q->where('title', 'like', '%' . $validated['search'] . '%')
                    ->orWhere('description', 'like', '%' . $validated['search'] . '%');
            });
        }

        // Sort
        $sortBy = $validated['sort_by'] ?? 'deleted_at';
        $sortOrder = $validated['sort_order'] ?? 'desc';
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
                'deletion_type' => 'full', // Fully deleted document
                'title' => $doc->title,
                'description' => $doc->description,
                'category' => $doc->category,
                'deleted_at' => $doc->deleted_at->toISOString(),
                'document_date' => $doc->document_date?->toISOString(),
                'files_count' => $doc->files()->withTrashed()->count(),
                'starred' => $doc->starred,
                'deleted_files' => [], // All files are deleted with the document
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
                    'deleted_at' => $file->deleted_at->toISOString(),
                ];
            })->toArray();

            $items->push([
                'id' => $document->id,
                'type' => 'document',
                'deletion_type' => 'partial',
                'title' => $document->title,
                'description' => $document->description,
                'category' => $document->category,
                'deleted_at' => $document->deleted_at?->toISOString() ?? $deletedFiles->max('deleted_at')->toISOString(),
                'document_date' => $document->document_date?->toISOString(),
                'files_count' => $totalFiles,
                'deleted_files_count' => $deletedFiles->count(),
                'starred' => $document->starred,
                'deleted_files' => $deletedFilesData,
            ]);
        }

        // Sort by deletion date
        $items = $items->sortByDesc('deleted_at');

        // Pagination
        $perPage = $validated['per_page'] ?? 10;
        $page = $validated['page'] ?? 1;
        $total = $items->count();
        $items = $items->forPage($page, $perPage)->values();

        return response()->json([
            'data' => $items,
            'current_page' => (int) $page,
            'last_page' => (int) ceil($total / $perPage),
            'per_page' => $perPage,
            'total' => $total,
            'from' => ($page - 1) * $perPage + 1,
            'to' => min($page * $perPage, $total),
        ]);
    }

    public function restore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|in:document,file',
            'id' => 'required|integer',
        ]);

        if ($validated['type'] === 'document') {
            $document = Document::onlyTrashed()
                ->where('uploaded_by', $request->user()->id)
                ->find($validated['id']);

            if (!$document) {
                $document = Document::where('uploaded_by', $request->user()->id)
                    ->find($validated['id']);
            }

            $document->files()->onlyTrashed()->restore();
            $document->restore();

            return response()->json([
                'message' => 'Document restored successfully',
            ]);
        } else {
            $file = DocumentFile::onlyTrashed()
                ->whereHas('document', function ($query) use ($request) {
                    $query->where('uploaded_by', $request->user()->id);
                })
                ->findOrFail($validated['id']);

            $file->restore();

            return response()->json([
                'message' => 'File restored successfully',
            ]);
        }
    }

    public function forceDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|string|in:document,file',
            'id' => 'required|integer',
        ]);

        if ($validated['type'] === 'document') {
            $document = Document::onlyTrashed()
                ->where('uploaded_by', $request->user()->id)
                ->find($validated['id']);

            if ($document) {
                foreach ($document->files()->withTrashed()->get() as $file) {
                    Storage::disk('public')->delete($file->file_path);
                    $file->forceDelete();
                }

                $document->forceDelete();

                return response()->json([
                    'message' => 'Document permanently deleted',
                ]);
            } else {
                $document = Document::where('uploaded_by', $request->user()->id)
                    ->find($validated['id']);

                foreach ($document->files()->onlyTrashed()->get() as $file) {
                    Storage::disk('public')->delete($file->file_path);
                    $file->forceDelete();
                }

                return response()->json([
                    'message' => 'File permanently deleted',
                ]);
            }
        } else {
            $file = DocumentFile::onlyTrashed()
                ->whereHas('document', function ($query) use ($request) {
                    $query->where('uploaded_by', $request->user()->id);
                })
                ->findOrFail($validated['id']);

            Storage::disk('public')->delete($file->file_path);
            $file->forceDelete();

            return response()->json([
                'message' => 'File permanently deleted',
            ]);
        }
    }

    public function emptyTrash(Request $request): JsonResponse
    {
        // Get all deleted documents owned by the user
        $documents = Document::onlyTrashed()
            ->where('uploaded_by', $request->user()->id)
            ->get();

        // Get all deleted files from non-deleted documents
        $files = DocumentFile::onlyTrashed()
            ->whereHas('document', function ($query) use ($request) {
                $query->where('uploaded_by', $request->user()->id)
                    ->whereNull('deleted_at');
            })
            ->get();

        $deletedCount = 0;

        // Permanently delete all documents and their files
        foreach ($documents as $document) {
            // Delete all associated files
            foreach ($document->files()->withTrashed()->get() as $file) {
                Storage::disk('public')->delete($file->file_path);
                $file->forceDelete();
            }
            $document->forceDelete();
            $deletedCount++;
        }

        // Permanently delete standalone files
        foreach ($files as $file) {
            Storage::disk('public')->delete($file->file_path);
            $file->forceDelete();
            $deletedCount++;
        }

        return response()->json([
            'message' => "Successfully deleted {$deletedCount} items permanently",
            'count' => $deletedCount,
        ]);
    }
}
