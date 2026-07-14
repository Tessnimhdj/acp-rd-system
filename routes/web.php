<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VisitController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    $user = auth()->user();

    // كل دور يذهب لصفحته المناسبة
    if ($user->hasRole('commercial') || $user->hasRole('responsable_commercial')) {
        return redirect()->route('visits.index');
    }

    if ($user->hasRole('rd')) {
        return redirect()->route('visits.index');
    }

    if ($user->hasRole('production')) {
        return redirect()->route('visits.index');
    }

    // Admin يرى Dashboard عام
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::resource('visites', VisitController::class)
        ->parameters(['visites' => 'visit'])
        ->names('visits');

    Route::get('/clients', [ClientController::class, 'index'])->name('clients.index');
    Route::post('/clients', [ClientController::class, 'store'])->name('clients.store');

    Route::middleware('role:responsable_commercial|admin')->group(function () {
        Route::get('/team', [TeamController::class, 'index'])->name('team.index');
        Route::post('/team/users', [TeamController::class, 'store'])->name('team.store');
    });

    Route::get('/planning', function () {
        return Inertia::render('Dashboard'); // مؤقتاً حتى ننشئ صفحة Planning
    })->name('planning.index');

    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}/role', [UserController::class, 'updateRole'])->name('users.update-role');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
