<?php

namespace App\Http\Requests;

class UpdateVisitRequest extends VisitRequest
{
    public function rules(): array
    {
        return $this->visitRules();
    }
}
