<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use App\Models\VisitAppointment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AppointmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (['admin', 'responsable_commercial', 'commercial', 'rd', 'production'] as $role) {
            Role::findOrCreate($role, 'web');
        }
    }

    public function test_commercial_can_create_an_appointment(): void
    {
        $user = User::factory()->create();
        $user->assignRole('commercial');
        $client = $this->makeClient();

        $this->actingAs($user)
            ->from('/planning')
            ->post('/appointments', [
                'client_id' => $client->id,
                'scheduled_date' => now()->toDateString(),
                'scheduled_time' => '10:00',
                'objective' => 'Présentation produit',
            ])
            ->assertStatus(302);

        $this->assertDatabaseHas('visit_appointments', [
            'user_id' => $user->id,
            'client_id' => $client->id,
            'status' => 'planned',
        ]);
    }

    public function test_commercial_cannot_create_appointment_for_another_user(): void
    {
        $user = User::factory()->create();
        $user->assignRole('commercial');

        $other = User::factory()->create();
        $other->assignRole('commercial');
        $client = $this->makeClient();

        $this->actingAs($user)
            ->from('/planning')
            ->post('/appointments', [
                'client_id' => $client->id,
                'scheduled_date' => now()->toDateString(),
                'user_id' => $other->id,
            ])
            ->assertStatus(302);

        $this->assertDatabaseHas('visit_appointments', [
            'client_id' => $client->id,
            'user_id' => $user->id,
        ]);
        $this->assertDatabaseMissing('visit_appointments', [
            'client_id' => $client->id,
            'user_id' => $other->id,
        ]);
    }

    public function test_responsable_commercial_can_create_appointment(): void
    {
        $user = User::factory()->create();
        $user->assignRole('responsable_commercial');
        $client = $this->makeClient();

        $this->actingAs($user)
            ->from('/planning')
            ->post('/appointments', [
                'client_id' => $client->id,
                'scheduled_date' => now()->toDateString(),
            ])
            ->assertStatus(302);

        $this->assertDatabaseHas('visit_appointments', [
            'user_id' => $user->id,
            'client_id' => $client->id,
        ]);
    }

    public function test_admin_cannot_create_appointment(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        $client = $this->makeClient();

        $this->actingAs($user)
            ->post('/appointments', [
                'client_id' => $client->id,
                'scheduled_date' => now()->toDateString(),
            ])
            ->assertStatus(403);
    }

    public function test_only_owner_or_admin_can_cancel_appointment(): void
    {
        $owner = User::factory()->create();
        $owner->assignRole('commercial');
        $admin = User::factory()->create();
        $admin->assignRole('admin');
        $client = $this->makeClient();

        $owned = VisitAppointment::create([
            'user_id' => $owner->id,
            'client_id' => $client->id,
            'scheduled_date' => now()->toDateString(),
            'status' => 'planned',
        ]);

        $this->actingAs($owner)
            ->from('/planning')
            ->patch('/appointments/'.$owned->id.'/cancel', [
                'cancellation_reason' => 'Client indisponible',
            ])
            ->assertStatus(302);

        $this->assertDatabaseHas('visit_appointments', [
            'id' => $owned->id,
            'status' => 'cancelled',
        ]);

        $forAdmin = VisitAppointment::create([
            'user_id' => $owner->id,
            'client_id' => $client->id,
            'scheduled_date' => now()->addDay()->toDateString(),
            'status' => 'planned',
        ]);

        $this->actingAs($admin)
            ->from('/planning')
            ->patch('/appointments/'.$forAdmin->id.'/cancel', [
                'cancellation_reason' => 'Annulé par admin',
            ])
            ->assertStatus(302);

        $this->assertDatabaseHas('visit_appointments', [
            'id' => $forAdmin->id,
            'status' => 'cancelled',
        ]);
    }

    public function test_commercial_cannot_cancel_another_tc_appointment(): void
    {
        $user = User::factory()->create();
        $user->assignRole('commercial');

        $other = User::factory()->create();
        $other->assignRole('commercial');
        $client = $this->makeClient();

        $appointment = VisitAppointment::create([
            'user_id' => $other->id,
            'client_id' => $client->id,
            'scheduled_date' => now()->toDateString(),
            'status' => 'planned',
        ]);

        $this->actingAs($user)
            ->patch('/appointments/'.$appointment->id.'/cancel', [
                'cancellation_reason' => 'Tentative non autorisée',
            ])
            ->assertStatus(403);

        $this->assertDatabaseHas('visit_appointments', [
            'id' => $appointment->id,
            'status' => 'planned',
        ]);
    }

    private function makeClient(): Client
    {
        return Client::create([
            'company_name' => 'Fromagerie Test',
            'sector' => 'Fromage',
            'address' => 'Alger',
        ]);
    }
}
