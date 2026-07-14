/**
 * AuthenticatedLayout.jsx
 *
 * Le cadre général de toutes les pages du règlement intérieur après connexion.
 */

import { Link, usePage } from "@inertiajs/react";
import { ROLE_LABELS } from "@/constants/visitOptions";

const NAVY = "#13293D";
const GREEN = "#1FBE7A";

const styles = {
    wrapper: {
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
    },
    navbar: {
        backgroundColor: NAVY,
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    },
    navbarLogo: {
        height: '40px',
        objectFit: 'contain',
        backgroundColor: 'white',
        borderRadius: '4px',
        padding: '2px 8px',
    },
    navbarRight: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
    navbarUsername: {
        color: "#cdd8e3",
        fontSize: "14px",
    },
    navbarRole: {
        color: GREEN,
        fontSize: "11px",
        backgroundColor: "rgba(31,190,122,0.15)",
        padding: "2px 8px",
        borderRadius: "4px",
    },
    navbarLogout: {
        color: GREEN,
        fontSize: "14px",
        textDecoration: "none",
        border: `1px solid ${GREEN}`,
        borderRadius: "4px",
        padding: "4px 12px",
        transition: "background 0.2s",
        cursor: "pointer",
        background: "none",
    },
    body: {
        display: "flex",
        flex: 1,
        marginTop: "56px",
    },
    sidebar: {
        width: "220px",
        backgroundColor: NAVY,
        minHeight: "calc(100vh - 56px)",
        position: "fixed",
        top: "56px",
        left: 0,
        bottom: 0,
        overflowY: "auto",
        paddingTop: "16px",
    },
    sidebarSection: {
        padding: "8px 16px 4px",
        fontSize: "11px",
        color: "#6b8aaa",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginTop: "8px",
    },
    sidebarLink: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 20px",
        color: "#cdd8e3",
        textDecoration: "none",
        fontSize: "14px",
        transition: "background 0.15s, color 0.15s",
        borderLeft: "3px solid transparent",
    },
    sidebarLinkActive: {
        backgroundColor: "rgba(31,190,122,0.12)",
        color: GREEN,
        borderLeft: `3px solid ${GREEN}`,
    },
    content: {
        marginLeft: "220px",
        flex: 1,
        padding: "28px",
    },
};

const allNavItems = [
    {
        section: "Administration",
        roles: ["admin"],
        links: [
            { label: "Projets", icon: "📋", routeName: "visits.index", pathPrefix: "/visites" },
            { label: "Planning", icon: "📅", routeName: "planning.index", pathPrefix: "/planning" },
            { label: "Clients", icon: "🏭", routeName: "clients.index", pathPrefix: "/clients" },
            { label: "Fiches R&D", icon: "🔬", routeName: "dashboard", pathPrefix: null, disabled: true },
            { label: "Formulations", icon: "🧪", routeName: "dashboard", pathPrefix: null, disabled: true },
            { label: "Commercialisation", icon: "🏭", routeName: "dashboard", pathPrefix: null, disabled: true },
            { label: "Gérer les utilisateurs", icon: "👤", routeName: "admin.users.index", pathPrefix: "/admin/users" },
        ],
    },
    {
        section: "Commercial",
        roles: ["commercial", "responsable_commercial"],
        links: [
            { label: "Projets", icon: "📋", routeName: "visits.index", pathPrefix: "/visites" },
            { label: "Planning", icon: "📅", routeName: "planning.index", pathPrefix: "/planning" },
            { label: "Clients", icon: "🏭", routeName: "clients.index", pathPrefix: "/clients" },
        ],
    },
    {
        section: "Équipe",
        roles: ["responsable_commercial"],
        links: [
            { label: "Gérer l'équipe", icon: "👥", routeName: "team.index", pathPrefix: "/team" },
        ],
    },
    {
        section: "R&D",
        roles: ["rd"],
        links: [
            { label: "Fiches R&D", icon: "🔬", routeName: "dashboard", pathPrefix: null, disabled: true },
            { label: "Formulations", icon: "🧪", routeName: "dashboard", pathPrefix: null, disabled: true },
        ],
    },
    {
        section: "Production",
        roles: ["production"],
        links: [
            { label: "Commercialisation", icon: "🏭", routeName: "dashboard", pathPrefix: null, disabled: true },
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
        <div style={styles.wrapper}>
            <nav style={styles.navbar}>
                <img
                    src="/images/logo-acp.png"
                    alt="ACP Solution"
                    style={styles.navbarLogo}
                />

                <div style={styles.navbarRight}>
                    {primaryRole && (
                        <span style={styles.navbarRole}>
                            {ROLE_LABELS[primaryRole] ?? primaryRole}
                        </span>
                    )}
                    <span style={styles.navbarUsername}>
                        {user?.name ?? "Utilisateur"}
                    </span>

                    <Link
                        href={route("logout")}
                        method="post"
                        as="button"
                        style={styles.navbarLogout}
                    >
                        Déconnexion
                    </Link>
                </div>
            </nav>

            <div style={styles.body}>
                <aside style={styles.sidebar}>
                    <Link
                        href={route("dashboard")}
                        style={{
                            ...styles.sidebarLink,
                            ...(url === "/dashboard" ? styles.sidebarLinkActive : {}),
                        }}
                    >
                        <span>🏠</span>
                        <span>Tableau de bord</span>
                    </Link>

                    {visibleSections.map((section) => (
                        <div key={section.section}>
                            <p style={styles.sidebarSection}>{section.section}</p>

                            {section.links.map((item) => {
                                const isActive = item.pathPrefix
                                    ? url.startsWith(item.pathPrefix)
                                    : false;

                                if (item.disabled) {
                                    return (
                                        <span
                                            key={item.label}
                                            style={{
                                                ...styles.sidebarLink,
                                                opacity: 0.45,
                                                cursor: "not-allowed",
                                            }}
                                            title="Bientôt disponible"
                                        >
                                            <span>{item.icon}</span>
                                            <span>{item.label}</span>
                                        </span>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.label}
                                        href={route(item.routeName)}
                                        style={{
                                            ...styles.sidebarLink,
                                            ...(isActive ? styles.sidebarLinkActive : {}),
                                        }}
                                    >
                                        <span>{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </aside>

                <main style={styles.content}>{children}</main>
            </div>
        </div>
    );
}
