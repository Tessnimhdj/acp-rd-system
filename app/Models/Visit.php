<?php



namespace App\Models;



use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

use Illuminate\Database\Eloquent\Relations\HasMany;



class Visit extends Model

{

    protected $fillable = [

        'user_id',

        'client_id',

        'rd_code',

        'visit_number',

        'contact_name',

        'contact_role',

        'contact_phone_email',

        'visit_date',

        'start_time',

        'end_time',

        'location',

        'participants',

        'visit_types',

        'visit_objective',

        'application_types',

        'finished_product',

        'annual_volume',

        'target_mg',

        'target_ph',

        'target_ms',

        'target_markets',

        'problems',

        'stabilizer_functions',

        'desired_textures',

        'process_constraints',

        'max_dosage',

        'regulatory_constraints',

        'current_supplier',

        'current_dosage',

        'satisfaction',

        'change_reason',

        'budget_dzd_kg',

        'budget_dzd_t_pf',

        'decision_deadline',

    ];



    protected $casts = [

        'visit_date' => 'date',

        'decision_deadline' => 'date',

        'visit_types' => 'array',

        'application_types' => 'array',

        'target_markets' => 'array',

        'stabilizer_functions' => 'array',

        'desired_textures' => 'array',

        'annual_volume' => 'decimal:2',

        'target_mg' => 'decimal:2',

        'target_ph' => 'decimal:2',

        'target_ms' => 'decimal:2',

        'max_dosage' => 'decimal:2',

        'current_dosage' => 'decimal:2',

        'budget_dzd_kg' => 'decimal:2',

        'budget_dzd_t_pf' => 'decimal:2',

    ];



    public function user(): BelongsTo

    {

        return $this->belongsTo(User::class);

    }



    public function client(): BelongsTo

    {

        return $this->belongsTo(Client::class);

    }



    public function actions(): HasMany

    {

        return $this->hasMany(VisitAction::class)->orderBy('sort_order');

    }



    public static function nextVisitNumber(): int

    {

        return (int) static::max('visit_number') + 1;

    }

}


