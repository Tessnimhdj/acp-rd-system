<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;

class ClientPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('view-clients');
    }

    public function create(User $user): bool
    {
        return $user->can('manage-clients');
    }

    public function view(User $user, Client $client): bool
    {
        return $user->can('view-clients');
    }
}
