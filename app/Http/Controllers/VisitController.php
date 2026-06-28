<?php



namespace App\Http\Controllers;



use App\Http\Requests\StoreVisitRequest;

use App\Http\Requests\UpdateVisitRequest;

use App\Models\Client;

use App\Models\Visit;

use Illuminate\Http\RedirectResponse;

use Illuminate\Support\Facades\DB;

use Inertia\Inertia;

use Inertia\Response;



class VisitController extends Controller

{

    public function __construct()

    {

        $this->authorizeResource(Visit::class, 'visit');

    }



    public function index(): Response

    {

        $query = Visit::with(['user:id,name', 'client:id,ref_cli,company_name,sector,address'])

            ->latest('visit_date')

            ->latest('id');



        if (auth()->user()->can('manage-visits') && ! auth()->user()->can('view-all-visits')) {

            $query->where('user_id', auth()->id());

        }



        $visits = $query->paginate(15);



        return Inertia::render('Visits/Index', [

            'visits' => $visits,

            'canCreate' => auth()->user()->can('create', Visit::class),

        ]);

    }



    public function create(): Response

    {

        return Inertia::render('Visits/Create', [

            'nextVisitNumber' => Visit::nextVisitNumber(),

            'clients' => Client::orderBy('company_name')->get(['id', 'ref_cli', 'company_name', 'sector', 'address']),

        ]);

    }



    public function store(StoreVisitRequest $request): RedirectResponse

    {

        $visit = DB::transaction(function () use ($request) {

            $clientId = $this->resolveClientId($request);



            $visit = Visit::create([

                ...$request->safe()->except(['actions', 'new_client']),

                'client_id' => $clientId,

                'user_id' => $request->user()->id,

                'visit_number' => Visit::nextVisitNumber(),

            ]);



            $this->syncActions($visit, $request->input('actions', []));



            return $visit;

        });



        return redirect()

            ->route('visits.show', $visit)

            ->with('success', 'Visite enregistrée avec succès.');

    }



    public function show(Visit $visit): Response

    {

        $visit->load(['user:id,name', 'client', 'actions']);



        return Inertia::render('Visits/Show', [

            'visit' => $visit,

            'canEdit' => auth()->user()->can('update', $visit),

            'canDelete' => auth()->user()->can('delete', $visit),

        ]);

    }



    public function edit(Visit $visit): Response

    {

        $visit->load(['actions', 'client']);



        return Inertia::render('Visits/Edit', [

            'visit' => $visit,

            'clients' => Client::orderBy('company_name')->get(['id', 'ref_cli', 'company_name', 'sector', 'address']),

        ]);

    }



    public function update(UpdateVisitRequest $request, Visit $visit): RedirectResponse

    {

        DB::transaction(function () use ($request, $visit) {

            $clientId = $this->resolveClientId($request);



            $visit->update([

                ...$request->safe()->except(['actions', 'new_client']),

                'client_id' => $clientId,

            ]);



            $visit->actions()->delete();

            $this->syncActions($visit, $request->input('actions', []));

        });



        return redirect()

            ->route('visits.show', $visit)

            ->with('success', 'Visite mise à jour avec succès.');

    }



    public function destroy(Visit $visit): RedirectResponse

    {

        $visit->delete();



        return redirect()

            ->route('visits.index')

            ->with('success', 'Visite supprimée.');

    }



    private function resolveClientId(StoreVisitRequest|UpdateVisitRequest $request): int

    {

        if ($request->filled('client_id')) {

            return (int) $request->input('client_id');

        }



        $newClient = $request->input('new_client', []);

        $client = Client::create([

            'company_name' => $newClient['company_name'],

            'sector' => $newClient['sector'] ?? null,

            'address' => $newClient['address'] ?? null,

        ]);



        return $client->id;

    }



    private function syncActions(Visit $visit, array $actions): void

    {

        foreach (array_values($actions) as $index => $action) {

            if (empty($action['action']) && empty($action['responsible']) && empty($action['due_date'])) {

                continue;

            }



            $visit->actions()->create([

                'sort_order' => $index + 1,

                'action' => $action['action'] ?? null,

                'responsible' => $action['responsible'] ?? null,

                'due_date' => $action['due_date'] ?? null,

            ]);

        }

    }

}


