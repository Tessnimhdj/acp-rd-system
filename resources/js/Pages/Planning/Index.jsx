import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const NAVY = '#13293D';
const GREEN = '#1FBE7A';

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(time) {
    if (!time) return '—';
    return String(time).substring(0, 5);
}

function getBadgeStyle(badge) {
    switch (badge) {
        case 'upcoming':
            return { backgroundColor: GREEN, color: '#fff' };
        case 'today':
            return { backgroundColor: '#fd7e14', color: '#fff' };
        case 'past':
            return { backgroundColor: '#6c757d', color: '#fff' };
        default:
            return { backgroundColor: '#6c757d', color: '#fff' };
    }
}

function getBadgeLabel(badge) {
    switch (badge) {
        case 'upcoming':
            return 'À venir';
        case 'today':
            return "Aujourd'hui";
        case 'past':
            return 'Passé';
        default:
            return '—';
    }
}

export default function Index({ auth, visits }) {
    const groupedVisits = visits.reduce((groups, visit) => {
        const date = visit.visit_date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(visit);
        return groups;
    }, {});

    const sortedDates = Object.keys(groupedVisits).sort();

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Planning des visites" />

            <div className="mb-4">
                <h4 style={{ color: NAVY, fontWeight: '600' }}>
                    Planning des visites
                </h4>
                <p className="text-muted small">
                    Vue d'ensemble des visites planifiées
                </p>
            </div>

            {sortedDates.length === 0 ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                        <p className="text-muted mb-0">Aucune visite planifiée.</p>
                    </div>
                </div>
            ) : (
                sortedDates.map((date) => (
                    <div key={date} className="card border-0 shadow-sm mb-3">
                        <div
                            className="card-header border-0 py-3"
                            style={{ backgroundColor: NAVY, color: '#fff' }}
                        >
                            <span className="badge me-2" style={{ backgroundColor: GREEN, color: NAVY }}>
                                📅
                            </span>
                            {formatDate(date)}
                        </div>
                        <div className="card-body">
                            {groupedVisits[date].map((visit) => (
                                <Link
                                    key={visit.id}
                                    href={route('visits.show', visit.id)}
                                    className="text-decoration-none"
                                >
                                    <div
                                        className="d-flex align-items-center p-3 mb-2 rounded"
                                        style={{
                                            backgroundColor: '#f8f9fa',
                                            borderLeft: `4px solid ${GREEN}`,
                                        }}
                                    >
                                        <span
                                            className="badge me-3"
                                            style={getBadgeStyle(visit.badge)}
                                        >
                                            {getBadgeLabel(visit.badge)}
                                        </span>
                                        <div className="flex-grow-1">
                                            <div className="fw-semibold" style={{ color: NAVY }}>
                                                {visit.client?.company_name || '—'}
                                            </div>
                                            <div className="small text-muted">
                                                {formatTime(visit.start_time)} — {visit.user?.name}
                                            </div>
                                        </div>
                                        <div className="text-muted">
                                            <i className="bi bi-chevron-right"></i>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </AuthenticatedLayout>
    );
}
