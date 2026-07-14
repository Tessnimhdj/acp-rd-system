<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function index(): Response
    {
        $users = User::where('role', 'commercial')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role']);

        return Inertia::render('Team/Index', [
            'users' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'commercial',
            'email_verified_at' => now(),
        ]);

        $user->syncRoles(['commercial']);

        return redirect()
            ->back()
            ->with('success', 'Commercial créé avec succès.');
    }
}
