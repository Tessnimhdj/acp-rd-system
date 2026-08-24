<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Visit extends Model
{
    // ── ثوابت الحالات ────────────────────────────────────────────────────────
    const STATUS_SUBMITTED = 'submitted'; // TC سجّل الزيارة — بانتظار R&D
    const STATUS_IN_RD     = 'in_rd';     // R&D بدأ الدراسة
    const STATUS_APPROVED  = 'approved';  // معتمدة — Production يراها

    protected $fillable = [

        'user_id',

        'client_id',

        'rd_code',

        'status',

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

        'appointment_id',

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



    public function appointment(): BelongsTo

    {

        return $this->belongsTo(VisitAppointment::class);

    }



    public function actions(): HasMany

    {

        return $this->hasMany(VisitAction::class)->orderBy('sort_order');

    }



    // ── Scope: تصفية حسب الدور ────────────────────────────────────────────────
    /**
     * يُستخدم هكذا في Controller:
     *   Visit::forRole(auth()->user())->paginate(15);
     */
    public function scopeForRole(Builder $query, User $user): Builder
    {
        // Commercial — زياراته فقط
        if ($user->hasRole('commercial')) {
            return $query->where('user_id', $user->id);
        }

        // Responsable Commercial — زيارات كل TC في الشركة
        if ($user->hasRole('responsable_commercial')) {
            $commercialIds = User::role('commercial')->pluck('id');
            return $query->whereIn('user_id', $commercialIds);
        }

        // R&D — الزيارات الجديدة والتي قيد الدراسة
        if ($user->hasRole('rd')) {
            return $query->whereIn('status', [
                self::STATUS_SUBMITTED,
                self::STATUS_IN_RD,
            ]);
        }

        // Production — المعتمدة فقط
        if ($user->hasRole('production')) {
            return $query->where('status', self::STATUS_APPROVED);
        }

        // Admin — كل شيء
        return $query;
    }

    // ── Scope: الزيارات المجدولة (للـ Planning) ───────────────────────────────
    public function scopeScheduled(Builder $query): Builder
    {
        return $query->where('visit_date', '>=', today());
    }

    public static function nextVisitNumber(): int
    {
        return (int) static::max('visit_number') + 1;
    }
}
