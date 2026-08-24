<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visit_appointments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('client_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('scheduled_date');
            $table->time('scheduled_time')->nullable();
            $table->string('objective')->nullable();
            $table->string('status')->default('planned');
            $table->string('cancellation_reason')->nullable();
            $table->date('postponed_to')->nullable();

            $table->unsignedBigInteger('visit_id')->nullable();
            $table->unsignedBigInteger('negative_id')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visit_appointments');
    }
};
