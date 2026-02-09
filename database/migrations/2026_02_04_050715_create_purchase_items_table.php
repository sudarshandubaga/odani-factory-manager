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
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('purchase_id')->constrained()->onDelete('cascade');
            $table->integer('s_no');
            $table->decimal('size_meters', 8, 2);
            $table->decimal('pat_raw', 8, 2);
            $table->integer('pat_round');
            $table->decimal('pieces_raw', 8, 2);
            $table->integer('pieces_round');
            $table->string('status')->default('pending'); // pending, assigned, completed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_items');
    }
};
