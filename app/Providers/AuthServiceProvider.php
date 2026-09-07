<?php

namespace App\Providers;

use App\Models\Client;
use App\Models\Visit;
use App\Models\VisitAppointment;
use App\Policies\AppointmentPolicy;
use App\Policies\ClientPolicy;
use App\Policies\VisitPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Visit::class => VisitPolicy::class,
        Client::class => ClientPolicy::class,
        VisitAppointment::class => AppointmentPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        //
    }
}
