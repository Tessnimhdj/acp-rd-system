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
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'manage-users',
            'manage-visits',
            'view-all-visits',
            'manage-clients',
            'view-clients',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $commercial = Role::firstOrCreate(['name' => 'commercial', 'guard_name' => 'web']);
        $rd = Role::firstOrCreate(['name' => 'rd', 'guard_name' => 'web']);
        $production = Role::firstOrCreate(['name' => 'production', 'guard_name' => 'web']);

        $admin->syncPermissions(Permission::all());

        $commercial->syncPermissions([
            'manage-visits',
            'manage-clients',
            'view-clients',
        ]);

        $rd->syncPermissions([
            'view-all-visits',
            'view-clients',
        ]);

        $production->syncPermissions([
            'view-all-visits',
        ]);

        $adminUser = User::where('email', 'admin@acpsolution.com')->first();
        if ($adminUser) {
            $adminUser->syncRoles(['admin']);
        }

        $demoUsers = [
            ['name' => 'Mandataire TC', 'email' => 'tc@acpsolution.com', 'password' => 'tc123', 'role' => 'commercial'],
            ['name' => 'Équipe R&D', 'email' => 'rd@acpsolution.com', 'password' => 'rd123', 'role' => 'rd'],
            ['name' => 'Production', 'email' => 'production@acpsolution.com', 'password' => 'prod123', 'role' => 'production'],
        ];

        foreach ($demoUsers as $demo) {
            $user = User::updateOrCreate(
                ['email' => $demo['email']],
                [
                    'name' => $demo['name'],
                    'password' => Hash::make($demo['password']),
                    'email_verified_at' => now(),
                ]
            );
            $user->syncRoles([$demo['role']]);
        }
    }
}
