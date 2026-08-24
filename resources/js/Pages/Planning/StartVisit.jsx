/**
 * Planning/StartVisit.jsx
 * Le TC choisit le résultat de la visite : positive ou négative.
 */

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

const NAVY = '#13293D';
const GREEN = '#1FBE7A';
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

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body px-4 py-3">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <div className="small text-muted">Client</div>
                            <div className="fw-semibold" style={{ color: NAVY }}>
                                {clientName(appointment?.client)}
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="small text-muted">Date</div>
                            <div className="fw-semibold" style={{ color: NAVY }}>
                                {formatDate(appointment?.scheduled_date)}
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="small text-muted">Heure</div>
                            <div className="fw-semibold" style={{ color: NAVY }}>
                                {formatTime(appointment?.scheduled_time)}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="small text-muted">Objectif</div>
                            <div style={{ color: NAVY }}>
                                {appointment?.objective || '—'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-md-6">
                    <div
                        role="button"
                        className="card h-100 border-0 shadow-sm"
                        onClick={goPositive}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(31, 190, 122, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '';
                        }}
                        style={{
                            cursor: 'pointer',
                            border: `2px solid ${GREEN}`,
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                    >
                        <div className="card-body text-center py-5 px-4">
                            <div style={{ fontSize: 42, lineHeight: 1 }}>✅</div>
                            <h5 className="fw-bold mt-3 mb-2" style={{ color: GREEN }}>
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
                        className="card h-100 border-0 shadow-sm"
                        onClick={goNegative}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(220, 53, 69, 0.18)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '';
                        }}
                        style={{
                            cursor: 'pointer',
                            border: `2px solid ${RED}`,
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                    >
                        <div className="card-body text-center py-5 px-4">
                            <div style={{ fontSize: 42, lineHeight: 1 }}>❌</div>
                            <h5 className="fw-bold mt-3 mb-2" style={{ color: RED }}>
                                Visite non aboutie
                            </h5>
                            <p className="text-muted mb-0">
                                Le client n'est pas intéressé — enregistrer le motif.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
