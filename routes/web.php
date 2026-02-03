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

    Route::get('my-documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::post('my-documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::delete('my-documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');

    Route::get('my-starred-documents', [DocumentController::class, 'indexStarred'])->name('documents_starred.index');

    Route::get('manage-category', [CategoryController::class, 'index'])->name('categories.index');
});

require __DIR__ . '/settings.php';
