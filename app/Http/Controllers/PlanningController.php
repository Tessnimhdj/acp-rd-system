<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\User;
use App\Models\Visit;
use App\Models\VisitAppointment;
use App\Models\VisitNegative;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanningController extends Controller
{
    public function index(Request $request): Response
    {
        $month = (int) $request->input('month', now()->month);
        $year  = (int) $request->input('year', now()->year);
        $user  = auth()->user();
        $canFilterTeam = $user->hasAnyRole(['responsable_commercial', 'admin']);

        $filterUserId = $request->get('tc_id');
        $filterUserId = ($filterUserId !== null && $filterUserId !== '')
            ? (int) $filterUserId
            : null;

        $statusFilter = $request->get('status', 'all');

        $teamMembers = $canFilterTeam
            ? User::role(['commercial', 'responsable_commercial'])
                ->select('users.id', 'users.name')
                ->orderBy('users.name')
                ->get()
            : collect();

        $visitsByDay = Visit::forRole(auth()->user())
            ->whereYear('visit_date', $year)
            ->whereMonth('visit_date', $month)
            ->with(['client:id,company_name', 'user:id,name'])
            ->orderBy('visit_date')
            ->orderBy('start_time')
            ->get()
            ->map(function (Visit $visit) {
                return [
                    'id'              => $visit->id,
                    'date'            => $visit->visit_date->format('Y-m-d'),
                    'day'             => (int) $visit->visit_date->day,
                    'start_time'      => $visit->start_time,
                    'client'          => $visit->client?->company_name,
                    'tc'              => $visit->user?->name,
                    'status'          => $visit->status,
                    'visit_objective' => $visit->visit_objective,
                    'badge'           => $this->getBadge($visit->visit_date),
                ];
            })
            ->groupBy('day');

        $appointmentsQuery = $this->appointmentsForRole($user)
            ->with(['client:id,company_name', 'user:id,name'])
            ->whereMonth('scheduled_date', $month)
            ->whereYear('scheduled_date', $year)
            ->orderBy('scheduled_date')
            ->orderBy('scheduled_time');

        if ($filterUserId && $canFilterTeam) {
            $appointmentsQuery->where('user_id', $filterUserId);
        }

        $appointments = $appointmentsQuery->get();

        if ($statusFilter === 'abouti') {
            $appointments = $appointments->filter(
                fn ($a) => $a->status === 'completed' && $a->visit_id
            );
        } elseif ($statusFilter === 'non_abouti') {
            $appointments = $appointments->filter(
                fn ($a) => $a->status === 'completed' && $a->negative_id
            );
        } elseif ($statusFilter === 'today') {
            $appointments = $appointments->filter(
                fn ($a) => $a->scheduled_date->isToday()
            );
        } elseif ($statusFilter === 'upcoming') {
            $appointments = $appointments->filter(
                fn ($a) => in_array($a->status, ['approved', 'pending'])
                    && $a->scheduled_date->isFuture()
            );
        } elseif ($statusFilter === 'upcoming_approved') {
            $appointments = $appointments->filter(
                fn ($a) => $a->status === 'approved'
                    && $a->scheduled_date->isFuture()
            );
        } elseif ($statusFilter === 'pending') {
            $appointments = $appointments->filter(
                fn ($a) => $a->status === 'pending'
            );
        } elseif ($statusFilter === 'refused') {
            $appointments = $appointments->filter(
                fn ($a) => $a->status === 'refused'
            );
        }

        $negativeVisits = VisitNegative::query()
            ->whereIn('appointment_id', $appointments->pluck('id'))
            ->get()
            ->keyBy('appointment_id');

        $positiveVisits = Visit::query()
            ->whereIn('appointment_id', $appointments->pluck('id')->filter())
            ->with('client:id,company_name')
            ->get()
            ->keyBy('appointment_id');

        $appointmentsByDay = $appointments
            ->groupBy(fn ($a) => $a->scheduled_date->day)
            ->map(function ($dayAppointments) {
                return $dayAppointments->map(function (VisitAppointment $appointment) {
                    return [
                        'id'             => $appointment->id,
                        'date'           => $appointment->scheduled_date->format('Y-m-d'),
                        'day'            => $appointment->scheduled_date->day,
                        'scheduled_time' => $appointment->scheduled_time,
                        'client'         => $appointment->client?->company_name,
                        'user'           => $appointment->user
                            ? ['id' => $appointment->user->id, 'name' => $appointment->user->name]
                            : null,
                        'objective'      => $appointment->objective,
                        'status'         => $appointment->status,
                        'refusal_reason' => $appointment->refusal_reason,
                        'visit_id'       => $appointment->visit_id,
                        'negative_id'    => $appointment->negative_id,
                    ];
                })->values();
            });

        $clients = Client::query()
            ->select('id', 'company_name')
            ->orderBy('company_name')
            ->get();

        return Inertia::render('Planning/Index', [
            'visitsByDay'        => $visitsByDay,
            'appointmentsByDay'  => $appointmentsByDay,
            'negativeVisits'     => $negativeVisits,
            'positiveVisits'     => $positiveVisits,
            'month'              => $month,
            'year'               => $year,
            'monthName'          => Carbon::createFromDate($year, $month, 1)
                ->locale('fr')
                ->translatedFormat('F'),
            'clients'            => $clients,
            'teamMembers'        => $teamMembers,
            'selectedTc'         => $filterUserId,
            'statusFilter'       => $statusFilter,
        ]);
    }

    public function start(VisitAppointment $appointment): Response
    {
        if (
            ! auth()->user()->hasRole('admin') &&
            $appointment->user_id !== auth()->id()
        ) {
            abort(403, 'Ce rendez-vous ne vous appartient pas.');
        }

        return Inertia::render('Planning/StartVisit', [
            'appointment' => $appointment->load('client'),
        ]);
    }

    private function appointmentsForRole(User $user)
    {
        // All statuses are included here: pending, approved, refused,
        // completed, cancelled. Status filtering happens later via $statusFilter.
        $query = VisitAppointment::query();

        if ($user->hasRole('commercial')) {
            return $query->where('user_id', $user->id);
        }

        if ($user->hasRole('responsable_commercial') || $user->hasRole('admin')) {
            $teamIds = User::role(['commercial', 'responsable_commercial'])
                ->pluck('id')
                ->push($user->id)
                ->unique()
                ->values();

            return $query->whereIn('user_id', $teamIds);
        }

        return $query->whereRaw('1 = 0');
    }

    private function getBadge($date): string
    {
        $today     = now()->startOfDay();
        $visitDate = Carbon::parse($date)->startOfDay();

        if ($visitDate->eq($today)) {
            return 'today';
        }

        if ($visitDate->gt($today)) {
            return 'upcoming';
        }

        return 'past';
    }
}
