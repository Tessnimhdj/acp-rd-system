<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Visit;

class VisitPolicy
{
    /**
     * Qui peut voir la liste des visites ?
     * - commercial         → ses visites (filtrage dans le Controller via forRole)
     * - responsable_commercial → visites de l'équipe (filtrage dans le Controller)
     * - rd                 → visites soumises/en cours (filtrage dans le Controller)
     * - production         → visites approuvées (filtrage dans le Controller)
     * - admin              → tout
     *
     * La Policy dit OUI/NON — le filtrage exact est dans scopeForRole (Visit Model)
     */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            'admin',
            'commercial',
            'responsable_commercial',
            'rd',
            'production',
        ]);
    }

    /**
     * Qui peut voir UNE visite spécifique ?
     */
    public function view(User $user, Visit $visit): bool
    {
        // Admin voit tout
        if ($user->hasRole('admin')) {
            return true;
        }

        // Responsable voit les visites de son équipe
        if ($user->hasRole('responsable_commercial')) {
            return true; // le filtrage est déjà fait dans forRole
        }

        // Commercial voit ses propres visites
        if ($user->hasRole('commercial')) {
            return $visit->user_id === $user->id;
        }

        // R&D voit les visites soumises ou en cours
        if ($user->hasRole('rd')) {
            return in_array($visit->status, [
                Visit::STATUS_SUBMITTED,
                Visit::STATUS_IN_RD,
            ]);
        }

        // Production voit les visites approuvées
        if ($user->hasRole('production')) {
            return $visit->status === Visit::STATUS_APPROVED;
        }

        return false;
    }

    /**
     * Qui peut créer une visite ?
     */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'commercial', 'responsable_commercial']);
    }

    /**
     * Qui peut modifier une visite ?
     */
    public function update(User $user, Visit $visit): bool
    {
        // Admin modifie tout
        if ($user->hasRole('admin')) {
            return true;
        }

        // R&D modifie rd_code et status uniquement (via edit-rd-fields)
        if ($user->hasRole('rd')) {
            return in_array($visit->status, [
                Visit::STATUS_SUBMITTED,
                Visit::STATUS_IN_RD,
            ]);
        }

        // Commercial modifie ses propres visites
        if ($user->hasRole('commercial')) {
            return $visit->user_id === $user->id;
        }

        return false;
    }

    /**
     * Qui peut supprimer une visite ? Admin uniquement.
     */
    public function delete(User $user, Visit $visit): bool
    {
        return $user->hasRole('admin');
    }
}
