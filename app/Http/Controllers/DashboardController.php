<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use App\Models\Visit;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $stats = [];

        if ($user->hasRole('admin')) {
            $stats = [
                'total_visits'   => Visit::count(),
                'total_clients'  => Client::count(),
                'total_users'    => User::count(),
                'pending_rd'     => Visit::where('status', 'submitted')->count(),
            ];
        } elseif ($user->hasRole('responsable_commercial')) {
            $commercialIds = User::role('commercial')->pluck('id');
            $stats = [
                'team_visits_total'   => Visit::whereIn('user_id', $commercialIds)->count(),
                'team_visits_month'   => Visit::whereIn('user_id', $commercialIds)
                    ->whereMonth('visit_date', now()->month)->count(),
                'team_members'        => $commercialIds->count(),
                'pending_rd'          => Visit::whereIn('user_id', $commercialIds)
                    ->where('status', 'submitted')->count(),
            ];
        } elseif ($user->hasRole('commercial')) {
            $stats = [
                'my_visits_total' => Visit::where('user_id', $user->id)->count(),
                'my_visits_month' => Visit::where('user_id', $user->id)
                    ->whereMonth('visit_date', now()->month)->count(),
                'upcoming'        => Visit::where('user_id', $user->id)
                    ->where('visit_date', '>=', today())->count(),
            ];
        } elseif ($user->hasRole('rd')) {
            $stats = [
                'to_process' => Visit::where('status', 'submitted')->count(),
                'in_progress'=> Visit::where('status', 'in_rd')->count(),
            ];
        } elseif ($user->hasRole('production')) {
            $stats = [
                'approved' => Visit::where('status', 'approved')->count(),
            ];
        }

        return Inertia::render('Dashboard', ['stats' => $stats]);
    }
}
