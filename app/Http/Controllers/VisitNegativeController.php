<?php

namespace App\Http\Controllers;

use App\Models\VisitAppointment;
use App\Models\VisitNegative;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VisitNegativeController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Visits/NegativeForm', [
            'appointment_id' => request('appointment_id'),
            'client_id'      => request('client_id'),
            'visit_date'     => request('date'),
            'client'         => \App\Models\Client::find(request('client_id')),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'appointment_id' => 'required|exists:visit_appointments,id',
            'client_id'      => 'required|exists:clients,id',
            'visit_date'     => 'required|date',
            'motif_refus'    => 'required|in:price,competitor,no_need,other',
            'motif_autre'    => 'nullable|required_if:motif_refus,other|string',
            'notes'          => 'nullable|string|max:1000',
        ]);

        $negative = VisitNegative::create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        VisitAppointment::whereKey($validated['appointment_id'])->update([
            'status'      => 'completed',
            'negative_id' => $negative->id,
        ]);

        return redirect()
            ->route('planning.index')
            ->with('success', 'Visite négative enregistrée.');
    }
}
