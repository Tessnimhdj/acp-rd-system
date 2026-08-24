<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\PlanningController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VisitController;
use App\Http\Controllers\VisitNegativeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    $user = auth()->user();
    $stats = [];

    if ($user->hasRole('admin')) {
        $stats = [
            'total_visits'   => App\Models\Visit::count(),
            'total_clients'  => App\Models\Client::count(),
            'total_users'    => App\Models\User::count(),
            'pending_rd'     => App\Models\Visit::where('status','submitted')->count(),
        ];
    } elseif ($user->hasRole('responsable_commercial')) {
        $commercialIds = App\Models\User::role('commercial')->pluck('id');
        $stats = [
            'team_visits_total'   => App\Models\Visit::whereIn('user_id',$commercialIds)->count(),
            'team_visits_month'   => App\Models\Visit::whereIn('user_id',$commercialIds)
                ->whereMonth('visit_date', now()->month)->count(),
            'team_members'        => $commercialIds->count(),
            'pending_rd'          => App\Models\Visit::whereIn('user_id',$commercialIds)
                ->where('status','submitted')->count(),
        ];
    } elseif ($user->hasRole('commercial')) {
        $stats = [
            'my_visits_total' => App\Models\Visit::where('user_id',$user->id)->count(),
            'my_visits_month' => App\Models\Visit::where('user_id',$user->id)
                ->whereMonth('visit_date', now()->month)->count(),
            'upcoming'        => App\Models\Visit::where('user_id',$user->id)
                ->where('visit_date','>=',today())->count(),
        ];
    } elseif ($user->hasRole('rd')) {
        $stats = [
            'to_process' => App\Models\Visit::where('status','submitted')->count(),
            'in_progress'=> App\Models\Visit::where('status','in_rd')->count(),
        ];
    } elseif ($user->hasRole('production')) {
        $stats = [
            'approved' => App\Models\Visit::where('status','approved')->count(),
        ];
    }

    return Inertia::render('Dashboard', ['stats' => $stats]);
})->middleware(['auth','verified'])->name('dashboard');

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

    // Appointments
    Route::middleware(['role:commercial|responsable_commercial|admin'])
        ->group(function () {
            Route::post('/appointments', [AppointmentController::class, 'store'])
                ->name('appointments.store');
            Route::patch('/appointments/{appointment}/cancel',
                [AppointmentController::class, 'cancel'])
                ->name('appointments.cancel');
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
