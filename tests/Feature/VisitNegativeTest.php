<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use App\Models\VisitAppointment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class VisitNegativeTest extends TestCase
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

    public function test_commercial_can_create_negative_visit_for_his_own_appointment(): void
    {
        $user = User::factory()->create();
        $user->assignRole('commercial');
        $client = $this->makeClient();
        $appointment = $this->makeAppointment($user, $client);

        $this->actingAs($user)
            ->post('/visit-negatives', [
                'appointment_id' => $appointment->id,
                'client_id' => $client->id,
                'visit_date' => now()->toDateString(),
                'motif_refus' => 'price',
                'notes' => 'Budget insuffisant',
            ])
            ->assertStatus(302);

        $this->assertDatabaseHas('visit_negatives', [
            'appointment_id' => $appointment->id,
            'user_id' => $user->id,
            'motif_refus' => 'price',
        ]);
        $this->assertDatabaseHas('visit_appointments', [
            'id' => $appointment->id,
            'status' => 'completed',
        ]);
    }

    public function test_commercial_cannot_create_negative_visit_for_another_tc_appointment(): void
    {
        $user = User::factory()->create();
        $user->assignRole('commercial');

        $other = User::factory()->create();
        $other->assignRole('commercial');
        $client = $this->makeClient();
        $appointment = $this->makeAppointment($other, $client);

        $this->actingAs($user)
            ->post('/visit-negatives', [
                'appointment_id' => $appointment->id,
                'client_id' => $client->id,
                'visit_date' => now()->toDateString(),
                'motif_refus' => 'competitor',
            ])
            ->assertStatus(403);

        $this->assertDatabaseMissing('visit_negatives', [
            'appointment_id' => $appointment->id,
        ]);
    }

    public function test_admin_can_create_negative_visit_for_any_appointment(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $commercial = User::factory()->create();
        $commercial->assignRole('commercial');
        $client = $this->makeClient();
        $appointment = $this->makeAppointment($commercial, $client);

        $this->actingAs($user)
            ->post('/visit-negatives', [
                'appointment_id' => $appointment->id,
                'client_id' => $client->id,
                'visit_date' => now()->toDateString(),
                'motif_refus' => 'no_need',
            ])
            ->assertStatus(302);

        $this->assertDatabaseHas('visit_negatives', [
            'appointment_id' => $appointment->id,
            'user_id' => $user->id,
            'motif_refus' => 'no_need',
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

    private function makeAppointment(User $user, Client $client): VisitAppointment
    {
        return VisitAppointment::create([
            'user_id' => $user->id,
            'client_id' => $client->id,
            'scheduled_date' => now()->toDateString(),
            'status' => 'planned',
        ]);
    }
}
