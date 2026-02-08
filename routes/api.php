<?php

use App\Http\Controllers\Api\DocumentApiController;
use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\TrashApiController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/documents', [DocumentApiController::class, 'index'])->name('api.documents.index');
    Route::post('/documents', [DocumentApiController::class, 'store'])->name('api.documents.store');
    Route::put('/documents/{document}', [DocumentApiController::class, 'update'])->name('api.documents.update');
    Route::post('/documents/file', [DocumentApiController::class, 'storeFile'])->name('api.documents.storeFile');
    Route::get('/documents/{document}/download-all', [DocumentApiController::class, 'downloadAll'])->name('api.documents.downloadAll');
    Route::delete('/documents/{document}', [DocumentApiController::class, 'destroy'])->name('api.documents.destroy');

    Route::get('/trash', [TrashApiController::class, 'index'])->name('api.trash.index');
    Route::post('/trash/restore', [TrashApiController::class, 'restore'])->name('api.trash.restore');
    Route::delete('/trash/force-delete', [TrashApiController::class, 'forceDelete'])->name('api.trash.forceDelete');
    Route::delete('/trash/empty', [TrashApiController::class, 'emptyTrash'])->name('api.trash.empty');

    Route::get('/categories', [CategoryApiController::class, 'index'])->name('api.categories.index');
    Route::post('/categories', [CategoryApiController::class, 'store'])->name('api.categories.store');
    Route::get('/categories/{category}', [CategoryApiController::class, 'show'])->name('api.categories.show');
    Route::put('/categories/{category}', [CategoryApiController::class, 'update'])->name('api.categories.update');
    Route::delete('/categories/{category}', [CategoryApiController::class, 'destroy'])->name('api.categories.destroy');
});
