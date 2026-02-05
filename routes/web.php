<?php

use App\Http\Controllers\DocumentController;
use App\Http\Controllers\CategoryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::get('documents-starred', [DocumentController::class, 'indexStarred'])->name('documents_starred.index');
    Route::get('document/preview/{document}', [DocumentController::class, 'indexPreview'])->name('document.preview.index');
    Route::get('document/create', [DocumentController::class, 'indexCreate'])->name('document.create.index');
    Route::get('document/{document}/edit', [DocumentController::class, 'indexEdit'])->name('document.edit.index');

    Route::get('manage-category', [CategoryController::class, 'index'])->name('categories.index');
});

require __DIR__ . '/settings.php';
