<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|string|in:created_at,updated_at,title,document_date',
            'sort_order' => 'nullable|string|in:asc,desc',
        ]);

        $query = Document::with(['category', 'uploader'])
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
}
