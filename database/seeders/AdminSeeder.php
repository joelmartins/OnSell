<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::create([
            'name' => 'Administrador',
            'email' => 'admin@onsell.com.br',
            'email_verified_at' => now(),
            'password' => Hash::make('onsell@123'),
            'is_active' => true,
        ]);

        $admin->assignRole('admin.super');
    }
} 