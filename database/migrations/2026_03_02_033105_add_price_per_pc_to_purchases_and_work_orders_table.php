<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->decimal('price_per_pc', 10, 2)->default(0)->after('date');
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->decimal('price_per_pc', 10, 2)->default(0)->after('work_type_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn('price_per_pc');
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn('price_per_pc');
        });
    }
};
