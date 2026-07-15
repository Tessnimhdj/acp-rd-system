/**
 * Dashboard.jsx
 *
 * Page d'accueil après authentification.
 * Utilise AuthenticatedLayout comme structure globale (Layout).
 *
 * Affiche des cartes de statistiques conditionnelles selon le rôle et les permissions de l'utilisateur.
 */

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const NAVY = '#13293D';
const GREEN = '#1FBE7A';

export default function Dashboard({ auth, stats }) {
    const { user } = auth;

    // Fonction d'aide pour vérifier les rôles
    const hasRole = (role) => user?.roles?.includes(role);

    return (
        <AuthenticatedLayout user={user}>
            <Head title="Tableau de bord" />

            <div className="mb-4">
                <h4 style={{ color: NAVY, fontWeight: '600' }}>
                    Tableau de bord
                </h4>
                <p className="text-muted small">
                    Bienvenue, {user.name}. Voici vos statistiques.
                </p>
            </div>

            {/* Section des statistiques conditionnelle selon le rôle */}
            <div className="row g-3">

                {/* Admin Statistics */}
                {hasRole('admin') && (
                    <>
                        <div className="col-md-3">
                            <Link href={route('visits.index')} className="text-decoration-none">
                                <div className="card border-0 shadow-sm text-center p-3 h-100">
                                    <div style={{ fontSize: '28px' }}>📋</div>
                                    <h3 className="mt-2 mb-0" style={{ color: NAVY }}>{stats.total_visits || 0}</h3>
                                    <p className="text-muted small mb-0">Total visites</p>
                                </div>
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <Link href={route('clients.index')} className="text-decoration-none">
                                <div className="card border-0 shadow-sm text-center p-3 h-100">
                                    <div style={{ fontSize: '28px' }}>🏢</div>
                                    <h3 className="mt-2 mb-0" style={{ color: NAVY }}>{stats.total_clients || 0}</h3>
                                    <p className="text-muted small mb-0">Total clients</p>
                                </div>
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <Link href={route('admin.users.index')} className="text-decoration-none">
                                <div className="card border-0 shadow-sm text-center p-3 h-100">
                                    <div style={{ fontSize: '28px' }}>👥</div>
                                    <h3 className="mt-2 mb-0" style={{ color: NAVY }}>{stats.total_users || 0}</h3>
                                    <p className="text-muted small mb-0">Total utilisateurs</p>
                                </div>
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <Link href={route('visits.index')} className="text-decoration-none">
                                <div className="card border-0 shadow-sm text-center p-3 h-100">
                                    <div style={{ fontSize: '28px' }}>🔬</div>
                                    <h3 className="mt-2 mb-0" style={{ color: GREEN }}>{stats.pending_rd || 0}</h3>
                                    <p className="text-muted small mb-0">En attente R&D</p>
                                </div>
                            </Link>
                        </div>
                    </>
                )}

                {/* Responsable Commercial Statistics */}
                {hasRole('responsable_commercial') && (
                    <>
                        <div className="col-md-3">
                            <Link href={route('visits.index')} className="text-decoration-none">
                                <div className="card border-0 shadow-sm text-center p-3 h-100">
                                    <div style={{ fontSize: '28px' }}>📋</div>
                                    <h3 className="mt-2 mb-0" style={{ color: NAVY }}>{stats.team_visits_total || 0}</h3>
                                    <p className="text-muted small mb-0">Visites équipe (total)</p>
                                </div>
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm text-center p-3 h-100">
                                <div style={{ fontSize: '28px' }}>📅</div>
                                <h3 className="mt-2 mb-0" style={{ color: NAVY }}>{stats.team_visits_month || 0}</h3>
                                <p className="text-muted small mb-0">Visites ce mois</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <Link href={route('team.index')} className="text-decoration-none">
                                <div className="card border-0 shadow-sm text-center p-3 h-100">
                                    <div style={{ fontSize: '28px' }}>👥</div>
                                    <h3 className="mt-2 mb-0" style={{ color: NAVY }}>{stats.team_members || 0}</h3>
                                    <p className="text-muted small mb-0">Membres équipe</p>
                                </div>
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <Link href={route('visits.index')} className="text-decoration-none">
                                <div className="card border-0 shadow-sm text-center p-3 h-100">
                                    <div style={{ fontSize: '28px' }}>🔬</div>
                                    <h3 className="mt-2 mb-0" style={{ color: GREEN }}>{stats.pending_rd || 0}</h3>
                                    <p className="text-muted small mb-0">En attente R&D</p>
                                </div>
                            </Link>
                        </div>
                    </>
                )}

                {/* Commercial Statistics */}
                {hasRole('commercial') && (
                    <>
                        <div className="col-md-4">
                            <Link href={route('visits.index')} className="text-decoration-none">
                                <div className="card border-0 shadow-sm text-center p-3 h-100">
                                    <div style={{ fontSize: '28px' }}>📋</div>
                                    <h3 className="mt-2 mb-0" style={{ color: NAVY }}>{stats.my_visits_total || 0}</h3>
                                    <p className="text-muted small mb-0">Mes visites (total)</p>
                                </div>
                            </Link>
                        </div>
                        <div className="col-md-4">
                            <div className="card border-0 shadow-sm text-center p-3 h-100">
                                <div style={{ fontSize: '28px' }}>📅</div>
                                <h3 className="mt-2 mb-0" style={{ color: NAVY }}>{stats.my_visits_month || 0}</h3>
                                <p className="text-muted small mb-0">Visites ce mois</p>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <Link href={route('planning.index')} className="text-decoration-none">
                                <div className="card border-0 shadow-sm text-center p-3 h-100">
                                    <div style={{ fontSize: '28px' }}>📆</div>
                                    <h3 className="mt-2 mb-0" style={{ color: GREEN }}>{stats.upcoming || 0}</h3>
                                    <p className="text-muted small mb-0">À venir</p>
                                </div>
                            </Link>
                        </div>
                    </>
                )}

                {/* R&D Statistics */}
                {hasRole('rd') && (
                    <>
                        <div className="col-md-6">
                            <Link href={route('visits.index')} className="text-decoration-none">
                                <div className="card border-0 shadow-sm text-center p-3 h-100">
                                    <div style={{ fontSize: '28px' }}>🔬</div>
                                    <h3 className="mt-2 mb-0" style={{ color: GREEN }}>{stats.to_process || 0}</h3>
                                    <p className="text-muted small mb-0">À traiter (submitted)</p>
                                </div>
                            </Link>
                        </div>
                        <div className="col-md-6">
                            <Link href={route('visits.index')} className="text-decoration-none">
                                <div className="card border-0 shadow-sm text-center p-3 h-100">
                                    <div style={{ fontSize: '28px' }}>⚙️</div>
                                    <h3 className="mt-2 mb-0" style={{ color: NAVY }}>{stats.in_progress || 0}</h3>
                                    <p className="text-muted small mb-0">En cours (in_rd)</p>
                                </div>
                            </Link>
                        </div>
                    </>
                )}

                {/* Production Statistics */}
                {hasRole('production') && (
                    <div className="col-md-12">
                        <Link href={route('visits.index')} className="text-decoration-none">
                            <div className="card border-0 shadow-sm text-center p-3 h-100">
                                <div style={{ fontSize: '28px' }}>🏭</div>
                                <h3 className="mt-2 mb-0" style={{ color: GREEN }}>{stats.approved || 0}</h3>
                                <p className="text-muted small mb-0">Visites approuvées (approved)</p>
                            </div>
                        </Link>
                    </div>
                )}

            </div>

        </AuthenticatedLayout>
    );
}
