<?php

namespace App\Policies;

use App\Models\User;
use App\Models\VisitAppointment;

class AppointmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([
            'admin', 'responsable_commercial', 'commercial'
        ]);
    }

    public function view(User $user, VisitAppointment $appointment): bool
    {
        if ($user->hasRole('admin')) return true;
        if ($user->hasRole('responsable_commercial')) return true;
        return $appointment->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['commercial', 'responsable_commercial']);
    }

    public function update(User $user, VisitAppointment $appointment): bool
    {
        if ($user->hasRole('admin')) return true;
        return $appointment->user_id === $user->id;
    }

    public function cancel(User $user, VisitAppointment $appointment): bool
    {
        if ($user->hasRole('admin')) return true;
        return $appointment->user_id === $user->id;
    }

    public function approve(User $user, VisitAppointment $appointment): bool
    {
        return $user->hasRole('responsable_commercial')
            && $appointment->status === 'pending';
    }

    public function refuse(User $user, VisitAppointment $appointment): bool
    {
        return $user->hasRole('responsable_commercial')
            && $appointment->status === 'pending';
    }

    public function delete(User $user, VisitAppointment $appointment): bool
    {
        return $user->hasRole('admin');
    }
}
