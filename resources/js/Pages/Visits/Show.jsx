import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { VISIT_STATUS_LABELS, VISIT_STATUS_COLORS } from '@/constants/visitOptions';

const NAVY = '#13293D';
const GREEN = '#1FBE7A';

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR');
}

function formatTime(time) {
    if (!time) return '—';
    return String(time).substring(0, 5);
}

function BadgeList({ items }) {
    if (!items?.length) return <span className="text-muted">—</span>;
    return (
        <div className="d-flex flex-wrap gap-1">
            {items.map((item) => (
                <span key={item} className="badge bg-light text-dark border">
                    {item}
                </span>
            ))}
        </div>
    );
}

function Section({ letter, title, children }) {
    return (
        <div className="card border-0 shadow-sm mb-4">
            <div
                className="card-header border-0 py-3"
                style={{ backgroundColor: NAVY, color: '#fff' }}
            >
                <span className="badge me-2" style={{ backgroundColor: GREEN, color: NAVY }}>
                    {letter}
                </span>
                {title}
            </div>
            <div className="card-body">{children}</div>
        </div>
    );
}

function Row({ label, value, required }) {
    return (
        <div className="row mb-2">
            <div className="col-md-4 text-muted small">
                {label}
                {required && <span className="text-danger ms-1">*</span>}
            </div>
            <div className="col-md-8">{value || <span className="text-muted">—</span>}</div>
        </div>
    );
}

export default function Show({ auth, visit, canEdit, canDelete, canEditRd }) {
    const { flash } = usePage().props;
    const { data, setData, put, processing } = useForm({
        rd_code: visit.rd_code || '',
        status: visit.status || 'submitted',
    });

    const destroy = () => {
        if (confirm('Supprimer cette visite ?')) {
            router.delete(route('visits.destroy', visit.id));
        }
    };

    const submitRdUpdate = (e) => {
        e.preventDefault();
        put(route('visits.update', visit.id), {
            only: ['visit'],
        });
    };

    const isRd = auth.user.roles.includes('rd');

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Visite ${visit.visit_number} — ${visit.client?.company_name ?? ''}`} />

            {flash?.success && (
                <div className="alert alert-success py-2">{flash.success}</div>
            )}

            <div className="d-flex justify-content-between align-items-start mb-4 flex-wrap gap-2">
                <div>
                    <h4 style={{ color: NAVY, fontWeight: 600 }}>
                        Visite N° {String(visit.visit_number).padStart(3, '0')}
                    </h4>
                    <p className="text-muted small mb-0">
                        {visit.client?.company_name ?? '—'} — {formatDate(visit.visit_date)}
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <Link href={route('visits.index')} className="btn btn-sm btn-outline-secondary">
                        Liste
                    </Link>
                    {canEdit && !isRd && (
                        <Link
                            href={route('visits.edit', visit.id)}
                            className="btn btn-sm text-white"
                            style={{ backgroundColor: NAVY }}
                        >
                            Modifier
                        </Link>
                    )}
                    {canDelete && (
                        <button type="button" onClick={destroy} className="btn btn-sm btn-outline-danger">
                            Supprimer
                        </button>
                    )}
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <p className="small text-muted mb-1">REF-CLI</p>
                            <p className="mb-0 fw-semibold">{visit.client?.ref_cli || '—'}</p>
                        </div>
                        <div className="col-md-3">
                            <p className="small text-muted mb-1">Code R&D</p>
                            <p className="mb-0 fw-semibold">{visit.rd_code || '—'}</p>
                        </div>
                        <div className="col-md-3">
                            <p className="small text-muted mb-1">Statut</p>
                            <p className="mb-0">
                                <span
                                    className="badge"
                                    style={{
                                        backgroundColor: VISIT_STATUS_COLORS[visit.status] || '#6c757d',
                                        color: '#fff',
                                    }}
                                >
                                    {VISIT_STATUS_LABELS[visit.status] || visit.status}
                                </span>
                            </p>
                        </div>
                        <div className="col-md-3">
                            <p className="small text-muted mb-1">Technico-Commercial</p>
                            <p className="mb-0">{visit.user?.name ?? '—'}</p>
                        </div>
                    </div>
                    <p className="small text-muted mb-0 mt-3">
                        Document confidentiel — Usage interne technico-commercial uniquement
                    </p>
                </div>
            </div>

            {canEditRd && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                        <h6 className="mb-3" style={{ color: NAVY }}>Modification R&D</h6>
                        <form onSubmit={submitRdUpdate}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label small">Code R&D</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={data.rd_code}
                                        onChange={(e) => setData('rd_code', e.target.value)}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label small">Statut</label>
                                    <select
                                        className="form-select"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <option value="in_rd">En cours R&D</option>
                                        <option value="approved">Approuvé</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-3">
                                <button
                                    type="submit"
                                    className="btn btn-sm text-white"
                                    style={{ backgroundColor: GREEN }}
                                    disabled={processing}
                                >
                                    {processing ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Section letter="A" title="IDENTIFICATION CLIENT">
                <Row label="Entreprise / Raison sociale" value={visit.client?.company_name} required />
                <Row label="Secteur d'activité" value={visit.client?.sector} />
                <Row label="Nom de l'interlocuteur" value={visit.contact_name} required />
                <Row label="Fonction / Poste" value={visit.contact_role} />
                <Row label="Téléphone / Email" value={visit.contact_phone_email} />
                <Row label="Adresse / Ville / Pays" value={visit.client?.address} required />
            </Section>

            <Section letter="B" title="INFORMATIONS VISITE">
                <Row label="Date" value={formatDate(visit.visit_date)} required />
                <Row
                    label="Heure"
                    value={
                        visit.start_time || visit.end_time
                            ? `${formatTime(visit.start_time)} → ${formatTime(visit.end_time)}`
                            : null
                    }
                />
                <Row label="Lieu / Site" value={visit.location} />
                <Row label="Participants" value={visit.participants} />
                <Row label="Type de visite" value={<BadgeList items={visit.visit_types} />} />
                <Row label="Objectif de la visite" value={visit.visit_objective} required />
            </Section>

            <Section letter="C" title="APPLICATION PRODUIT">
                <Row label="Type d'application" value={<BadgeList items={visit.application_types} />} required />
                <Row label="Produit fini" value={visit.finished_product} required />
                <Row label="Volume annuel (t/an)" value={visit.annual_volume} />
                <Row label="MG cible (%)" value={visit.target_mg} />
                <Row label="pH cible" value={visit.target_ph} />
                <Row label="MS cible (%)" value={visit.target_ms} />
                <Row label="Marché cible" value={<BadgeList items={visit.target_markets} />} />
            </Section>

            <Section letter="D" title="BESOINS TECHNIQUES & FONCTIONNALITÉS">
                <Row label="Problème(s) rencontré(s)" value={visit.problems} required />
                <Row label="Fonction stabilisant" value={<BadgeList items={visit.stabilizer_functions} />} required />
                <Row label="Texture souhaitée" value={<BadgeList items={visit.desired_textures} />} required />
                <Row label="Contraintes process" value={visit.process_constraints} />
                <Row label="Dosage max. (%)" value={visit.max_dosage} />
                <Row label="Contraintes réglementaires" value={visit.regulatory_constraints} />
            </Section>

            <Section letter="E" title="SITUATION CONCURRENTIELLE">
                <Row label="Fournisseur / Stabilisant actuel" value={visit.current_supplier} />
                <Row label="Dosage actuel (%)" value={visit.current_dosage} />
                <Row label="Satisfaction (1→5)" value={visit.satisfaction} />
                <Row label="Raison de changement envisagé" value={visit.change_reason} />
                <Row label="Budget stabilisant (DA/kg)" value={visit.budget_dzd_kg} />
                <Row label="Budget (DA/t PF)" value={visit.budget_dzd_t_pf} />
                <Row label="Délai de décision" value={formatDate(visit.decision_deadline)} />
            </Section>

            <Section letter="F" title="SUITE À DONNER & ACTIONS">
                {visit.actions?.length ? (
                    <div className="table-responsive">
                        <table className="table table-sm mb-0">
                            <thead>
                                <tr style={{ backgroundColor: '#f4f6f8' }}>
                                    <th>#</th>
                                    <th>Action à réaliser</th>
                                    <th>Responsable</th>
                                    <th>Échéance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visit.actions.map((action) => (
                                    <tr key={action.id}>
                                        <td>{action.sort_order}</td>
                                        <td>{action.action || '—'}</td>
                                        <td>{action.responsible || '—'}</td>
                                        <td>{formatDate(action.due_date)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-muted mb-0">Aucune action planifiée.</p>
                )}
            </Section>
        </AuthenticatedLayout>
    );
}
