/**
 * Visits/NegativeForm.jsx
 * Enregistrement d'une visite négative (refus client).
 */

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const NAVY = '#13293D';
const RED = '#dc3545';

const MOTIFS = [
    { value: 'price', label: 'Prix trop élevé' },
    { value: 'competitor', label: 'A déjà un concurrent' },
    { value: 'no_need', label: 'Pas de besoin actuel' },
    { value: 'other', label: 'Autre' },
];

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function clientName(client) {
    if (!client) return '—';
    return client.company_name || client.company_name || '—';
}

export default function NegativeForm({
    auth,
    appointment_id,
    client_id,
    visit_date,
    client,
}) {
    const { data, setData, post, processing, errors } = useForm({
        appointment_id: appointment_id ?? '',
        client_id: client_id ?? client?.id ?? '',
        visit_date: visit_date ?? '',
        motif_refus: '',
        motif_autre: '',
        notes: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('visit-negatives.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Visite Négative" />

            <div className="mb-4">
                <h4 className="fw-bold mb-1" style={{ color: NAVY }}>
                    Visite Négative
                </h4>
                <p className="text-muted mb-0">
                    {clientName(client)}
                    {visit_date ? ` · ${formatDate(visit_date)}` : ''}
                </p>
            </div>

            <div
                className="card border-0 shadow-sm"
                style={{ borderLeft: `4px solid ${RED}`, maxWidth: 640 }}
            >
                <div className="card-body p-4">
                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <label className="form-label fw-semibold" style={{ color: NAVY }}>
                                Motif de refus <span className="text-danger">*</span>
                            </label>
                            {MOTIFS.map((motif) => (
                                <div className="form-check mb-2" key={motif.value}>
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="motif_refus"
                                        id={`motif-${motif.value}`}
                                        value={motif.value}
                                        checked={data.motif_refus === motif.value}
                                        onChange={(e) => setData('motif_refus', e.target.value)}
                                        required
                                    />
                                    <label className="form-check-label" htmlFor={`motif-${motif.value}`}>
                                        {motif.label}
                                    </label>
                                </div>
                            ))}
                            {errors.motif_refus && (
                                <div className="text-danger small mt-1">{errors.motif_refus}</div>
                            )}
                        </div>

                        {data.motif_refus === 'other' && (
                            <div className="mb-4">
                                <label className="form-label fw-semibold" style={{ color: NAVY }} htmlFor="motif_autre">
                                    Précision <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="motif_autre"
                                    type="text"
                                    className={`form-control ${errors.motif_autre ? 'is-invalid' : ''}`}
                                    placeholder="Précisez le motif..."
                                    value={data.motif_autre}
                                    onChange={(e) => setData('motif_autre', e.target.value)}
                                    required
                                />
                                {errors.motif_autre && (
                                    <div className="invalid-feedback">{errors.motif_autre}</div>
                                )}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="form-label fw-semibold" style={{ color: NAVY }} htmlFor="notes">
                                Notes <span className="text-muted fw-normal">(optionnel)</span>
                            </label>
                            <textarea
                                id="notes"
                                className={`form-control ${errors.notes ? 'is-invalid' : ''}`}
                                rows="4"
                                maxLength={1000}
                                placeholder="Observations, remarques..."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                            />
                            <div className="form-text text-end">{data.notes.length}/1000</div>
                            {errors.notes && (
                                <div className="invalid-feedback d-block">{errors.notes}</div>
                            )}
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <Link href={route('planning.index')} className="btn btn-outline-secondary">
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                className="btn text-white"
                                style={{ backgroundColor: RED }}
                                disabled={processing}
                            >
                                {processing ? 'Enregistrement…' : 'Enregistrer la visite'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
