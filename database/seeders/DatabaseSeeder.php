<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $tenant = \App\Models\Tenant::create([
            'name' => 'Odani Factory',
            'domain' => 'odani.test',
        ]);

        $admin = \App\Models\User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Textile Admin',
            'email' => 'admin@odani.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'admin',
        ]);

        // Sample Suppliers
        $suppliers = [
            ['name' => 'Global Fabrics', 'shop_name' => 'Global Fabrics Ltd', 'city' => 'Surat'],
            ['name' => 'Elite Textiles', 'shop_name' => 'Elite Textiles Co', 'city' => 'Ahmedabad'],
        ];
        foreach ($suppliers as $s) {
            \App\Models\Supplier::create(array_merge($s, ['tenant_id' => $tenant->id]));
        }

        // Sample Work Types
        $workTypes = ['Cutting', 'Stitching', 'Finishing', 'Packaging'];
        foreach ($workTypes as $wt) {
            \App\Models\WorkType::create(['tenant_id' => $tenant->id, 'name' => $wt]);
        }

        // Sample Workers
        $workers = [
            ['name' => 'John Doe', 'mobile' => '9876543210'],
            ['name' => 'Jane Smith', 'mobile' => '9876543211'],
        ];
        foreach ($workers as $w) {
            \App\Models\Worker::create(array_merge($w, ['tenant_id' => $tenant->id]));
        }
    }
}
