import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const NAVY = '#13293D';
const GREEN = '#1FBE7A';

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR');
}

export default function Index({ auth, visits, canCreate }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Visites clients" />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 style={{ color: NAVY, fontWeight: 600 }}>Visites clients</h4>
                    <p className="text-muted small mb-0">
                        Carnet de visite technico-commercial — Fromagerie
                    </p>
                </div>
                {canCreate && (
                    <Link
                        href={route('visits.create')}
                        className="btn btn-sm text-white"
                        style={{ backgroundColor: GREEN }}
                    >
                        + Nouvelle visite
                    </Link>
                )}
            </div>

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead style={{ backgroundColor: '#f4f6f8' }}>
                            <tr>
                                <th>N°</th>
                                <th>Date</th>
                                <th>Entreprise</th>
                                <th>REF-CLI</th>
                                <th>Code R&D</th>
                                <th>TC</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {visits.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-muted py-5">
                                        Aucune visite enregistrée.
                                        {canCreate && (
                                            <>
                                                {' '}
                                                <Link href={route('visits.create')}>Créer la première visite</Link>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                visits.data.map((visit) => (
                                    <tr key={visit.id}>
                                        <td className="fw-semibold">
                                            {String(visit.visit_number).padStart(3, '0')}
                                        </td>
                                        <td>{formatDate(visit.visit_date)}</td>
                                        <td>{visit.client?.company_name ?? '—'}</td>
                                        <td>{visit.client?.ref_cli || '—'}</td>
                                        <td>{visit.rd_code || '—'}</td>
                                        <td className="small">{visit.user?.name ?? '—'}</td>
                                        <td className="text-end">
                                            <Link
                                                href={route('visits.show', visit.id)}
                                                className="btn btn-sm btn-outline-secondary"
                                            >
                                                Voir
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {visits.links?.length > 3 && (
                    <div className="card-footer bg-white d-flex flex-wrap gap-2 justify-content-center">
                        {visits.links.map((link, i) =>
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    className={`btn btn-sm ${link.active ? 'text-white' : 'btn-outline-secondary'}`}
                                    style={link.active ? { backgroundColor: NAVY } : {}}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="btn btn-sm btn-outline-secondary disabled"
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ),
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
