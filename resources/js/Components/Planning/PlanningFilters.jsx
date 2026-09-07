import { router } from '@inertiajs/react';

const NAVY = '#13293D';
const GREEN = '#1FBE7A';

function planningHref(month, year, tcId = null, status = 'all') {
    const params = new URLSearchParams();
    params.set('month', String(month));
    params.set('year', String(year));
    if (tcId) params.set('tc_id', String(tcId));
    if (status && status !== 'all') params.set('status', status);
    return `/planning?${params.toString()}`;
}

export default function PlanningFilters({
    teamMembers,
    selectedTc,
    statusFilter,
    showTc,
    showStatusFilter,
    month,
    year,
    openFilter,
    setOpenFilter,
}) {
    const selectedTcName = teamMembers.find((m) => Number(m.id) === Number(selectedTc))?.name || 'Tous les TC';
    const statusLabel = {
        all: 'Tous les statuts',
        abouti: 'RDV passé abouti',
        non_abouti: 'RDV passé non abouti',
        today: "RDV aujourd'hui",
        upcoming: 'RDV à venir',
    }[statusFilter] || 'Tous les statuts';
    const dropdownBtnStyle = {
        backgroundColor: '#fff',
        border: `1.5px solid ${NAVY}`,
        borderRadius: 8,
        color: NAVY,
        fontWeight: 600,
        fontSize: 13,
        padding: '6px 14px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        minWidth: 180,
        textAlign: 'left',
    };
    const dropdownMenuStyle = {
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: 'none',
        overflow: 'hidden',
        padding: 6,
    };

    if (!(teamMembers.length > 0 || showStatusFilter)) {
        return null;
    }

    return (
        <div className="d-flex flex-wrap gap-2 mb-3">
            {teamMembers.length > 0 && (
                <div className="dropdown">
                    <button
                        type="button"
                        className="btn btn-sm dropdown-toggle planning-filter-btn"
                        data-bs-toggle="dropdown"
                        aria-expanded={openFilter === 'tc'}
                        style={dropdownBtnStyle}
                        onClick={() => setOpenFilter(openFilter === 'tc' ? null : 'tc')}
                    >
                        {selectedTcName}
                    </button>
                    <ul className={`dropdown-menu planning-filter-menu ${openFilter === 'tc' ? 'show' : ''}`} style={dropdownMenuStyle}>
                        <li>
                            <button
                                type="button"
                                className={`dropdown-item${selectedTc == null || selectedTc === '' ? ' is-active' : ''}`}
                                onClick={() => {
                                    setOpenFilter(null);
                                    router.visit(planningHref(month, year, null, statusFilter));
                                }}
                            >
                                Tous les TC
                            </button>
                        </li>
                        {teamMembers.map((member) => (
                            <li key={member.id}>
                                <button
                                    type="button"
                                    className={`dropdown-item${Number(selectedTc) === Number(member.id) ? ' is-active' : ''}`}
                                    onClick={() => {
                                        setOpenFilter(null);
                                        router.visit(planningHref(month, year, member.id, statusFilter));
                                    }}
                                >
                                    {member.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {showStatusFilter && (
                <div className="dropdown">
                    <button
                        type="button"
                        className="btn btn-sm dropdown-toggle planning-filter-btn"
                        data-bs-toggle="dropdown"
                        aria-expanded={openFilter === 'status'}
                        style={dropdownBtnStyle}
                        onClick={() => setOpenFilter(openFilter === 'status' ? null : 'status')}
                    >
                        {statusLabel}
                    </button>
                    <ul className={`dropdown-menu planning-filter-menu ${openFilter === 'status' ? 'show' : ''}`} style={dropdownMenuStyle}>
                        {[
                            { value: 'all', label: 'Tous les statuts' },
                            { value: 'today', label: "RDV aujourd'hui" },
                            { value: 'upcoming', label: 'RDV à venir' },
                            { value: 'abouti', label: 'RDV passé abouti' },
                            { value: 'non_abouti', label: 'RDV passé non abouti' },
                        ].map((option) => (
                            <li key={option.value}>
                                <button
                                    type="button"
                                    className={`dropdown-item${(statusFilter || 'all') === option.value ? ' is-active' : ''}`}
                                    onClick={() => {
                                        setOpenFilter(null);
                                        router.visit(planningHref(month, year, selectedTc, option.value));
                                    }}
                                >
                                    {option.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
