<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisitNegative extends Model
{
    protected $fillable = [
        'appointment_id',
        'client_id',
        'user_id',
        'visit_date',
        'motif_refus',
        'motif_autre',
        'notes',
    ];

    protected $casts = [
        'visit_date' => 'date',
    ];

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(VisitAppointment::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
