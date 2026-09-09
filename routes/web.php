<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlanningController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VisitController;
use App\Http\Controllers\VisitNegativeController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

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

    Route::get('/planning', [PlanningController::class, 'index'])->name('planning.index');
    Route::get('/planning/start/{appointment}', [PlanningController::class, 'start'])
        ->name('planning.start');
    Route::get('/about', [AboutController::class, 'index'])
        ->name('about.index');

    // Appointments
    Route::middleware(['role:commercial|responsable_commercial|admin'])
        ->group(function () {
            Route::post('/appointments', [AppointmentController::class, 'store'])
                ->name('appointments.store');
            Route::patch('/appointments/{appointment}/cancel',
                [AppointmentController::class, 'cancel'])
                ->name('appointments.cancel');
            Route::patch('/appointments/{appointment}/approve',
                [AppointmentController::class, 'approve'])
                ->name('appointments.approve');
            Route::patch('/appointments/{appointment}/refuse',
                [AppointmentController::class, 'refuse'])
                ->name('appointments.refuse');
        });

    // Visit Negatives
    Route::middleware(['role:commercial|responsable_commercial|admin'])
        ->group(function () {
            Route::get('/visit-negatives/create',
                [VisitNegativeController::class, 'create'])
                ->name('visit-negatives.create');
            Route::post('/visit-negatives',
                [VisitNegativeController::class, 'store'])
                ->name('visit-negatives.store');
        });

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
