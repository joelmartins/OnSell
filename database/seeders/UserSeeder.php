<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Usuário Admin
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@onsell.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('admin.super');
        
        // Usuário Agência
        $agency = User::create([
            'name' => 'Agência',
            'email' => 'agencia@onsell.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $agency->assignRole('agency.owner');
        
        // Usuário Cliente
        $client = User::create([
            'name' => 'Cliente',
            'email' => 'cliente@onsell.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
        $client->assignRole('client.user');
    }
} 