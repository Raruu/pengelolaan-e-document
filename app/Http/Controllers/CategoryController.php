<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Api\CategoryApiController;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $isCombined = $request->boolean('is_combined', true);
        $request->merge(['is_combined' => $isCombined]);


        $apiController = new CategoryApiController();
        $categories = $apiController->getCategories($request);

        return Inertia::render('manage-category/index', [
            'categories' => $categories,
            'filters' => [
                'is_combined' => $isCombined,
                'search' => $request->get('search', ''),
            ],
        ]);
    }
}
