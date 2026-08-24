<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisitAppointment extends Model
{
    protected $fillable = [
        'user_id',
        'client_id',
        'scheduled_date',
        'scheduled_time',
        'objective',
        'status',
        'cancellation_reason',
        'postponed_to',
        'visit_id',
        'negative_id',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'postponed_to' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class, 'visit_id');
    }

    public function negative(): BelongsTo
    {
        return $this->belongsTo(VisitNegative::class, 'negative_id');
    }
}
