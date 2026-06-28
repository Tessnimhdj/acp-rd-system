<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Visits — Une visite technico-commerciale chez un client.
 * Chaque visite est liée à :
 *   - un client (client_id) → la fromagerie visitée
 *   - un utilisateur (user_id) → le TC qui a effectué la visite
 *
 * Les données stables du client (company_name, sector, address)
 * sont dans la table clients, pas ici.
 * Ici on ne garde que ce qui est propre à CETTE visite.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visits', function (Blueprint $table) {
            $table->id();

            // ── Relations ─────────────────────────────────────────────────
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();   // TC qui a fait la visite

            $table->foreignId('client_id')
                ->constrained()
                ->cascadeOnDelete();   // Fromagerie visitée

            // ── Identifiants ──────────────────────────────────────────────
            $table->string('rd_code')->nullable();              // Attribué par R&D après étude
            $table->unsignedInteger('visit_number')->unique();  // N° séquentiel (001, 002…)

            // ── A — Interlocuteur de la visite ────────────────────────────
            // (propre à cette visite — peut changer d'une visite à l'autre)
            $table->string('contact_name');
            $table->string('contact_role')->nullable();
            $table->string('contact_phone_email')->nullable();

            // ── B — Informations visite ───────────────────────────────────
            $table->date('visit_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('location')->nullable();
            $table->text('participants')->nullable();
            $table->json('visit_types')->nullable();
            $table->text('visit_objective');

            // ── C — Application produit ───────────────────────────────────
            $table->json('application_types')->nullable();
            $table->string('finished_product');
            $table->decimal('annual_volume', 12, 2)->nullable();
            $table->decimal('target_mg', 5, 2)->nullable();
            $table->decimal('target_ph', 4, 2)->nullable();
            $table->decimal('target_ms', 5, 2)->nullable();
            $table->json('target_markets')->nullable();

            // ── D — Besoins techniques ────────────────────────────────────
            $table->text('problems');
            $table->json('stabilizer_functions')->nullable();
            $table->json('desired_textures')->nullable();
            $table->text('process_constraints')->nullable();
            $table->decimal('max_dosage', 5, 2)->nullable();
            $table->text('regulatory_constraints')->nullable();

            // ── E — Situation concurrentielle ─────────────────────────────
            $table->string('current_supplier')->nullable();
            $table->decimal('current_dosage', 5, 2)->nullable();
            $table->unsignedTinyInteger('satisfaction')->nullable(); // 1 → 5
            $table->text('change_reason')->nullable();
            $table->decimal('budget_dzd_kg', 10, 2)->nullable();
            $table->decimal('budget_dzd_t_pf', 10, 2)->nullable();
            $table->date('decision_deadline')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};
