import InputError from '@/Components/InputError';

import {

    APPLICATION_TYPES,

    DESIRED_TEXTURES,

    EMPTY_NEW_CLIENT,

    getSelectedClient,

    RESPONSIBLES,

    STABILIZER_FUNCTIONS,

    TARGET_MARKETS,

    VISIT_TYPES,

} from '@/constants/visitOptions';



const NAVY = '#13293D';

const GREEN = '#1FBE7A';



function SectionCard({ letter, title, children }) {

    return (

        <div className="card border-0 shadow-sm mb-4">

            <div

                className="card-header border-0 py-3"

                style={{ backgroundColor: NAVY, color: '#fff' }}

            >

                <span

                    className="badge me-2"

                    style={{ backgroundColor: GREEN, color: NAVY }}

                >

                    {letter}

                </span>

                {title}

            </div>

            <div className="card-body">{children}</div>

        </div>

    );

}



function Field({ label, required, error, children }) {

    return (

        <div className="mb-3">

            <label className="form-label small fw-semibold">

                {label}

                {required && <span className="text-danger ms-1">*</span>}

            </label>

            {children}

            {error && <InputError message={error} className="mt-1" />}

        </div>

    );

}



function CheckboxGroup({ options, selected, onChange, error }) {

    const toggle = (option) => {

        if (selected.includes(option)) {

            onChange(selected.filter((item) => item !== option));

        } else {

            onChange([...selected, option]);

        }

    };



    return (

        <>

            <div className="d-flex flex-wrap gap-3">

                {options.map((option) => (

                    <div className="form-check" key={option}>

                        <input

                            className="form-check-input"

                            type="checkbox"

                            id={`cb-${option}`}

                            checked={selected.includes(option)}

                            onChange={() => toggle(option)}

                        />

                        <label className="form-check-label small" htmlFor={`cb-${option}`}>

                            {option}

                        </label>

                    </div>

                ))}

            </div>

            {error && <InputError message={error} className="mt-1" />}

        </>

    );

}



export default function VisitForm({ data, setData, errors, visitNumber, clients = [] }) {

    const set = (field, value) => setData(field, value);



    const setAction = (index, field, value) => {

        const actions = [...data.actions];

        actions[index] = { ...actions[index], [field]: value };

        setData('actions', actions);

    };



    const setNewClient = (field, value) => {

        setData('new_client', { ...data.new_client, [field]: value });

    };



    const handleClientChange = (value) => {

        if (value === 'new') {

            setData({

                ...data,

                client_id: '',

                create_new_client: true,

                new_client: { ...EMPTY_NEW_CLIENT },

            });

        } else {

            setData({

                ...data,

                client_id: value,

                create_new_client: false,

                new_client: { ...EMPTY_NEW_CLIENT },

            });

        }

    };



    const selectedClient = getSelectedClient(clients, data.client_id);

    const showNewClientForm = data.create_new_client;



    return (

        <div>

            <div className="card border-0 shadow-sm mb-4">

                <div className="card-body">

                    <div className="row g-3 align-items-end">

                        <div className="col-md-3">

                            <Field label="REF-CLI" error={errors.client_id}>

                                <input

                                    type="text"

                                    className="form-control"

                                    value={selectedClient?.ref_cli ?? '—'}

                                    readOnly

                                    disabled

                                    placeholder="Sélectionnez un client"

                                />

                            </Field>

                        </div>

                        <div className="col-md-3">

                            <Field label="Code R&D" error={errors.rd_code}>

                                <input

                                    type="text"

                                    className="form-control"

                                    value={data.rd_code}

                                    onChange={(e) => set('rd_code', e.target.value)}

                                    placeholder="RD-..."

                                />

                            </Field>

                        </div>

                        {visitNumber && (

                            <div className="col-md-3">

                                <p className="small text-muted mb-1">N° visite</p>

                                <p className="fw-bold mb-0" style={{ color: NAVY }}>

                                    {String(visitNumber).padStart(3, '0')}

                                </p>

                            </div>

                        )}

                    </div>

                    <p className="small text-muted mb-0 mt-2">

                        Document confidentiel — Usage interne technico-commercial uniquement

                    </p>

                </div>

            </div>



            <SectionCard letter="A" title="IDENTIFICATION CLIENT">

                <div className="row g-3">

                    <div className="col-12">

                        <Field label="Client / Fromagerie" required error={errors.client_id || errors['new_client.company_name']}>

                            <select

                                className={`form-select ${errors.client_id ? 'is-invalid' : ''}`}

                                value={showNewClientForm ? 'new' : data.client_id || ''}

                                onChange={(e) => handleClientChange(e.target.value)}

                            >

                                <option value="">— Choisir un client —</option>

                                {clients.map((client) => (

                                    <option key={client.id} value={client.id}>

                                        {client.ref_cli} — {client.company_name}

                                    </option>

                                ))}

                                <option value="new">➕ Nouveau client (fromagerie)</option>

                            </select>

                        </Field>

                    </div>



                    {showNewClientForm ? (

                        <>

                            <div className="col-md-6">

                                <Field label="Entreprise / Raison sociale" required error={errors['new_client.company_name']}>

                                    <input

                                        type="text"

                                        className={`form-control ${errors['new_client.company_name'] ? 'is-invalid' : ''}`}

                                        value={data.new_client.company_name}

                                        onChange={(e) => setNewClient('company_name', e.target.value)}

                                    />

                                </Field>

                            </div>

                            <div className="col-md-6">

                                <Field label="Secteur d'activité" error={errors['new_client.sector']}>

                                    <input

                                        type="text"

                                        className="form-control"

                                        value={data.new_client.sector}

                                        onChange={(e) => setNewClient('sector', e.target.value)}

                                    />

                                </Field>

                            </div>

                            <div className="col-12">

                                <Field label="Adresse / Ville / Pays" error={errors['new_client.address']}>

                                    <input

                                        type="text"

                                        className="form-control"

                                        value={data.new_client.address}

                                        onChange={(e) => setNewClient('address', e.target.value)}

                                    />

                                </Field>

                            </div>

                        </>

                    ) : selectedClient ? (

                        <div className="col-12">

                            <div className="p-3 rounded" style={{ backgroundColor: '#f4f6f8' }}>

                                <div className="row g-2 small">

                                    <div className="col-md-4">

                                        <span className="text-muted">Entreprise :</span>{' '}

                                        <strong>{selectedClient.company_name}</strong>

                                    </div>

                                    <div className="col-md-4">

                                        <span className="text-muted">Secteur :</span>{' '}

                                        {selectedClient.sector || '—'}

                                    </div>

                                    <div className="col-md-4">

                                        <span className="text-muted">Adresse :</span>{' '}

                                        {selectedClient.address || '—'}

                                    </div>

                                </div>

                            </div>

                        </div>

                    ) : null}



                    <div className="col-12">

                        <hr className="my-1" />

                        <p className="small text-muted mb-0">Interlocuteur pour cette visite</p>

                    </div>



                    <div className="col-md-6">

                        <Field label="Nom de l'interlocuteur" required error={errors.contact_name}>

                            <input

                                type="text"

                                className={`form-control ${errors.contact_name ? 'is-invalid' : ''}`}

                                value={data.contact_name}

                                onChange={(e) => set('contact_name', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-6">

                        <Field label="Fonction / Poste" error={errors.contact_role}>

                            <input

                                type="text"

                                className="form-control"

                                value={data.contact_role}

                                onChange={(e) => set('contact_role', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-6">

                        <Field label="Téléphone / Email" error={errors.contact_phone_email}>

                            <input

                                type="text"

                                className="form-control"

                                value={data.contact_phone_email}

                                onChange={(e) => set('contact_phone_email', e.target.value)}

                            />

                        </Field>

                    </div>

                </div>

            </SectionCard>



            <SectionCard letter="B" title="INFORMATIONS VISITE">

                <div className="row g-3">

                    <div className="col-md-4">

                        <Field label="Date" required error={errors.visit_date}>

                            <input

                                type="date"

                                className={`form-control ${errors.visit_date ? 'is-invalid' : ''}`}

                                value={data.visit_date}

                                onChange={(e) => set('visit_date', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-4">

                        <Field label="Heure début" error={errors.start_time}>

                            <input

                                type="time"

                                className="form-control"

                                value={data.start_time}

                                onChange={(e) => set('start_time', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-4">

                        <Field label="Heure fin" error={errors.end_time}>

                            <input

                                type="time"

                                className="form-control"

                                value={data.end_time}

                                onChange={(e) => set('end_time', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-6">

                        <Field label="Lieu / Site" error={errors.location}>

                            <input

                                type="text"

                                className="form-control"

                                value={data.location}

                                onChange={(e) => set('location', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-6">

                        <Field label="Participants" error={errors.participants}>

                            <input

                                type="text"

                                className="form-control"

                                value={data.participants}

                                onChange={(e) => set('participants', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-12">

                        <Field label="Type de visite" error={errors.visit_types}>

                            <CheckboxGroup

                                options={VISIT_TYPES}

                                selected={data.visit_types}

                                onChange={(value) => set('visit_types', value)}

                            />

                        </Field>

                    </div>

                    <div className="col-12">

                        <Field label="Objectif de la visite" required error={errors.visit_objective}>

                            <textarea

                                className={`form-control ${errors.visit_objective ? 'is-invalid' : ''}`}

                                rows={3}

                                value={data.visit_objective}

                                onChange={(e) => set('visit_objective', e.target.value)}

                            />

                        </Field>

                    </div>

                </div>

            </SectionCard>



            <SectionCard letter="C" title="APPLICATION PRODUIT">

                <div className="row g-3">

                    <div className="col-12">

                        <Field label="Type d'application" required error={errors.application_types}>

                            <CheckboxGroup

                                options={APPLICATION_TYPES}

                                selected={data.application_types}

                                onChange={(value) => set('application_types', value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-6">

                        <Field label="Produit fini" required error={errors.finished_product}>

                            <input

                                type="text"

                                className={`form-control ${errors.finished_product ? 'is-invalid' : ''}`}

                                value={data.finished_product}

                                onChange={(e) => set('finished_product', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-6">

                        <Field label="Volume annuel (t/an)" error={errors.annual_volume}>

                            <input

                                type="number"

                                step="0.01"

                                min="0"

                                className="form-control"

                                value={data.annual_volume}

                                onChange={(e) => set('annual_volume', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-4">

                        <Field label="MG cible (%)" error={errors.target_mg}>

                            <input

                                type="number"

                                step="0.01"

                                min="0"

                                max="100"

                                className="form-control"

                                value={data.target_mg}

                                onChange={(e) => set('target_mg', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-4">

                        <Field label="pH cible" error={errors.target_ph}>

                            <input

                                type="number"

                                step="0.01"

                                min="0"

                                max="14"

                                className="form-control"

                                value={data.target_ph}

                                onChange={(e) => set('target_ph', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-4">

                        <Field label="MS cible (%)" error={errors.target_ms}>

                            <input

                                type="number"

                                step="0.01"

                                min="0"

                                max="100"

                                className="form-control"

                                value={data.target_ms}

                                onChange={(e) => set('target_ms', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-12">

                        <Field label="Marché cible" error={errors.target_markets}>

                            <CheckboxGroup

                                options={TARGET_MARKETS}

                                selected={data.target_markets}

                                onChange={(value) => set('target_markets', value)}

                            />

                        </Field>

                    </div>

                </div>

            </SectionCard>



            <SectionCard letter="D" title="BESOINS TECHNIQUES & FONCTIONNALITÉS">

                <div className="row g-3">

                    <div className="col-12">

                        <Field label="Problème(s) rencontré(s)" required error={errors.problems}>

                            <textarea

                                className={`form-control ${errors.problems ? 'is-invalid' : ''}`}

                                rows={3}

                                value={data.problems}

                                onChange={(e) => set('problems', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-12">

                        <Field label="Fonction stabilisant" required error={errors.stabilizer_functions}>

                            <CheckboxGroup

                                options={STABILIZER_FUNCTIONS}

                                selected={data.stabilizer_functions}

                                onChange={(value) => set('stabilizer_functions', value)}

                            />

                        </Field>

                    </div>

                    <div className="col-12">

                        <Field label="Texture souhaitée" required error={errors.desired_textures}>

                            <CheckboxGroup

                                options={DESIRED_TEXTURES}

                                selected={data.desired_textures}

                                onChange={(value) => set('desired_textures', value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-6">

                        <Field label="Contraintes process" error={errors.process_constraints}>

                            <textarea

                                className="form-control"

                                rows={2}

                                value={data.process_constraints}

                                onChange={(e) => set('process_constraints', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-3">

                        <Field label="Dosage max. (%)" error={errors.max_dosage}>

                            <input

                                type="number"

                                step="0.01"

                                min="0"

                                max="100"

                                className="form-control"

                                value={data.max_dosage}

                                onChange={(e) => set('max_dosage', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-3">

                        <Field label="Contraintes réglementaires" error={errors.regulatory_constraints}>

                            <textarea

                                className="form-control"

                                rows={2}

                                value={data.regulatory_constraints}

                                onChange={(e) => set('regulatory_constraints', e.target.value)}

                            />

                        </Field>

                    </div>

                </div>

            </SectionCard>



            <SectionCard letter="E" title="SITUATION CONCURRENTIELLE">

                <div className="row g-3">

                    <div className="col-md-6">

                        <Field label="Fournisseur / Stabilisant actuel" error={errors.current_supplier}>

                            <input

                                type="text"

                                className="form-control"

                                value={data.current_supplier}

                                onChange={(e) => set('current_supplier', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-3">

                        <Field label="Dosage actuel (%)" error={errors.current_dosage}>

                            <input

                                type="number"

                                step="0.01"

                                min="0"

                                max="100"

                                className="form-control"

                                value={data.current_dosage}

                                onChange={(e) => set('current_dosage', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-3">

                        <Field label="Satisfaction (1→5)" error={errors.satisfaction}>

                            <select

                                className="form-select"

                                value={data.satisfaction}

                                onChange={(e) => set('satisfaction', e.target.value)}

                            >

                                <option value="">—</option>

                                {[1, 2, 3, 4, 5].map((n) => (

                                    <option key={n} value={n}>

                                        {n}

                                    </option>

                                ))}

                            </select>

                        </Field>

                    </div>

                    <div className="col-12">

                        <Field label="Raison de changement envisagé" error={errors.change_reason}>

                            <textarea

                                className="form-control"

                                rows={2}

                                value={data.change_reason}

                                onChange={(e) => set('change_reason', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-4">

                        <Field label="Budget stabilisant (DA/kg)" error={errors.budget_dzd_kg}>

                            <input

                                type="number"

                                step="0.01"

                                min="0"

                                className="form-control"

                                value={data.budget_dzd_kg}

                                onChange={(e) => set('budget_dzd_kg', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-4">

                        <Field label="Budget (DA/t PF)" error={errors.budget_dzd_t_pf}>

                            <input

                                type="number"

                                step="0.01"

                                min="0"

                                className="form-control"

                                value={data.budget_dzd_t_pf}

                                onChange={(e) => set('budget_dzd_t_pf', e.target.value)}

                            />

                        </Field>

                    </div>

                    <div className="col-md-4">

                        <Field label="Délai de décision" error={errors.decision_deadline}>

                            <input

                                type="date"

                                className="form-control"

                                value={data.decision_deadline}

                                onChange={(e) => set('decision_deadline', e.target.value)}

                            />

                        </Field>

                    </div>

                </div>

            </SectionCard>



            <SectionCard letter="F" title="SUITE À DONNER & ACTIONS">

                <div className="table-responsive">

                    <table className="table table-sm align-middle mb-0">

                        <thead>

                            <tr style={{ backgroundColor: '#f4f6f8' }}>

                                <th style={{ width: '40px' }}>#</th>

                                <th>Action à réaliser</th>

                                <th style={{ width: '140px' }}>Responsable</th>

                                <th style={{ width: '160px' }}>Échéance</th>

                            </tr>

                        </thead>

                        <tbody>

                            {data.actions.map((action, index) => (

                                <tr key={index}>

                                    <td className="text-muted">{index + 1}</td>

                                    <td>

                                        <input

                                            type="text"

                                            className="form-control form-control-sm"

                                            value={action.action}

                                            onChange={(e) => setAction(index, 'action', e.target.value)}

                                        />

                                    </td>

                                    <td>

                                        <select

                                            className="form-select form-select-sm"

                                            value={action.responsible}

                                            onChange={(e) => setAction(index, 'responsible', e.target.value)}

                                        >

                                            <option value="">—</option>

                                            {RESPONSIBLES.map((r) => (

                                                <option key={r} value={r}>

                                                    {r}

                                                </option>

                                            ))}

                                        </select>

                                    </td>

                                    <td>

                                        <input

                                            type="date"

                                            className="form-control form-control-sm"

                                            value={action.due_date}

                                            onChange={(e) => setAction(index, 'due_date', e.target.value)}

                                        />

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </SectionCard>

        </div>

    );

}


