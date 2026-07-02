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

export default function Dashboard({ auth }) {
    const { user } = auth;

    // Fonction d'aide pour vérifier facilement les permissions au sein du composant
    const hasPermission = (permission) => user?.permissions?.includes(permission);

    // Fonction d'aide pour vérifier les rôles
    const hasRole = (role) => user?.roles?.includes(role);

    return (
        <AuthenticatedLayout user={user}>
            <Head title="Tableau de bord" />

            <div className="mb-4">
                <h4 style={{ color: '#13293D', fontWeight: '600' }}>
                    Tableau de bord
                </h4>
                <p className="text-muted small">
                    Bienvenue, {user.name}. Sélectionnez un module dans le menu.
                </p>
            </div>

            {/* Section des statistiques conditionnelle selon le rôle et la permission */}
            <div className="row g-3">

                {/* Carte Projets : Visible pour l'admin, le commercial, ou tout rôle ayant la permission de voir les visites */}
                {(hasRole('admin') || hasPermission('manage-visits') || hasPermission('view-all-visits')) && (
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm text-center p-3 h-100">
                            <div style={{ fontSize: '28px' }}>📋</div>
                            <h6 className="mt-2 mb-0">Projets</h6>
                            <p className="text-muted small mb-0">—</p>
                        </div>
                    </div>
                )}

                {/* Carte R&D : Visible pour l'admin et le rôle R&D */}
                {(hasRole('admin') || hasRole('rd')) && (
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm text-center p-3 h-100">
                            <div style={{ fontSize: '28px' }}>🔬</div>
                            <h6 className="mt-2 mb-0">Fiches R&D</h6>
                            <p className="text-muted small mb-0">—</p>
                        </div>
                    </div>
                )}

                {/* Carte Formulations : Visible pour l'admin et le rôle R&D */}
                {(hasRole('admin') || hasRole('rd')) && (
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm text-center p-3 h-100">
                            <div style={{ fontSize: '28px' }}>🧪</div>
                            <h6 className="mt-2 mb-0">Formulations</h6>
                            <p className="text-muted small mb-0">—</p>
                        </div>
                    </div>
                )}

                {/* Carte Production : Visible pour l'admin et le rôle Production */}
                {(hasRole('admin') || hasRole('production')) && (
                    <div className="col-md-3">
                        <div className="card border-0 shadow-sm text-center p-3 h-100">
                            <div style={{ fontSize: '28px' }}>🏭</div>
                            <h6 className="mt-2 mb-0">Production</h6>
                            <p className="text-muted small mb-0">—</p>
                        </div>
                    </div>
                )}
            </div>

        </AuthenticatedLayout>
    );
}
