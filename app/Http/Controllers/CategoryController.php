<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $isCombined = $request->boolean('is_combined', true);

        if ($isCombined) {
            $query = Category::select(
                'category',
                'icon_path',
                DB::raw('MAX(id) as id'),
                DB::raw('MAX(direction) as direction'),
                DB::raw('SUM(
                    (SELECT COUNT(*) FROM documents WHERE documents.category_id = categories.id)
                ) as documents_count')
            )
                ->groupBy('category', 'icon_path');
        } else {
            $query = Category::withCount('documents');
        }

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('category', 'like', '%' . $request->search . '%');
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'category');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $categories = $query->paginate(10);

        return Inertia::render('manage-category/index', [
            'categories' => $categories,
            'filters' => [
                'is_combined' => $isCombined,
                'search' => $request->get('search', ''),
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }
}
