<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Clients — Les fromageries (usines) avec lesquelles ACP Solution travaille.
 * Un client peut avoir plusieurs visites.
 * REF-CLI est généré automatiquement par le modèle Client.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();

            // Référence unique — générée automatiquement (REF-CLI-001, REF-CLI-002…)
            $table->string('ref_cli', 20)->unique();

            // Informations stables de la fromagerie (ne changent pas d'une visite à l'autre)
            $table->string('company_name');
            $table->string('sector')->nullable();
            $table->text('address')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
