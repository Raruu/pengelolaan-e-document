<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class CategoryApiController extends Controller
{
    public function getCategories(Request $request)
    {
        $validated = $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'search' => 'nullable|string|max:255',
            'sort_by' => 'nullable|string|in:category,documents_count,created_at',
            'sort_order' => 'nullable|string|in:asc,desc',
        ]);

        $isCombined = $request->boolean('is_combined', false);

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
        if (!empty($validated['search'])) {
            $query->where(function ($q) use ($validated) {
                $q->where('category', 'like', '%' . $validated['search'] . '%');
            });
        }

        // Sort
        $sortBy = $validated['sort_by'] ?? 'category';
        $sortOrder = $validated['sort_order'] ?? 'asc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $validated['per_page'] ?? 10;
        $categories = $query->paginate($perPage);

        // Load sibling for each category
        $categories->getCollection()->transform(function ($category) {
            $sibling = $category->sibling();
            if ($sibling) {
                $sibling->loadCount('documents');
            }
            $category->sibling = $sibling;
            return $category;
        });

        return $categories;
    }
    
    public function index(Request $request): JsonResponse
    {
        $categories = $this->getCategories($request);
        return response()->json($categories);
    }


    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'direction' => 'required|in:Masuk,Keluar',
            'icon_path' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        ]);

        // Check if this combination already exists
        $exists = Category::where('category', $validated['category'])
            ->where('direction', $validated['direction'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Category with this direction already exists'
            ], 422);
        }

        // Create the category - it will automatically create the opposite direction
        $category = Category::create([
            'category' => $validated['category'],
            'direction' => $validated['direction'],
        ]);

        // Handle icon upload if present
        if ($request->hasFile('icon_path')) {
            $iconPath = $this->updateIcon($request, $category);
            $category->icon_path = $iconPath;
            $category->save();
        }

        // Load the sibling category
        $sibling = $category->sibling();

        return response()->json([
            'category' => $category,
            'sibling' => $sibling,
            'message' => 'Category created successfully with both directions'
        ], 201);
    }

    public function show(Category $category): JsonResponse
    {
        $category->loadCount('documents');
        return response()->json($category);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'sometimes|string|max:255',
            'icon_path' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        ]);

        // Check if new category name + direction combo already exists (excluding current record)
        if (isset($validated['category'])) {
            $exists = Category::where('category', $validated['category'])
                ->where('direction', $category->direction)
                ->where('id', '!=', $category->id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Category with this direction already exists'
                ], 422);
            }
        }

        // Handle icon upload if present
        if ($request->hasFile('icon_path')) {
            $category->icon_path = $this->updateIcon($request, $category);
        }

        // Update category name if provided
        if (isset($validated['category'])) {
            $category->category = $validated['category'];
        }

        $category->save();

        // Reload and get sibling
        $category->refresh();
        $sibling = $category->sibling();

        return response()->json([
            'category' => $category,
            'sibling' => $sibling,
            'message' => 'Category updated successfully, sibling synced'
        ]);
    }

    /**
     * Update the icon.
     */
    protected function updateIcon(Request $request, Category $category): string
    {
        if ($category->icon_path) {
            Storage::disk('public')->delete($category->icon_path);
        }

        $file = $request->file('icon_path');
        $filename = $category->id . '.webp';
        $path = 'category-icon/' . $filename;

        $manager = new ImageManager(new Driver());

        $image = $manager->read($file->getPathname());
        $image->scale(width: 64, height: 64);
        $encodedImage = $image->toWebp(85);

        Storage::disk('public')->put($path, (string) $encodedImage);
        return $path;
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->icon_path) {
            Storage::disk('public')->delete($category->icon_path);
        }
        $sibling = $category->sibling();
        if ($sibling) {
            if ($sibling->icon_path) {
                Storage::disk('public')->delete($sibling->icon_path);
            }
        }

        $category->delete();



        return response()->json(['message' => 'Category deleted successfully']);
    }
}
