<?php

namespace App\Http\Requests;

class StoreVisitRequest extends VisitRequest
{
    public function rules(): array
    {
        return $this->visitRules();
    }
}
