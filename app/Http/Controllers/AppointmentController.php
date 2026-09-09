<?php

namespace App\Http\Controllers;

use App\Models\VisitAppointment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    // A completed appointment MUST have either visit_id OR negative_id.
    // Status 'completed' without both = invalid state.

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', VisitAppointment::class);

        $validated = $request->validate([
            'client_id'      => 'required|exists:clients,id',
            'scheduled_date' => 'required|date|after_or_equal:today',
            'scheduled_time' => 'nullable|date_format:H:i',
            'objective'      => 'nullable|string|max:500',
        ]);

        $status = auth()->user()->hasAnyRole(['responsable_commercial', 'admin'])
            ? 'approved'
            : 'pending';

        VisitAppointment::create([
            ...$validated,
            'user_id' => auth()->id(),
            'status'  => $status,
        ]);

        return back()->with('success', 'Rendez-vous créé.');
    }

    public function cancel(Request $request, VisitAppointment $appointment): RedirectResponse
    {
        $this->authorize('cancel', $appointment);

        $validated = $request->validate([
            'cancellation_reason' => 'required|string|max:500',
        ]);

        $user = auth()->user();

        if ($appointment->user_id !== $user->id && ! $user->hasRole('admin')) {
            abort(403);
        }

        $appointment->update([
            'status'              => 'cancelled',
            'cancellation_reason' => $validated['cancellation_reason'],
        ]);

        return back()->with('success', 'Rendez-vous annulé.');
    }

    public function approve(VisitAppointment $appointment): RedirectResponse
    {
        $this->authorize('approve', $appointment);

        $appointment->update(['status' => 'approved']);

        return back()->with('success', 'Rendez-vous validé.');
    }

    public function refuse(Request $request, VisitAppointment $appointment): RedirectResponse
    {
        $this->authorize('refuse', $appointment);

        $validated = $request->validate([
            'refusal_reason' => 'required|string|max:500',
        ]);

        $appointment->update([
            'status'          => 'refused',
            'refusal_reason'  => $validated['refusal_reason'],
        ]);

        return back()->with('success', 'Rendez-vous refusé.');
    }
}
