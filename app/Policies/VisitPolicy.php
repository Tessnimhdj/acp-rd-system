<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Visit;

class VisitPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('manage-visits') || $user->can('view-all-visits');
    }

    public function view(User $user, Visit $visit): bool
    {
        if ($user->can('view-all-visits')) {
            return true;
        }

        return $user->can('manage-visits') && $visit->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->can('manage-visits');
    }

    public function update(User $user, Visit $visit): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->can('manage-visits') && $visit->user_id === $user->id;
    }

    public function delete(User $user, Visit $visit): bool
    {
        return $this->update($user, $visit);
    }
}
