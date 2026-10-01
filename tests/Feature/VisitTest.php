<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use App\Models\Visit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class VisitTest extends TestCase
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

    public function test_commercial_can_create_a_visit(): void
    {
        $user = User::factory()->create();
        $user->assignRole('commercial');
        $client = $this->makeClient();

        $this->actingAs($user)
            ->post('/visites', $this->visitPayload($client))
            ->assertStatus(302);

        $this->assertDatabaseHas('visits', [
            'user_id' => $user->id,
            'client_id' => $client->id,
            'contact_name' => 'Jean Dupont',
        ]);
    }

    public function test_commercial_cannot_see_other_tc_visits(): void
    {
        $user = User::factory()->create();
        $user->assignRole('commercial');

        $other = User::factory()->create();
        $other->assignRole('commercial');

        $visit = $this->makeVisit($other, $this->makeClient(), [
            'contact_name' => 'Secret Contact',
        ]);

        $this->actingAs($user)
            ->get('/visites/'.$visit->id)
            ->assertStatus(403);

        $this->actingAs($user)
            ->get('/visites')
            ->assertStatus(200)
            ->assertDontSee('Secret Contact');
    }

    public function test_responsable_commercial_can_see_team_visits(): void
    {
        $user = User::factory()->create();
        $user->assignRole('responsable_commercial');

        $commercial = User::factory()->create();
        $commercial->assignRole('commercial');

        $visit = $this->makeVisit($commercial, $this->makeClient(), [
            'contact_name' => 'Team Contact',
        ]);

        $this->actingAs($user)
            ->get('/visites')
            ->assertStatus(200)
            ->assertSee('Team Contact');

        $this->actingAs($user)
            ->get('/visites/'.$visit->id)
            ->assertStatus(200);
    }

    public function test_rd_can_update_visit_status_to_in_rd(): void
    {
        $user = User::factory()->create();
        $user->assignRole('rd');

        $commercial = User::factory()->create();
        $commercial->assignRole('commercial');
        $client = $this->makeClient();
        $visit = $this->makeVisit($commercial, $client);

        $this->actingAs($user)
            ->put('/visites/'.$visit->id, $this->visitPayload($client, [
                'status' => Visit::STATUS_IN_RD,
                'rd_code' => 'RD-001',
            ]))
            ->assertStatus(302);

        $this->assertDatabaseHas('visits', [
            'id' => $visit->id,
            'status' => Visit::STATUS_IN_RD,
            'rd_code' => 'RD-001',
        ]);
    }

    public function test_rd_cannot_update_visit_fields_a_to_f(): void
    {
        $user = User::factory()->create();
        $user->assignRole('rd');

        $commercial = User::factory()->create();
        $commercial->assignRole('commercial');
        $client = $this->makeClient();
        $visit = $this->makeVisit($commercial, $client, [
            'contact_name' => 'Original Contact',
            'visit_objective' => 'Original objective',
            'finished_product' => 'Original product',
            'problems' => 'Original problems',
        ]);

        $this->actingAs($user)
            ->put('/visites/'.$visit->id, $this->visitPayload($client, [
                'status' => Visit::STATUS_IN_RD,
                'contact_name' => 'Hacked Contact',
                'visit_objective' => 'Hacked objective',
                'finished_product' => 'Hacked product',
                'problems' => 'Hacked problems',
            ]))
            ->assertStatus(302);

        $visit->refresh();

        $this->assertSame('Original Contact', $visit->contact_name);
        $this->assertSame('Original objective', $visit->visit_objective);
        $this->assertSame('Original product', $visit->finished_product);
        $this->assertSame('Original problems', $visit->problems);
    }

    public function test_admin_can_delete_any_visit(): void
    {
        $user = User::factory()->create();
        $user->assignRole('admin');

        $commercial = User::factory()->create();
        $commercial->assignRole('commercial');
        $visit = $this->makeVisit($commercial, $this->makeClient());

        $this->actingAs($user)
            ->delete('/visites/'.$visit->id)
            ->assertStatus(302);

        $this->assertDatabaseMissing('visits', ['id' => $visit->id]);
    }

    public function test_commercial_cannot_delete_a_visit(): void
    {
        $user = User::factory()->create();
        $user->assignRole('commercial');
        $visit = $this->makeVisit($user, $this->makeClient());

        $this->actingAs($user)
            ->delete('/visites/'.$visit->id)
            ->assertStatus(403);

        $this->assertDatabaseHas('visits', ['id' => $visit->id]);
    }

    private function makeClient(): Client
    {
        return Client::create([
            'company_name' => 'Fromagerie Test',
            'sector' => 'Fromage',
            'address' => 'Alger',
        ]);
    }

    private function visitPayload(Client $client, array $overrides = []): array
    {
        return array_merge([
            'client_id' => $client->id,
            'contact_name' => 'Jean Dupont',
            'contact_role' => 'Directeur',
            'visit_date' => now()->toDateString(),
            'visit_objective' => 'Présenter les stabilisants',
            'application_types' => ['fromage'],
            'finished_product' => 'Fromage frais',
            'problems' => 'Texture instable',
            'stabilizer_functions' => ['epaississant'],
            'desired_textures' => ['cremeux'],
        ], $overrides);
    }

    private function makeVisit(User $user, Client $client, array $overrides = []): Visit
    {
        return Visit::create(array_merge([
            'user_id' => $user->id,
            'client_id' => $client->id,
            'visit_number' => Visit::nextVisitNumber(),
            'status' => Visit::STATUS_SUBMITTED,
            'contact_name' => 'Jean Dupont',
            'visit_date' => now()->toDateString(),
            'visit_objective' => 'Présenter les stabilisants',
            'application_types' => ['fromage'],
            'finished_product' => 'Fromage frais',
            'problems' => 'Texture instable',
            'stabilizer_functions' => ['epaississant'],
            'desired_textures' => ['cremeux'],
        ], $overrides));
    }
}
