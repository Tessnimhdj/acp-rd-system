import { Link, usePage } from "@inertiajs/react";
import { ROLE_LABELS } from "@/constants/visitOptions";

const allNavItems = [
    {
        section: "Administration",
        roles: ["admin"],
        links: [
            { label: "Projets", routeName: "visits.index", pathPrefix: "/visites" },
            { label: "Planning", routeName: "planning.index", pathPrefix: "/planning" },
            { label: "Clients", routeName: "clients.index", pathPrefix: "/clients" },
            { label: "Fiches R&D", routeName: "dashboard", pathPrefix: null, disabled: true },
            { label: "Formulations", routeName: "dashboard", pathPrefix: null, disabled: true },
            { label: "Commercialisation", routeName: "dashboard", pathPrefix: null, disabled: true },
            { label: "Utilisateurs", routeName: "admin.users.index", pathPrefix: "/admin/users" },
        ],
    },
    {
        section: "Commercial",
        roles: ["commercial", "responsable_commercial"],
        links: [
            { label: "Projets", routeName: "visits.index", pathPrefix: "/visites" },
            { label: "Planning", routeName: "planning.index", pathPrefix: "/planning" },
            { label: "Clients", routeName: "clients.index", pathPrefix: "/clients" },
        ],
    },
    {
        section: "Équipe",
        roles: ["responsable_commercial"],
        links: [
            { label: "Gérer l'équipe", routeName: "team.index", pathPrefix: "/team" },
        ],
    },
    {
        section: "R&D",
        roles: ["rd"],
        links: [
            { label: "Fiches R&D", routeName: "dashboard", pathPrefix: null, disabled: true },
            { label: "Formulations", routeName: "dashboard", pathPrefix: null, disabled: true },
        ],
    },
    {
        section: "Production",
        roles: ["production"],
        links: [
            { label: "Commercialisation", routeName: "dashboard", pathPrefix: null, disabled: true },
        ],
    },
];

function userHasAccess(userRoles, allowedRoles) {
    return allowedRoles.some((role) => userRoles.includes(role));
}

export default function AuthenticatedLayout({ user, children }) {
    const { url } = usePage();
    const userRoles = user?.roles ?? [];
    const primaryRole = userRoles[0];

    const visibleSections = allNavItems.filter((section) =>
        userHasAccess(userRoles, section.roles),
    );

    return (
        <div className="app-shell">
            <header className="app-top">
                <img src="/images/logo-acp.png" alt="ACP Solution" className="app-logo" />

                <div className="app-top-user">
                    <span className="app-user">
                        {user?.name ?? "Utilisateur"}
                        {primaryRole && (
                            <span className="app-role">
                                {ROLE_LABELS[primaryRole] ?? primaryRole}
                            </span>
                        )}
                    </span>

                    <Link href={route("logout")} method="post" as="button" className="app-logout">
                        Déconnexion
                    </Link>
                </div>
            </header>

            <div className="app-body">
                <aside className="app-side">
                    <Link
                        href={route("dashboard")}
                        className={url === "/dashboard" ? "is-active" : undefined}
                    >
                        Tableau de bord
                    </Link>

                    <Link
                        href={route("about.index")}
                        className={url.startsWith("/about") ? "is-active" : undefined}
                    >
                        À propos
                    </Link>

                    {visibleSections.map((section) => (
                        <div key={section.section}>
                            <p className="app-side-label">{section.section}</p>

                            {section.links.map((item) => {
                                const isActive = item.pathPrefix
                                    ? url.startsWith(item.pathPrefix)
                                    : false;

                                if (item.disabled) {
                                    return (
                                        <span key={item.label} className="is-disabled" title="Pas encore en ligne">
                                            {item.label}
                                        </span>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.label}
                                        href={route(item.routeName)}
                                        className={isActive ? "is-active" : undefined}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </aside>

                <main className="app-main">{children}</main>
            </div>
        </div>
    );
}
