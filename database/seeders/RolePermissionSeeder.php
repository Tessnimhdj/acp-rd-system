<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // ── Nettoyage du cache des permissions  ──
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ── Création de toutes les permissions ────────────────────────────
        $permissions = [
            // Gestion des utilisateurs — Admin uniquement
            'manage-users',

            // Visites
            'manage-visits',         // Créer + modifier ses propres visites (Commercial)
            'view-all-visits',       // Voir toutes les visites (Admin + Responsable avant filtrage)
            'view-team-visits',      // Voir les visites de l'équipe (Responsable Commercial)
            'delete-visits',         // Supprimer une visite — Admin uniquement
            'edit-rd-fields',        // Modifier rd_code + status (R&D)
            'view-approved-visits',  // Voir uniquement les visites approuvées (Production)

            // Clients
            'manage-clients',        // Ajouter + modifier un client
            'view-clients',          // Voir la liste des clients
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // ── Création des cinq rôles ───────────────────────────────────────
        $admin              = Role::firstOrCreate(['name' => 'admin',                  'guard_name' => 'web']);
        $responsable        = Role::firstOrCreate(['name' => 'responsable_commercial', 'guard_name' => 'web']);
        $commercial         = Role::firstOrCreate(['name' => 'commercial',             'guard_name' => 'web']);
        $rd                 = Role::firstOrCreate(['name' => 'rd',                     'guard_name' => 'web']);
        $production         = Role::firstOrCreate(['name' => 'production',             'guard_name' => 'web']);

        // ── Attribution des permissions aux rôles ─────────────────────────

        // Admin — Toutes les permissions, y compris la suppression
        $admin->syncPermissions(Permission::all());

        // Responsable Commercial — Voit les visites de son équipe, pas de suppression
        $responsable->syncPermissions([
            'manage-visits',       // Peut aussi enregistrer une visite (optionnel)
            'view-team-visits',    // Voit les visites de tous les TC de l'entreprise
            'manage-clients',
            'view-clients',
        ]);

        // Commercial (TC) — Gère ses propres visites uniquement, pas de suppression
        $commercial->syncPermissions([
            'manage-visits',
            'manage-clients',
            'view-clients',
        ]);

        // R&D — Voit les nouvelles visites, modifie rd_code et le statut uniquement
        $rd->syncPermissions([
            'view-all-visits',
            'edit-rd-fields',
            'view-clients',
        ]);

        // Production — Voit uniquement les visites approuvées
        $production->syncPermissions([
            'view-approved-visits',
        ]);

        // ── Création des comptes utilisateurs ─────────────────────────────

        // Admin
        $adminUser = User::updateOrCreate(
            ['email' => 'admin@acpsolution.com'],
            [
                'name'              => 'Administrateur',
                'password'          => Hash::make('admin123'),
                'email_verified_at' => now(),
            ]
        );
        $adminUser->syncRoles(['admin']);

        // Responsable Commercial
        $responsableUser = User::updateOrCreate(
            ['email' => 'responsable@acpsolution.com'],
            [
                'name'              => 'Responsable Commercial',
                'password'          => Hash::make('resp123'),
                'email_verified_at' => now(),
            ]
        );
        $responsableUser->syncRoles(['responsable_commercial']);

        // Comptes de démonstration pour les autres rôles
        $demoUsers = [
            [
                'name'     => 'Mandataire TC',
                'email'    => 'tc@acpsolution.com',
                'password' => 'tc123',
                'role'     => 'commercial',
            ],
            [
                'name'     => 'Équipe R&D',
                'email'    => 'rd@acpsolution.com',
                'password' => 'rd123',
                'role'     => 'rd',
            ],
            [
                'name'     => 'Production',
                'email'    => 'production@acpsolution.com',
                'password' => 'prod123',
                'role'     => 'production',
            ],
        ];

        foreach ($demoUsers as $demo) {
            $user = User::updateOrCreate(
                ['email' => $demo['email']],
                [
                    'name'              => $demo['name'],
                    'password'          => Hash::make($demo['password']),
                    'email_verified_at' => now(),
                ]
            );
            $user->syncRoles([$demo['role']]);
        }
    }
}
