<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Visit Actions — Section F du carnet de visite.
 * Chaque visite peut avoir jusqu'à 3 actions à réaliser.
 * Séparé de visits pour éviter les colonnes répétitives (action_1, action_2…).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visit_actions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('visit_id')
                ->constrained()
                ->cascadeOnDelete(); // Si la visite est supprimée, ses actions aussi

            $table->unsignedTinyInteger('sort_order'); // Ordre d'affichage (1, 2, 3)
            $table->text('action')->nullable();         // Description de l'action
            $table->string('responsible')->nullable();  // TC / RD / Client
            $table->date('due_date')->nullable();       // Date d'échéance

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visit_actions');
    }
};
