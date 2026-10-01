/**
 * Planning/StartVisit.jsx
 * Le TC choisit le résultat de la visite : positive ou négative.
 */

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

const NAVY = '#0E2238';
const GREEN = '#00A86B';
const RED = '#dc3545';

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatTime(time) {
    if (!time) return '—';
    return String(time).substring(0, 5);
}

function clientName(client) {
    if (!client) return '—';
    return client.company_name || client.company_name || '—';
}

export default function StartVisit({ auth, appointment }) {
    const clientId = appointment?.client?.id;
    const date = appointment?.scheduled_date;
    const query = `appointment_id=${appointment?.id}&client_id=${clientId}&date=${date}`;

    const goPositive = () => {
        router.visit(`${route('visits.create')}?${query}`);
    };

    const goNegative = () => {
        router.visit(`${route('visit-negatives.create')}?${query}`);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Démarrer la visite" />

            <div className="mb-4">
                <h4 className="fw-bold mb-1" style={{ color: NAVY }}>
                    Démarrer la visite
                </h4>
                <p className="text-muted mb-0">Choisissez le résultat de cette visite.</p>
            </div>

            <div className="card border bg-white mb-4">
                <div className="card-body px-4 py-3">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <div className="small text-muted">Client</div>
                            <div className="fw-semibold" style={{ color: '#1A1D20' }}>
                                {clientName(appointment?.client)}
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="small text-muted">Date</div>
                            <div className="fw-semibold" style={{ color: '#1A1D20' }}>
                                {formatDate(appointment?.scheduled_date)}
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="small text-muted">Heure</div>
                            <div className="fw-semibold" style={{ color: '#1A1D20' }}>
                                {formatTime(appointment?.scheduled_time)}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="small text-muted">Objectif</div>
                            <div style={{ color: '#1A1D20' }}>
                                {appointment?.objective || '—'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {appointment?.status === 'pending' && (
                <div className="alert mb-4" style={{ backgroundColor: '#fff8e6', border: '1px solid #f59e0b', color: NAVY }}>
                    Ce rendez-vous est en attente de validation par le responsable commercial.
                    Vous ne pouvez pas encore démarrer la visite.
                </div>
            )}

            {appointment?.status === 'refused' && (
                <div className="alert mb-4" style={{ backgroundColor: '#fdecee', border: '1px solid #dc3545', color: NAVY }}>
                    <div>Ce rendez-vous a été refusé.</div>
                    {appointment.refusal_reason && (
                        <div className="mt-1">Motif : {appointment.refusal_reason}</div>
                    )}
                </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
                <Link
                    href={route('about.index')}
                    style={{
                        color: '#00A86B',
                        fontSize: 14,
                        textDecoration: 'none',
                    }}
                >
                    Consulter la présentation ACP Solution →
                </Link>
            </div>

            {appointment?.status === 'approved' && (
            <div className="row g-4">
                <div className="col-md-6">
                    <div
                        role="button"
                        className="card h-100 border bg-white"
                        onClick={goPositive}
                        style={{ cursor: 'pointer', borderColor: GREEN }}
                    >
                        <div className="card-body text-center py-5 px-4">
                            <h5 className="fw-bold mb-2" style={{ color: GREEN }}>
                                Visite aboutie
                            </h5>
                            <p className="text-muted mb-0">
                                Le client est intéressé — remplir la fiche de visite.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="col-md-6">
                    <div
                        role="button"
                        className="card h-100 border bg-white"
                        onClick={goNegative}
                        style={{ cursor: 'pointer', borderColor: RED }}
                    >
                        <div className="card-body text-center py-5 px-4">
                            <h5 className="fw-bold mb-2" style={{ color: RED }}>
                                Visite non aboutie
                            </h5>
                            <p className="text-muted mb-0">
                                Le client n'est pas intéressé — enregistrer le motif.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </AuthenticatedLayout>
    );
}
