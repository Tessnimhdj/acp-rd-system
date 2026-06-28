<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VisitAction extends Model
{
    protected $fillable = [
        'visit_id',
        'sort_order',
        'action',
        'responsible',
        'due_date',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }
}
