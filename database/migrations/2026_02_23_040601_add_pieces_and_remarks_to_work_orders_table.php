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
        Schema::table('work_orders', function (Blueprint $table) {
            $table->integer('no_of_pieces')->nullable()->after('deadline');
            $table->integer('due_pcs')->nullable()->after('received_pcs');
            $table->text('remarks')->nullable()->after('notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn(['no_of_pieces', 'due_pcs', 'remarks']);
        });
    }
};
