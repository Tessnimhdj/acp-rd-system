<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\User;
use App\Models\Visit;
use App\Models\VisitAppointment;
use App\Models\VisitNegative;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $tc = User::where('email', 'tc@acpsolution.com')->firstOrFail();
            User::where('email', 'admin@acpsolution.com')->firstOrFail();
            User::where('email', 'responsable@acpsolution.com')->firstOrFail();
            User::where('email', 'rd@acpsolution.com')->firstOrFail();
            User::where('email', 'production@acpsolution.com')->firstOrFail();

            $karim = $this->commercialUser('Karim Benali', 'karim@acpsolution.com');
            $sara = $this->commercialUser('Sara Mansouri', 'sara@acpsolution.com');
            $yacine = $this->commercialUser('Yacine Haddad', 'yacine@acpsolution.com');

            $clients = $this->seedClients();

            $this->seedTcAppointments($tc, $clients);
            $this->seedKarimAppointments($karim, $clients);
            $this->seedSaraAppointments($sara, $clients);
            $this->seedYacineAppointments($yacine, $clients);
        });
    }

    private function commercialUser(string $name, string $email): User
    {
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        if (! $user->hasRole('commercial')) {
            $user->assignRole('commercial');
        }

        return $user;
    }

    /**
     * @return array<string, Client>
     */
    private function seedClients(): array
    {
        $rows = [
            ['ref_cli' => 'REF-CLI-001', 'company_name' => 'Fromagerie Djurdjura', 'sector' => 'Fromagerie', 'address' => 'Tizi Ouzou'],
            ['ref_cli' => 'REF-CLI-002', 'company_name' => 'Laiterie Soummam', 'sector' => 'Laiterie', 'address' => 'Béjaïa'],
            ['ref_cli' => 'REF-CLI-003', 'company_name' => 'Fromagerie Aurès', 'sector' => 'Fromagerie', 'address' => 'Batna'],
            ['ref_cli' => 'REF-CLI-004', 'company_name' => 'Glaces Ramy', 'sector' => 'Glace', 'address' => 'Alger'],
            ['ref_cli' => 'REF-CLI-005', 'company_name' => 'Yaourt El Fen', 'sector' => 'Yaourt', 'address' => 'Blida'],
            ['ref_cli' => 'REF-CLI-006', 'company_name' => 'Pâtisserie Moderne', 'sector' => 'Pâtisserie', 'address' => 'Oran'],
            ['ref_cli' => 'REF-CLI-007', 'company_name' => 'Laiterie Atlas', 'sector' => 'Laiterie', 'address' => 'Sétif'],
            ['ref_cli' => 'REF-CLI-008', 'company_name' => 'Fromagerie Numidia', 'sector' => 'Fromagerie', 'address' => 'Constantine'],
        ];

        $clients = [];

        Client::withoutEvents(function () use ($rows, &$clients) {
            foreach ($rows as $row) {
                $clients[$row['ref_cli']] = Client::updateOrCreate(
                    ['ref_cli' => $row['ref_cli']],
                    [
                        'company_name' => $row['company_name'],
                        'sector' => $row['sector'],
                        'address' => $row['address'],
                    ]
                );
            }
        });

        return $clients;
    }

    /**
     * @param  array<string, Client>  $clients
     */
    private function seedTcAppointments(User $tc, array $clients): void
    {
        $this->appointment($tc, $clients['REF-CLI-001'], $this->futureInMonth(2), '09:00', 'pending', 'Présentation STA-TEX — fromage à pâte pressée');
        $this->appointment($tc, $clients['REF-CLI-002'], $this->futureInMonth(4), '10:30', 'pending', 'Essai YOG-TEX sur ligne yaourt brassé');
        $this->appointment($tc, $clients['REF-CLI-003'], $this->futureInMonth(6), '14:00', 'pending', 'Diagnostic synérèse — fromage frais');

        $this->appointment($tc, $clients['REF-CLI-004'], $this->futureInMonth(3), '09:30', 'approved', 'Essai ICE-TEX — tenue au choc thermique');
        $this->appointment($tc, $clients['REF-CLI-005'], $this->futureInMonth(7), '11:00', 'approved', 'Suivi texture yaourt à boire');
        $this->appointment($tc, $clients['REF-CLI-006'], $this->futureInMonth(10), '15:30', 'approved', 'Présentation STAFILLING — crèmes pâtissières');

        $this->appointment(
            $tc,
            $clients['REF-CLI-007'],
            $this->futureInMonth(5),
            '08:30',
            'refused',
            'Audit process UHT',
            'Direction indisponible — report non confirmé'
        );
        $this->appointment(
            $tc,
            $clients['REF-CLI-008'],
            $this->futureInMonth(9),
            '16:00',
            'refused',
            'Proposition AXIONA — fromage fondu',
            'Budget 2026 non encore validé'
        );

        $this->appointment($tc, $clients['REF-CLI-001'], now()->toDateString(), '10:00', 'approved', 'Visite du jour — suivi essai STA-TEX');

        $aboutiA = $this->appointment(
            $tc,
            $clients['REF-CLI-001'],
            now()->subDays(12)->toDateString(),
            '09:00',
            'completed',
            'Essai STA-TEX fromage Edam — visite aboutie'
        );
        $aboutiB = $this->appointment(
            $tc,
            $clients['REF-CLI-002'],
            now()->subDays(8)->toDateString(),
            '10:00',
            'completed',
            'Essai YOG-TEX — visite aboutie'
        );

        $nonAboutiA = $this->appointment(
            $tc,
            $clients['REF-CLI-004'],
            now()->subDays(15)->toDateString(),
            '11:00',
            'completed',
            'Proposition ICE-TEX — visite non aboutie'
        );
        $nonAboutiB = $this->appointment(
            $tc,
            $clients['REF-CLI-005'],
            now()->subDays(5)->toDateString(),
            '14:30',
            'completed',
            'Proposition V-TEX — visite non aboutie'
        );

        $visitSubmitted = Visit::create($this->visitPayload($tc, $clients['REF-CLI-001'], $aboutiA, [
            'status' => Visit::STATUS_SUBMITTED,
            'contact_name' => 'Ahmed Meziane',
            'contact_role' => 'Directeur production',
            'contact_phone_email' => 'a.meziane@djurdjura.dz',
            'visit_date' => $aboutiA->scheduled_date,
            'start_time' => '09:00',
            'end_time' => '11:00',
            'location' => 'Usine Tizi Ouzou',
            'visit_objective' => 'Stabiliser la coupe et limiter le relargage d’eau sur fromage Edam.',
            'finished_product' => 'Fromage Edam 45 % MG',
            'problems' => 'Synérèse en conservation et texture trop friable en fin de process.',
            'rd_code' => null,
        ]));

        $visitInRd = Visit::create($this->visitPayload($tc, $clients['REF-CLI-002'], $aboutiB, [
            'status' => Visit::STATUS_IN_RD,
            'contact_name' => 'Nadia Amrani',
            'contact_role' => 'Responsable qualité',
            'contact_phone_email' => 'n.amrani@soummam.dz',
            'visit_date' => $aboutiB->scheduled_date,
            'start_time' => '10:00',
            'end_time' => '12:15',
            'location' => 'Site Béjaïa',
            'visit_objective' => 'Améliorer la viscosité du yaourt brassé après 21 jours.',
            'finished_product' => 'Yaourt brassé nature 3,2 % MG',
            'problems' => 'Chute de viscosité et léger déphasage en D+21.',
            'rd_code' => 'RD-2026-014',
        ]));

        $approvedDate = now()->subDays(20)->toDateString();
        Visit::create($this->visitPayload($tc, $clients['REF-CLI-003'], null, [
            'status' => Visit::STATUS_APPROVED,
            'contact_name' => 'Karim Chaoui',
            'contact_role' => 'Chef d’atelier',
            'contact_phone_email' => 'k.chaoui@aures.dz',
            'visit_date' => $approvedDate,
            'start_time' => '08:30',
            'end_time' => '10:45',
            'location' => 'Fromagerie Batna',
            'visit_objective' => 'Valider une formule STACH pour fromage à pâte molle.',
            'finished_product' => 'Fromage à pâte molle type Camembert',
            'problems' => 'Croûte irrégulière et tenue insuffisante au tranchage.',
            'rd_code' => 'RD-2026-008',
        ]));

        $aboutiA->update(['visit_id' => $visitSubmitted->id]);
        $aboutiB->update(['visit_id' => $visitInRd->id]);

        $negPrice = VisitNegative::create([
            'appointment_id' => $nonAboutiA->id,
            'client_id' => $clients['REF-CLI-004']->id,
            'user_id' => $tc->id,
            'visit_date' => $nonAboutiA->scheduled_date,
            'motif_refus' => 'price',
            'notes' => 'Le client juge le coût kg trop élevé par rapport au stabilisant actuel. Relance prévue après révision budget T4.',
        ]);

        $negCompetitor = VisitNegative::create([
            'appointment_id' => $nonAboutiB->id,
            'client_id' => $clients['REF-CLI-005']->id,
            'user_id' => $tc->id,
            'visit_date' => $nonAboutiB->scheduled_date,
            'motif_refus' => 'competitor',
            'notes' => 'Contrat annuel déjà signé avec un concurrent (offre packagée + SAV). Réouverture possible en 2027.',
        ]);

        $nonAboutiA->update(['negative_id' => $negPrice->id]);
        $nonAboutiB->update(['negative_id' => $negCompetitor->id]);
    }

    /**
     * @param  array<string, Client>  $clients
     */
    private function seedKarimAppointments(User $karim, array $clients): void
    {
        $this->appointment($karim, $clients['REF-CLI-003'], $this->futureInMonth(2), '08:45', 'pending', 'Prise de contact — fromage Aurès');
        $this->appointment($karim, $clients['REF-CLI-007'], $this->futureInMonth(8), '13:00', 'pending', 'Présentation EMULSA — lait aromatisé');

        $this->appointment($karim, $clients['REF-CLI-008'], $this->futureInMonth(4), '09:15', 'approved', 'Essai STACH — fromage Numidia');
        $this->appointment($karim, $clients['REF-CLI-006'], $this->futureInMonth(11), '15:00', 'approved', 'Essai PUDD-TEX — crèmes desserts');

        $this->appointment(
            $karim,
            $clients['REF-CLI-004'],
            $this->futureInMonth(6),
            '10:00',
            'refused',
            'Démo ICE-TEX glaces bâtonnet',
            'Ligne en maintenance — visite reportée sans date'
        );
    }

    /**
     * @param  array<string, Client>  $clients
     */
    private function seedSaraAppointments(User $sara, array $clients): void
    {
        $this->appointment($sara, $clients['REF-CLI-005'], $this->futureInMonth(3), '09:00', 'approved', 'Essai YOG-TEX — El Fen');
        $this->appointment($sara, $clients['REF-CLI-002'], $this->futureInMonth(12), '14:00', 'approved', 'Suivi viscosité Soummam');
        $this->appointment($sara, $clients['REF-CLI-001'], $this->futureInMonth(8), '11:30', 'pending', 'Nouvelle offre STA-TEX Djurdjura');
    }

    /**
     * @param  array<string, Client>  $clients
     */
    private function seedYacineAppointments(User $yacine, array $clients): void
    {
        $this->appointment($yacine, $clients['REF-CLI-006'], $this->futureInMonth(5), '10:00', 'approved', 'Présentation STAMY — pâte feuilletée');
        $this->appointment($yacine, $clients['REF-CLI-008'], $this->futureInMonth(7), '09:00', 'pending', 'Audit texture fromage fondu');
        $this->appointment(
            $yacine,
            $clients['REF-CLI-007'],
            $this->futureInMonth(9),
            '16:30',
            'refused',
            'Proposition V-TEX lait fermenté',
            'Pas de besoin immédiat — stocks stabilisant encore élevés'
        );
    }

    private function appointment(
        User $user,
        Client $client,
        string $date,
        string $time,
        string $status,
        string $objective,
        ?string $refusalReason = null
    ): VisitAppointment {
        return VisitAppointment::create([
            'user_id' => $user->id,
            'client_id' => $client->id,
            'scheduled_date' => $date,
            'scheduled_time' => $time,
            'objective' => $objective,
            'status' => $status,
            'refusal_reason' => $refusalReason,
        ]);
    }

    private function visitPayload(User $user, Client $client, ?VisitAppointment $appointment, array $extra): array
    {
        return array_merge([
            'user_id' => $user->id,
            'client_id' => $client->id,
            'appointment_id' => $appointment?->id,
            'visit_number' => Visit::nextVisitNumber(),
            'visit_types' => ['technique'],
            'application_types' => ['fromage'],
            'target_markets' => ['local'],
            'stabilizer_functions' => ['texture', 'synerese'],
            'desired_textures' => ['ferme', 'onctueux'],
            'annual_volume' => 120.00,
            'participants' => 'TC ACP + équipe production client',
        ], $extra);
    }

    private function futureInMonth(int $daysFromToday): string
    {
        $date = Carbon::now()->addDays($daysFromToday);
        $end = Carbon::now()->endOfMonth();

        if ($date->gt($end)) {
            $date = $end->copy()->subDays(($daysFromToday % 5));
            if ($date->lt(Carbon::now())) {
                $date = $end->copy();
            }
        }

        return $date->toDateString();
    }
}
