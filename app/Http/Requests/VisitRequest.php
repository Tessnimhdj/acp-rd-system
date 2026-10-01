<?php



namespace App\Http\Requests;



use Illuminate\Foundation\Http\FormRequest;

use Illuminate\Validation\Rule;



abstract class VisitRequest extends FormRequest

{

    public function authorize(): bool

    {

        if ($this->isMethod('POST')) {

            return $this->user()->can('create', \App\Models\Visit::class);

        }



        $visit = $this->route('visit');



        return $visit

            ? $this->user()->can('update', $visit)

            : true;

    }



    protected function visitRules(): array

    {

        return [

            'client_id' => [

                Rule::requiredIf(fn () => ! $this->filled('new_client.company_name')),

                'nullable',

                'integer',

                'exists:clients,id',

            ],

            'new_client' => ['nullable', 'array'],

            'new_client.company_name' => [

                Rule::requiredIf(fn () => ! $this->filled('client_id')),

                'nullable',

                'string',

                'max:255',

            ],

            'new_client.sector' => ['nullable', 'string', 'max:255'],

            'new_client.address' => ['nullable', 'string'],

            'rd_code' => ['nullable', 'string', 'max:50'],

            'contact_name' => ['required', 'string', 'max:255'],

            'contact_role' => ['nullable', 'string', 'max:255'],

            'contact_phone_email' => ['nullable', 'string', 'max:255'],

            'visit_date' => ['required', 'date'],

            'start_time' => ['nullable', 'date_format:H:i'],

            'end_time' => ['nullable', 'date_format:H:i'],

            'location' => ['nullable', 'string', 'max:255'],

            'participants' => ['nullable', 'string'],

            'visit_types' => ['nullable', 'array'],

            'visit_types.*' => ['string', 'max:50'],

            'visit_objective' => ['required', 'string'],

            'application_types' => ['required', 'array', 'min:1'],

            'application_types.*' => ['string', 'max:50'],

            'finished_product' => ['required', 'string', 'max:255'],

            'annual_volume' => ['nullable', 'numeric', 'min:0'],

            'target_mg' => ['nullable', 'numeric', 'min:0', 'max:100'],

            'target_ph' => ['nullable', 'numeric', 'min:0', 'max:14'],

            'target_ms' => ['nullable', 'numeric', 'min:0', 'max:100'],

            'target_markets' => ['nullable', 'array'],

            'target_markets.*' => ['string', 'max:50'],

            'problems' => ['required', 'string'],

            'stabilizer_functions' => ['required', 'array', 'min:1'],

            'stabilizer_functions.*' => ['string', 'max:50'],

            'desired_textures' => ['required', 'array', 'min:1'],

            'desired_textures.*' => ['string', 'max:50'],

            'process_constraints' => ['nullable', 'string'],

            'max_dosage' => ['nullable', 'numeric', 'min:0', 'max:100'],

            'regulatory_constraints' => ['nullable', 'string'],

            'current_supplier' => ['nullable', 'string', 'max:255'],

            'current_dosage' => ['nullable', 'numeric', 'min:0', 'max:100'],

            'satisfaction' => ['nullable', 'integer', 'min:1', 'max:5'],

            'change_reason' => ['nullable', 'string'],

            'budget_dzd_kg' => ['nullable', 'numeric', 'min:0'],

            'budget_dzd_t_pf' => ['nullable', 'numeric', 'min:0'],

            'decision_deadline' => ['nullable', 'date'],

            'actions' => ['nullable', 'array', 'max:3'],

            'actions.*.action' => ['nullable', 'string'],

            'actions.*.responsible' => ['nullable', 'string', 'in:TC,RD,Client'],

            'actions.*.due_date' => ['nullable', 'date'],

        ];

    }

}


