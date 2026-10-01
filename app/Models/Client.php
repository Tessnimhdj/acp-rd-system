<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Class Client
 * * Représente une fromagerie ou usine partenaire de ACP Solution.
 * Gère la génération automatique de la référence unique (REF-CLI-XXXX).
 */
class Client extends Model
{
    use HasFactory;

    /**
     * @var string Le nom de la table associée au modèle.
     */
    protected $table = 'clients';

    /**
     * @var array Les attributs qui peuvent être assignés en masse.
     */
    protected $fillable = [
        'ref_cli',
        'company_name',
        'sector',
        'address',
    ];

    /**
     * Événement de démarrage du modèle (Boot Method).
     * Génère automatiquement une référence client unique avant la création dans la base de données.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($client) {
            // Récupère le dernier client enregistré pour incrémenter l'identifiant
            $latestClient = static::latest('id')->first();
            $nextId = $latestClient ? $latestClient->id + 1 : 1;

            // Formatage de la référence automatique : REF-CLI-0001, REF-CLI-0002...
            $client->ref_cli = 'REF-CLI-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
        });
    }

    /**
     * Relation entre le Client et ses Visites.
     * Un client (fromagerie) peut recevoir plusieurs visites technico-commerciales.
     * * @return HasMany
     */
    public function visits(): HasMany
    {
        return $this->hasMany(Visit::class);
    }
}
