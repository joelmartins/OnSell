<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Papéis principais
        $adminRole = Role::create(['name' => 'admin.super']);
        $agencyRole = Role::create(['name' => 'agency.owner']);
        $clientRole = Role::create(['name' => 'client.user']);
        
        // Permissões
        $permissions = [
            // Permissões de Admin
            'view.admin.dashboard',
            'manage.agencies',
            'manage.clients',
            'manage.plans',
            'manage.integrations',
            'manage.settings',
            'impersonate.any',
            
            // Permissões de Agência
            'view.agency.dashboard',
            'manage.agency.clients',
            'manage.agency.branding',
            'manage.agency.plans',
            'manage.agency.settings',
            'impersonate.agency.clients',
            
            // Permissões de Cliente
            'view.client.dashboard',
            'manage.client.pipeline',
            'manage.client.messages',
            'manage.client.automation',
            'manage.client.contacts',
            'view.client.reports',
            'manage.client.integrations',
            'manage.client.settings',
        ];
        
        // Criar permissões
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }
        
        // Atribuir permissões aos papéis
        
        // Admin tem todas as permissões
        $adminRole->givePermissionTo(Permission::all());
        
        // Permissões da Agência
        $agencyPermissions = [
            'view.agency.dashboard',
            'manage.agency.clients',
            'manage.agency.branding',
            'manage.agency.plans',
            'manage.agency.settings',
            'impersonate.agency.clients',
        ];
        $agencyRole->givePermissionTo($agencyPermissions);
        
        // Permissões do Cliente
        $clientPermissions = [
            'view.client.dashboard',
            'manage.client.pipeline',
            'manage.client.messages',
            'manage.client.automation',
            'manage.client.contacts',
            'view.client.reports',
            'manage.client.integrations',
            'manage.client.settings',
        ];
        $clientRole->givePermissionTo($clientPermissions);
    }
} 