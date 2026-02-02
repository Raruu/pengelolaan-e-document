<?php

use App\Http\Controllers\DocumentController;
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

    Route::get('dokumen-ku', [DocumentController::class, 'index'])->name('documents.index');
    Route::post('dokumen-ku', [DocumentController::class, 'store'])->name('documents.store');
    Route::delete('dokumen-ku/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');
});

require __DIR__ . '/settings.php';
