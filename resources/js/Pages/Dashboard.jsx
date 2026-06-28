/**
 * Dashboard.jsx
 *
 * Page d'accueil après authentification.
 * Utilise AuthenticatedLayout comme structure globale (Layout).
 *
 * `auth.user` est fourni automatiquement par Laravel via Inertia
 * (défini dans HandleInertiaRequests.php)
 */

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Tableau de bord" />

            <div className="mb-4">
                <h4 style={{ color: '#13293D', fontWeight: '600' }}>
                    Tableau de bord
                </h4>
                <p className="text-muted small">
                    Bienvenue, {auth.user.name}. Sélectionnez un module dans le menu.
                </p>
            </div>

            {/* Cartes statistiques temporaires — seront liées à la base de données ultérieurement */}
            <div className="row g-3">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm text-center p-3">
                        <div style={{ fontSize: '28px' }}>📋</div>
                        <h6 className="mt-2 mb-0">Visites</h6>
                        <p className="text-muted small mb-0">—</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm text-center p-3">
                        <div style={{ fontSize: '28px' }}>🔬</div>
                        <h6 className="mt-2 mb-0">Fiches R&D</h6>
                        <p className="text-muted small mb-0">—</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm text-center p-3">
                        <div style={{ fontSize: '28px' }}>🧪</div>
                        <h6 className="mt-2 mb-0">Formulations</h6>
                        <p className="text-muted small mb-0">—</p>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm text-center p-3">
                        <div style={{ fontSize: '28px' }}>🏭</div>
                        <h6 className="mt-2 mb-0">Production</h6>
                        <p className="text-muted small mb-0">—</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
