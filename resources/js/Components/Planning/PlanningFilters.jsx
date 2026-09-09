import { useState } from 'react';
import { router } from '@inertiajs/react';

const NAVY = '#13293D';

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
    showStatusFilter,
    month,
    year,
    openFilter,
    setOpenFilter,
}) {
    const [expandedGroup, setExpandedGroup] = useState(null);
    const selectedTcName = teamMembers.find((m) => Number(m.id) === Number(selectedTc))?.name || 'Tous les TC';
    const statusLabel = {
        all: 'Tous les statuts',
        today: "Aujourd'hui",
        upcoming_approved: 'À venir — Validé',
        pending: 'À venir — En attente',
        abouti: 'Passé — Abouti',
        non_abouti: 'Passé — Non abouti',
        refused: 'Passé — Annulé',
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
                        <li>
                            <button
                                type="button"
                                className={`dropdown-item${(statusFilter || 'all') === 'all' ? ' is-active' : ''}`}
                                onClick={() => {
                                    setOpenFilter(null);
                                    setExpandedGroup(null);
                                    router.visit(planningHref(month, year, selectedTc, 'all'));
                                }}
                            >
                                Tous les statuts
                            </button>
                        </li>
                        <li>
                            <hr style={{ border: 0, borderTop: '1px solid #e9ecef', margin: '4px 0' }} />
                        </li>
                        <li>
                            <button
                                type="button"
                                className="dropdown-item"
                                style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: statusFilter === 'today' ? '#1FBE7A' : '#6c757d',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    padding: '6px 16px 4px',
                                }}
                                onClick={() => {
                                    setOpenFilter(null);
                                    setExpandedGroup(null);
                                    router.visit(planningHref(month, year, selectedTc, 'today'));
                                }}
                            >
                                Aujourd'hui
                            </button>
                        </li>
                        <li>
                            <hr style={{ border: 0, borderTop: '1px solid #e9ecef', margin: '4px 0' }} />
                        </li>
                        <li>
                            <div
                                className="d-flex justify-content-between align-items-center"
                                style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: '#6c757d',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    padding: '6px 16px 4px',
                                }}
                            >
                                <span>À venir</span>
                                <button
                                    type="button"
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        color: '#6c757d',
                                        fontSize: 11,
                                        padding: 0,
                                        lineHeight: 1,
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setExpandedGroup(expandedGroup === 'avenir' ? null : 'avenir');
                                    }}
                                >
                                    {expandedGroup === 'avenir' ? '▼' : '▶'}
                                </button>
                            </div>
                        </li>
                        {expandedGroup === 'avenir' && (
                            <>
                                <li>
                                    <button
                                        type="button"
                                        className="dropdown-item"
                                        style={{
                                            padding: '6px 16px 6px 28px',
                                            fontSize: 13,
                                            color: statusFilter === 'upcoming_approved' ? '#1FBE7A' : '#13293D',
                                            fontWeight: statusFilter === 'upcoming_approved' ? 600 : 400,
                                            backgroundColor: 'transparent',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        onClick={() => {
                                            setOpenFilter(null);
                                            setExpandedGroup(null);
                                            router.visit(planningHref(month, year, selectedTc, 'upcoming_approved'));
                                        }}
                                    >
                                        Validé
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className="dropdown-item"
                                        style={{
                                            padding: '6px 16px 6px 28px',
                                            fontSize: 13,
                                            color: statusFilter === 'pending' ? '#1FBE7A' : '#13293D',
                                            fontWeight: statusFilter === 'pending' ? 600 : 400,
                                            backgroundColor: 'transparent',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        onClick={() => {
                                            setOpenFilter(null);
                                            setExpandedGroup(null);
                                            router.visit(planningHref(month, year, selectedTc, 'pending'));
                                        }}
                                    >
                                        En attente
                                    </button>
                                </li>
                            </>
                        )}
                        <li>
                            <hr style={{ border: 0, borderTop: '1px solid #e9ecef', margin: '4px 0' }} />
                        </li>
                        <li>
                            <div
                                className="d-flex justify-content-between align-items-center"
                                style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: '#6c757d',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    padding: '6px 16px 4px',
                                }}
                            >
                                <span>RDV Passé</span>
                                <button
                                    type="button"
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        color: '#6c757d',
                                        fontSize: 11,
                                        padding: 0,
                                        lineHeight: 1,
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setExpandedGroup(expandedGroup === 'passe' ? null : 'passe');
                                    }}
                                >
                                    {expandedGroup === 'passe' ? '▼' : '▶'}
                                </button>
                            </div>
                        </li>
                        {expandedGroup === 'passe' && (
                            <>
                                <li>
                                    <button
                                        type="button"
                                        className="dropdown-item"
                                        style={{
                                            padding: '6px 16px 6px 28px',
                                            fontSize: 13,
                                            color: statusFilter === 'abouti' ? '#1FBE7A' : '#13293D',
                                            fontWeight: statusFilter === 'abouti' ? 600 : 400,
                                            backgroundColor: 'transparent',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        onClick={() => {
                                            setOpenFilter(null);
                                            setExpandedGroup(null);
                                            router.visit(planningHref(month, year, selectedTc, 'abouti'));
                                        }}
                                    >
                                        Abouti
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className="dropdown-item"
                                        style={{
                                            padding: '6px 16px 6px 28px',
                                            fontSize: 13,
                                            color: statusFilter === 'non_abouti' ? '#1FBE7A' : '#13293D',
                                            fontWeight: statusFilter === 'non_abouti' ? 600 : 400,
                                            backgroundColor: 'transparent',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        onClick={() => {
                                            setOpenFilter(null);
                                            setExpandedGroup(null);
                                            router.visit(planningHref(month, year, selectedTc, 'non_abouti'));
                                        }}
                                    >
                                        Non abouti
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className="dropdown-item"
                                        style={{
                                            padding: '6px 16px 6px 28px',
                                            fontSize: 13,
                                            color: statusFilter === 'refused' ? '#1FBE7A' : '#13293D',
                                            fontWeight: statusFilter === 'refused' ? 600 : 400,
                                            backgroundColor: 'transparent',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                        onClick={() => {
                                            setOpenFilter(null);
                                            setExpandedGroup(null);
                                            router.visit(planningHref(month, year, selectedTc, 'refused'));
                                        }}
                                    >
                                        Annulé par responsable
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
