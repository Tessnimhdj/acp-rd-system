<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Client::class, 'client', [
            'except' => ['store'],
        ]);
    }

    public function index(): Response
    {
        $clients = Client::withCount('visits')
            ->latest()
            ->get();

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'canCreate' => auth()->user()->can('create', Client::class),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', Client::class);

        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'sector' => 'nullable|string|max:255',
            'address' => 'nullable|string',
        ]);

        Client::create($validated);

        return redirect()->back()->with('success', 'Client créé avec succès !');
    }
}
