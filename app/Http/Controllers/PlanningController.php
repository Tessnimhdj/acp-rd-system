<?php

namespace App\Http\Controllers;

use App\Models\Visit;
use Inertia\Inertia;
use Inertia\Response;

class PlanningController extends Controller
{
    public function index(): Response
    {
        $visits = Visit::forRole(auth()->user())
            ->with(['user:id,name', 'client:id,company_name'])
            ->orderBy('visit_date')
            ->orderBy('start_time')
            ->get()
            ->map(function ($visit) {
                $today = now()->startOfDay();
                $visitDate = \Carbon\Carbon::parse($visit->visit_date)->startOfDay();

                if ($visitDate->gt($today)) {
                    $visit->badge = 'upcoming';
                } elseif ($visitDate->eq($today)) {
                    $visit->badge = 'today';
                } else {
                    $visit->badge = 'past';
                }

                return $visit;
            });

        return Inertia::render('Planning/Index', ['visits' => $visits]);
    }
}
