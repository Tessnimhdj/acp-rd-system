export const VISIT_TYPES = [
    'Prospection',
    'Suivi',
    'Présentation',
    'Essai',
    'Bilan',
    'Autre',
];

export const APPLICATION_TYPES = [
    'Fromage Fondu',
    'Préparation Fromagère',
    'Sauce',
    'Analogue',
    'Autre',
];

export const TARGET_MARKETS = ['Local', 'Export', 'GMS', 'RHF', 'B2B', 'Mixte'];

export const STABILIZER_FUNCTIONS = [
    'Émulsification',
    'Épaississement',
    'Tenue tranche',
    'Anti-synérèse',
    'Filant',
];

export const DESIRED_TEXTURES = [
    'Ferme',
    'Souple',
    'Crémeuse',
    'Filante',
    'Nappante',
    'Gélifiée',
];

export const RESPONSIBLES = ['TC', 'RD', 'Client'];

export const EMPTY_ACTIONS = [
    { action: '', responsible: '', due_date: '' },
    { action: '', responsible: '', due_date: '' },
    { action: '', responsible: '', due_date: '' },
];

export const EMPTY_NEW_CLIENT = {
    company_name: '',
    sector: '',
    address: '',
};

export function emptyVisitForm() {
    return {
        client_id: '',
        new_client: { ...EMPTY_NEW_CLIENT },
        create_new_client: false,
        rd_code: '',
        contact_name: '',
        contact_role: '',
        contact_phone_email: '',
        visit_date: '',
        start_time: '',
        end_time: '',
        location: '',
        participants: '',
        visit_types: [],
        visit_objective: '',
        application_types: [],
        finished_product: '',
        annual_volume: '',
        target_mg: '',
        target_ph: '',
        target_ms: '',
        target_markets: [],
        problems: '',
        stabilizer_functions: [],
        desired_textures: [],
        process_constraints: '',
        max_dosage: '',
        regulatory_constraints: '',
        current_supplier: '',
        current_dosage: '',
        satisfaction: '',
        change_reason: '',
        budget_dzd_kg: '',
        budget_dzd_t_pf: '',
        decision_deadline: '',
        actions: EMPTY_ACTIONS.map((a) => ({ ...a })),
    };
}

export function visitToFormData(visit) {
    const actions = EMPTY_ACTIONS.map((empty, index) => {
        const existing = visit.actions?.[index];
        if (!existing) return { ...empty };
        return {
            action: existing.action ?? '',
            responsible: existing.responsible ?? '',
            due_date: existing.due_date?.substring?.(0, 10) ?? existing.due_date ?? '',
        };
    });

    return {
        client_id: visit.client_id ?? visit.client?.id ?? '',
        new_client: { ...EMPTY_NEW_CLIENT },
        create_new_client: false,
        rd_code: visit.rd_code ?? '',
        contact_name: visit.contact_name ?? '',
        contact_role: visit.contact_role ?? '',
        contact_phone_email: visit.contact_phone_email ?? '',
        visit_date: visit.visit_date?.substring?.(0, 10) ?? visit.visit_date ?? '',
        start_time: formatTime(visit.start_time),
        end_time: formatTime(visit.end_time),
        location: visit.location ?? '',
        participants: visit.participants ?? '',
        visit_types: visit.visit_types ?? [],
        visit_objective: visit.visit_objective ?? '',
        application_types: visit.application_types ?? [],
        finished_product: visit.finished_product ?? '',
        annual_volume: visit.annual_volume ?? '',
        target_mg: visit.target_mg ?? '',
        target_ph: visit.target_ph ?? '',
        target_ms: visit.target_ms ?? '',
        target_markets: visit.target_markets ?? [],
        problems: visit.problems ?? '',
        stabilizer_functions: visit.stabilizer_functions ?? [],
        desired_textures: visit.desired_textures ?? [],
        process_constraints: visit.process_constraints ?? '',
        max_dosage: visit.max_dosage ?? '',
        regulatory_constraints: visit.regulatory_constraints ?? '',
        current_supplier: visit.current_supplier ?? '',
        current_dosage: visit.current_dosage ?? '',
        satisfaction: visit.satisfaction ?? '',
        change_reason: visit.change_reason ?? '',
        budget_dzd_kg: visit.budget_dzd_kg ?? '',
        budget_dzd_t_pf: visit.budget_dzd_t_pf ?? '',
        decision_deadline: visit.decision_deadline?.substring?.(0, 10) ?? visit.decision_deadline ?? '',
        actions,
    };
}

function formatTime(time) {
    if (!time) return '';
    return String(time).substring(0, 5);
}

export function getSelectedClient(clients, clientId) {
    if (!clientId || clientId === 'new') return null;
    return clients.find((c) => String(c.id) === String(clientId)) ?? null;
}

export const ROLE_LABELS = {
    admin: 'Administrateur',
    commercial: 'Commercial (TC)',
    rd: 'R&D',
    production: 'Production',
};
