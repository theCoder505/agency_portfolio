<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            CategorySeeder::class,
            PortfolioSeeder::class,
            SettingSeeder::class,
            TeamSeeder::class,
            ReviewSeeder::class,
            VisitorLogSeeder::class,
            ContactSeeder::class,
            BlogSeeder::class,
            SaasProductSeeder::class,
            CustomerSubscriptionSeeder::class,
        ]);
    }
}
