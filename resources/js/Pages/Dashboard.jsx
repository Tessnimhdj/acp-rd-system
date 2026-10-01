import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

function StatRow({ href, value, label, accent = false }) {
    return (
        <tr>
            <td className="px-4 py-3">
                {href ? <Link href={href}>{label}</Link> : label}
            </td>
            <td className="px-4 py-3 text-end fw-semibold" style={{ color: accent ? '#00A86B' : '#0E2238' }}>
                {value || 0}
            </td>
        </tr>
    );
}

export default function Dashboard({ auth, stats }) {
    const { user } = auth;
    const hasRole = (role) => user?.roles?.includes(role);

    const today = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const rows = [
        hasRole('admin') && [
            { href: route('visits.index'), value: stats.total_visits, label: 'Visites' },
            { href: route('clients.index'), value: stats.total_clients, label: 'Clients' },
            { href: route('admin.users.index'), value: stats.total_users, label: 'Utilisateurs' },
            { href: route('visits.index'), value: stats.pending_rd, label: 'En attente R&D', accent: true },
        ],
        hasRole('responsable_commercial') && [
            { href: route('visits.index'), value: stats.team_visits_total, label: "Visites de l'équipe" },
            { value: stats.team_visits_month, label: 'Visites ce mois' },
            { href: route('team.index'), value: stats.team_members, label: "Membres de l'équipe" },
            { href: route('visits.index'), value: stats.pending_rd, label: 'En attente R&D', accent: true },
        ],
        hasRole('commercial') && [
            { href: route('visits.index'), value: stats.my_visits_total, label: 'Mes visites' },
            { value: stats.my_visits_month, label: 'Visites ce mois' },
            { href: route('planning.index'), value: stats.upcoming, label: 'Rendez-vous à venir', accent: true },
        ],
        hasRole('rd') && [
            { href: route('visits.index'), value: stats.to_process, label: 'Fiches à traiter', accent: true },
            { href: route('visits.index'), value: stats.in_progress, label: 'Fiches en cours' },
        ],
        hasRole('production') && [
            { href: route('visits.index'), value: stats.approved, label: 'Visites approuvées', accent: true },
        ],
    ]
        .filter(Boolean)
        .flat();

    return (
        <AuthenticatedLayout user={user}>
            <Head title="Tableau de bord" />

            <header className="page-head">
                <h1>Tableau de bord</h1>
                <p>
                    {user.name}, {today}
                </p>
            </header>

            <div className="bg-white border" style={{ borderColor: '#E5E7EB', borderRadius: 4, maxWidth: 640 }}>
                <table className="table mb-0">
                    <tbody>
                        {rows.map((row, index) => (
                            <StatRow key={`${row.label}-${index}`} {...row} />
                        ))}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
