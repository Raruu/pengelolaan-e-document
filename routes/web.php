<?php

use App\Http\Controllers\DocumentController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TrashController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('documents-in', [DocumentController::class, 'indexIn'])->name('documents.in.index');
    Route::get('documents-out', [DocumentController::class, 'indexOut'])->name('documents.out.index');
    Route::get('document/preview/{document}', [DocumentController::class, 'indexPreview'])->name('document.preview.index');
    Route::get('document/create', [DocumentController::class, 'indexCreate'])->name('document.create.index');
    Route::get('document/{document}/edit', [DocumentController::class, 'indexEdit'])->name('document.edit.index');

    Route::get('trash', [TrashController::class, 'index'])->name('trash.index');
    Route::get('trash/preview/{id}', [TrashController::class, 'preview'])->name('trash.preview.index');

    Route::get('manage-category', [CategoryController::class, 'index'])->name('categories.index');
});

require __DIR__ . '/settings.php';
