/**
 * Planning/Index.jsx
 * Calendrier mensuel — visites + rendez-vous
 * Navy #13293D · Green #1FBE7A
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { VISIT_STATUS_LABELS, VISIT_STATUS_COLORS } from '@/constants/visitOptions';

const NAVY = '#13293D';
const GREEN = '#1FBE7A';
const BLUE = '#3b82f6';
const ORANGE = '#fd7e14';
const RED = '#dc3545';
const GREY = '#6c757d';

const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

function formatTime(time) {
    if (!time) return '—';
    return String(time).substring(0, 5);
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function truncate(str, max = 14) {
    if (!str) return '—';
    return str.length > max ? `${str.substring(0, max)}…` : str;
}

function itemsForDay(map, day) {
    if (!map || Array.isArray(map)) return [];
    return map[day] ?? map[String(day)] ?? [];
}

function pad2(n) {
    return String(n).padStart(2, '0');
}

function toDate(year, month, day) {
    const d = new Date(year, month - 1, day);
    d.setHours(0, 0, 0, 0);
    return d;
}

function todayStart() {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
}

function goToMonth(month, year) {
    let m = month;
    let y = year;
    if (m < 1) {
        m = 12;
        y -= 1;
    }
    if (m > 12) {
        m = 1;
        y += 1;
    }
    router.visit(`/planning?month=${m}&year=${y}`, { preserveScroll: true });
}

function rdvColor(appointment, year, month, day) {
    if (appointment.status === 'completed' && appointment.negative_id) return RED;
    if (appointment.status === 'completed' && appointment.visit_id) return GREEN;
    if (appointment.status === 'completed' && !appointment.visit_id && !appointment.negative_id) {
        return '#fd7e14';
    }
    if (appointment.status === 'planned') {
        const cell = toDate(year, month, day).getTime();
        const today = todayStart().getTime();
        if (cell === today) return ORANGE;
        if (cell > today) return BLUE;
        return GREY;
    }
    return GREY;
}

function visitColor(visit) {
    return visit.status === 'rejected' ? RED : GREEN;
}

function clientName(client) {
    if (!client) return '—';
    if (typeof client === 'string') return client;
    return client.company_name || client.company_name || '—';
}

function motifLabel(negative) {
    if (!negative) return '—';
    const motif = negative.motif_refus || negative.motif;
    const labels = {
        price: 'Prix trop élevé',
        price: 'Prix trop élevé',
        competitor: 'Concurrence',
        competitor: 'Concurrence',
        no_need: 'Pas de besoin',
        no_need: 'Pas de besoin',
        other: negative.motif_autre || negative.motif_autre || 'Autre',
        other: negative.motif_autre || negative.motif_autre || 'Autre',
    };
    return labels[motif] || motif || '—';
}

function appointmentTc(appointment) {
    return appointment?.user?.name || appointment?.tc || '';
}

function tcInitial(name) {
    if (!name) return '';
    return name.trim().charAt(0).toUpperCase();
}

function planningHref(month, year, tcId = null, status = 'all') {
    const params = new URLSearchParams();
    params.set('month', String(month));
    params.set('year', String(year));
    if (tcId) params.set('tc_id', String(tcId));
    if (status && status !== 'all') params.set('status', status);
    return `/planning?${params.toString()}`;
}

function matchesStatusFilter(appointment, statusFilter) {
    if (!statusFilter || statusFilter === 'all') return true;
    if (statusFilter === 'abouti') return appointment.status === 'completed' && appointment.visit_id;
    if (statusFilter === 'non_abouti') return appointment.status === 'completed' && appointment.negative_id;
    const today = todayStart();
    const date = appointment.date ? new Date(`${appointment.date}T00:00:00`) : null;
    if (!date || Number.isNaN(date.getTime())) return false;
    if (statusFilter === 'today') return date.getTime() === today.getTime();
    if (statusFilter === 'upcoming') return date.getTime() > today.getTime() && appointment.status === 'planned';
    return true;
}

function canStartVisit(appointment, roles, userId, isDateCurrentOrPast) {
    const ownerId = appointment.user_id ?? appointment.user?.id;
    return (
        (roles.includes('commercial') || roles.includes('responsable_commercial'))
        && Number(ownerId) === Number(userId)
        && appointment.status === 'planned'
        && isDateCurrentOrPast
    );
}

function lookupById(map, id) {
    if (!map || id == null) return null;
    return map[id] ?? map[String(id)] ?? null;
}

export default function Index({
    auth,
    visitsByDay = {},
    appointmentsByDay = {},
    month,
    year,
    monthName,
    canCreate,
    clients = [],
    negativeVisits = {},
    positiveVisits = {},
    teamMembers = [],
    selectedTc = null,
    statusFilter = 'all',
}) {
    const [selectedDay, setSelectedDay] = useState(null);
    const [modalDay, setModalDay] = useState(null);
    const [openFilter, setOpenFilter] = useState(null);
    const calendarRef = useRef(null);
    const panelRef = useRef(null);

    const roles = auth?.user?.roles ?? [];
    const showTc = roles.includes('admin') || roles.includes('responsable_commercial');
    const showStatusFilter = showTc || roles.includes('commercial');
    const canOpenAppointmentModal = roles.includes('commercial') || roles.includes('responsable_commercial');

    const form = useForm({
        client_id: '',
        scheduled_date: '',
        scheduled_time: '',
        objective: '',
    });

    const daysInMonth = new Date(year, month, 0).getDate();
    const mondayOffset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
    const todayDay = now.getDate();

    const cells = useMemo(() => {
        const total = mondayOffset + daysInMonth;
        const weeks = Math.ceil(total / 7) * 7;
        const list = [];
        for (let i = 0; i < weeks; i += 1) {
            const day = i - mondayOffset + 1;
            list.push(day >= 1 && day <= daysInMonth ? day : null);
        }
        return list;
    }, [daysInMonth, mondayOffset]);

    const selectedVisits = selectedDay && statusFilter === 'all'
        ? itemsForDay(visitsByDay, selectedDay)
        : [];
    const selectedRdvs = selectedDay
        ? itemsForDay(appointmentsByDay, selectedDay)
            .filter((a) => a.status !== 'cancelled')
            .filter((a) => matchesStatusFilter(a, statusFilter))
        : [];

    const selectedDateLabel = selectedDay
        ? capitalize(
              new Date(year, month - 1, selectedDay).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
              }),
          )
        : '';

    const isFuture = (day) => toDate(year, month, day) > todayStart();
    const isPastOrToday = (day) => toDate(year, month, day) <= todayStart();

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
    const dropdownItemStyle = (active) =>
        active
            ? { backgroundColor: GREEN, color: '#fff', fontWeight: 600, borderRadius: 6 }
            : { color: NAVY, borderRadius: 6 };

    const openModal = (day) => {
        form.setData({
            client_id: '',
            scheduled_date: `${year}-${pad2(month)}-${pad2(day)}`,
            scheduled_time: '',
            objective: '',
        });
        form.clearErrors();
        setModalDay(day);
    };

    const closeModal = () => {
        setModalDay(null);
        form.reset();
        form.clearErrors();
    };

    const submitAppointment = (e) => {
        e.preventDefault();
        form.post(route('appointments.store'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    useEffect(() => {
        const onDown = (e) => {
            if (openFilter && !e.target.closest('.dropdown')) {
                setOpenFilter(null);
            }
            if (!selectedDay || modalDay) return;
            const inCal = calendarRef.current?.contains(e.target);
            const inPanel = panelRef.current?.contains(e.target);
            if (!inCal && !inPanel) setSelectedDay(null);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [selectedDay, modalDay, openFilter]);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Planning" />

            <div className="d-grid align-items-center mb-4" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
                <h4 className="mb-0 fw-bold" style={{ color: NAVY }}>Planning</h4>

                <div className="d-flex align-items-center gap-2">
                    <button
                        type="button"
                        className="btn btn-sm border-0"
                        style={{ color: NAVY, fontWeight: 600, fontSize: 18, lineHeight: 1 }}
                        onClick={() => { setSelectedDay(null); closeModal(); goToMonth(month - 1, year); }}
                    >
                        ‹
                    </button>
                    <span className="px-3 fw-semibold" style={{ color: NAVY, fontSize: 16, minWidth: 160, textAlign: 'center' }}>
                        {capitalize(monthName)} {year}
                    </span>
                    <button
                        type="button"
                        className="btn btn-sm border-0"
                        style={{ color: NAVY, fontWeight: 600, fontSize: 18, lineHeight: 1 }}
                        onClick={() => { setSelectedDay(null); closeModal(); goToMonth(month + 1, year); }}
                    >
                        ›
                    </button>
                </div>

                <div />
            </div>

            {(teamMembers.length > 0 || showStatusFilter) && (
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
            )}

            <div ref={calendarRef} className="card border-0 shadow-sm mb-3" style={{ overflow: 'hidden' }}>
                <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                    {DAYS.map((label, i) => (
                        <div
                            key={label}
                            className="text-center py-2 small fw-semibold"
                            style={{
                                backgroundColor: '#f8f9fa',
                                color: i >= 5 ? '#adb5bd' : NAVY,
                                borderBottom: '1px solid #e9ecef',
                            }}
                        >
                            {label}
                        </div>
                    ))}

                    {cells.map((day, index) => {
                        if (!day) {
                            return (
                                <div
                                    key={`e-${index}`}
                                    style={{ minHeight: 72, backgroundColor: '#fafafa', border: '1px solid #e9ecef' }}
                                />
                            );
                        }

                        const rdvs = itemsForDay(appointmentsByDay, day)
                            .filter((a) => a.status !== 'cancelled')
                            .filter((a) => matchesStatusFilter(a, statusFilter));
                        const visits = statusFilter === 'all'
                            ? itemsForDay(visitsByDay, day).filter(
                                (v) => !v.appointment_id && !rdvs.some((a) => Number(a.visit_id) === Number(v.id)),
                            )
                            : [];
                        const hasData = visits.length + rdvs.length > 0;
                        const isToday = isCurrentMonth && day === todayDay;
                        const isSelected = selectedDay === day;
                        const isWeekend = index % 7 >= 5;
                        const canOpenModal = !hasData && isFuture(day) && canOpenAppointmentModal;
                        const clickable = hasData || canOpenModal;

                        const uniqueTcs = new Set(rdvs.map(appointmentTc).filter(Boolean));
                        const showTcBadge = showTc && uniqueTcs.size > 1;

                        const preview = [
                            ...rdvs.map((a) => ({
                                key: `a${a.id}`,
                                color: rdvColor(a, year, month, day),
                                label: clientName(a.client),
                                initial: showTc ? tcInitial(appointmentTc(a)) : '',
                            })),
                            ...visits.map((v) => ({
                                key: `v${v.id}`,
                                color: visitColor(v),
                                label: clientName(v.client),
                                initial: showTc ? tcInitial(v.tc) : '',
                            })),
                        ];

                        return (
                            <div
                                key={day}
                                role={clickable ? 'button' : undefined}
                                onClick={() => {
                                    if (hasData) {
                                        closeModal();
                                        setSelectedDay(isSelected ? null : day);
                                        return;
                                    }
                                    if (canOpenModal) {
                                        setSelectedDay(null);
                                        openModal(day);
                                    }
                                }}
                                style={{
                                    minHeight: 72,
                                    padding: '6px 8px',
                                    border: '1px solid #e9ecef',
                                    cursor: clickable ? 'pointer' : 'default',
                                    backgroundColor: isSelected ? '#e8f8f1' : isWeekend ? '#fafafa' : '#fff',
                                }}
                            >
                                <div
                                    style={{
                                        width: 26,
                                        height: 26,
                                        lineHeight: '26px',
                                        borderRadius: '50%',
                                        textAlign: 'center',
                                        fontSize: 13,
                                        fontWeight: isToday ? 700 : 400,
                                        color: isToday ? GREEN : isWeekend ? '#adb5bd' : '#495057',
                                        backgroundColor: isToday ? '#e8f8f1' : 'transparent',
                                    }}
                                >
                                    {day}
                                </div>
                                {preview.length > 0 && (
                                    <div className="mt-1 d-flex flex-column gap-1">
                                        {preview.slice(0, 3).map((item) => (
                                            <div key={item.key} className="d-flex align-items-center gap-1" style={{ overflow: 'hidden' }}>
                                                <span style={{ width: 8, height: 8, minWidth: 8, borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }} />
                                                <span style={{ fontSize: 10, color: '#6c757d', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                                    {truncate(item.label)}
                                                </span>
                                                {showTc && item.initial && (
                                                    <span
                                                        className="badge"
                                                        style={{
                                                            fontSize: 8,
                                                            padding: '1px 4px',
                                                            backgroundColor: NAVY,
                                                            color: '#fff',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {item.initial}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                        {preview.length > 3 && (
                                            <span style={{ fontSize: 10, color: '#adb5bd' }}>+{preview.length - 3} autres</span>
                                        )}
                                        {showTcBadge && (
                                            <span style={{ fontSize: 9, color: NAVY, fontWeight: 600 }}>
                                                {uniqueTcs.size} TC
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="d-flex flex-wrap gap-4 mb-4 px-1">
                {[
                    { color: '#3b82f6', label: 'RDV à venir' },
                    { color: '#fd7e14', label: "RDV aujourd'hui" },
                    { color: '#1FBE7A', label: 'RDV passé abouti' },
                    { color: '#dc3545', label: 'RDV passé non abouti' },
                ].map((item) => (
                    <div key={item.label} className="d-flex align-items-center gap-2">
                        <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }} />
                        <span style={{ fontSize: 12, color: '#6c757d' }}>{item.label}</span>
                    </div>
                ))}
            </div>

            {selectedDay && (
                <div ref={panelRef} className="card border-0 shadow-sm" style={{ borderLeft: `4px solid ${GREEN}` }}>
                    <div className="card-header border-0 py-3 px-4" style={{ backgroundColor: '#f8f9fa' }}>
                        <span className="fw-semibold" style={{ color: NAVY }}>{selectedDateLabel}</span>
                        {selectedRdvs.length > 0 && (
                            <span className="ms-2 badge" style={{ backgroundColor: BLUE, color: '#fff' }}>
                                {selectedRdvs.length} RDV
                            </span>
                        )}
                        {selectedVisits.length > 0 && (
                            <span className="ms-2 badge" style={{ backgroundColor: GREEN, color: '#fff' }}>
                                {selectedVisits.length} visite{selectedVisits.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <div className="card-body p-0">
                        {selectedRdvs.length === 0 && selectedVisits.length === 0 ? (
                            <p className="text-muted p-4 mb-0">Aucun événement ce jour.</p>
                        ) : (
                            <>
                                {selectedRdvs.map((rdv, i) => {
                                    const color = rdvColor(rdv, year, month, selectedDay);
                                    const negative = lookupById(negativeVisits, rdv.id);
                                    const positive = lookupById(positiveVisits, rdv.id);
                                    const isPositive = Boolean(positive) || Boolean(rdv.visit_id);
                                    const isNegative = Boolean(negative) || (rdv.status === 'completed' && rdv.negative_id);
                                    const visitId = positive?.id || rdv.visit_id;

                                    return (
                                    <div
                                        key={`rdv-${rdv.id}`}
                                        className="px-4 py-3"
                                        style={{
                                            borderTop: i > 0 ? '1px solid #f0f0f0' : 'none',
                                            borderLeft: `3px solid ${color}`,
                                        }}
                                    >
                                        {isPositive && (
                                            <div>
                                                <div className="fw-semibold mb-2" style={{ color: GREEN }}>
                                                    ✅ RDV passé abouti
                                                </div>
                                                <div className="small mb-1"><span className="text-muted">Client :</span> {clientName(positive?.client || rdv.client)}</div>
                                                {showTc && appointmentTc(rdv) && (
                                                    <div className="small mb-1"><span className="text-muted">TC :</span> {appointmentTc(rdv)}</div>
                                                )}
                                                <div className="small mb-1"><span className="text-muted">Date :</span> {selectedDateLabel}</div>
                                                {(positive?.visit_objective || rdv.objective) && (
                                                    <div className="small mb-1"><span className="text-muted">Objectif :</span> {positive?.visit_objective || rdv.objective}</div>
                                                )}
                                                {positive?.status && (
                                                    <div className="small mb-2">
                                                        <span className="text-muted">Statut : </span>
                                                        <span
                                                            className="badge"
                                                            style={{
                                                                backgroundColor: VISIT_STATUS_COLORS[positive.status] ?? '#6c757d',
                                                                color: '#fff',
                                                                fontSize: 11,
                                                            }}
                                                        >
                                                            {VISIT_STATUS_LABELS[positive.status] ?? positive.status}
                                                        </span>
                                                    </div>
                                                )}
                                                {visitId && (
                                                    <Link
                                                        href={route('visits.show', visitId)}
                                                        className="btn btn-sm"
                                                        style={{ border: `1px solid ${NAVY}`, color: NAVY, fontSize: 12 }}
                                                    >
                                                        Voir la fiche →
                                                    </Link>
                                                )}
                                            </div>
                                        )}

                                        {isNegative && (
                                            <div>
                                                <div className="fw-semibold mb-2" style={{ color: RED }}>
                                                    ❌ RDV passé non abouti
                                                </div>
                                                <div className="small mb-1"><span className="text-muted">Client :</span> {clientName(rdv.client)}</div>
                                                {showTc && appointmentTc(rdv) && (
                                                    <div className="small mb-1"><span className="text-muted">TC :</span> {appointmentTc(rdv)}</div>
                                                )}
                                                <div className="small mb-1"><span className="text-muted">Date :</span> {selectedDateLabel}</div>
                                                <div className="small mb-1"><span className="text-muted">Motif :</span> {motifLabel(negative)}</div>
                                                {negative?.notes && (
                                                    <div className="small text-muted">Notes : {negative.notes}</div>
                                                )}
                                            </div>
                                        )}

                                        {!isPositive && !isNegative && (
                                            <div className="d-flex flex-wrap align-items-center gap-3">
                                                <div className="fw-semibold" style={{ color: NAVY, minWidth: 48, fontSize: 14 }}>
                                                    {formatTime(rdv.scheduled_time)}
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="fw-semibold" style={{ color: NAVY }}>{clientName(rdv.client)}</div>
                                                    {showTc && appointmentTc(rdv) && (
                                                        <div className="small text-muted">TC : {appointmentTc(rdv)}</div>
                                                    )}
                                                    {rdv.objective && <div className="small text-muted">{rdv.objective}</div>}
                                                </div>
                                                {canStartVisit(rdv, roles, auth.user.id, isPastOrToday(selectedDay)) && (
                                                    <Link
                                                        href={route('planning.start', rdv.id)}
                                                        className="btn btn-sm text-white"
                                                        style={{ backgroundColor: GREEN, fontSize: 12 }}
                                                    >
                                                        Démarrer la visite →
                                                    </Link>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    );
                                })}

                                {selectedVisits.map((visit, i) => (
                                    <div
                                        key={`visit-${visit.id}`}
                                        className="d-flex flex-wrap align-items-center gap-3 px-4 py-3"
                                        style={{
                                            borderTop: i > 0 || selectedRdvs.length > 0 ? '1px solid #f0f0f0' : 'none',
                                            borderLeft: `3px solid ${visitColor(visit)}`,
                                        }}
                                    >
                                        <div className="fw-semibold" style={{ color: NAVY, minWidth: 48, fontSize: 14 }}>
                                            {formatTime(visit.start_time)}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="fw-semibold" style={{ color: NAVY }}>{clientName(visit.client)}</div>
                                            {showTc && visit.tc && <div className="small text-muted">TC : {visit.tc}</div>}
                                        </div>
                                        <span
                                            className="badge"
                                            style={{
                                                backgroundColor: visit.status === 'rejected' ? RED : (VISIT_STATUS_COLORS[visit.status] ?? '#6c757d'),
                                                color: '#fff',
                                                fontSize: 11,
                                            }}
                                        >
                                            {visit.status === 'rejected' ? 'Négative' : (VISIT_STATUS_LABELS[visit.status] ?? visit.status)}
                                        </span>
                                        <Link
                                            href={route('visits.show', visit.id)}
                                            className="btn btn-sm"
                                            style={{ border: `1px solid ${NAVY}`, color: NAVY, fontSize: 12 }}
                                        >
                                            Voir la fiche →
                                        </Link>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}

            {modalDay && (
                <>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={closeModal} />
                    <div className="modal d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1050 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow">
                                <form onSubmit={submitAppointment}>
                                    <div className="modal-header border-0 pb-0">
                                        <h5 className="modal-title fw-semibold" style={{ color: NAVY }}>Nouveau rendez-vous</h5>
                                        <button type="button" className="btn-close" aria-label="Fermer" onClick={closeModal} />
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label small text-muted mb-1">Date</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                readOnly
                                                value={capitalize(
                                                    new Date(year, month - 1, modalDay).toLocaleDateString('fr-FR', {
                                                        weekday: 'long',
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    }),
                                                )}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small text-muted mb-1">Heure</label>
                                            <input
                                                type="time"
                                                className={`form-control ${form.errors.scheduled_time ? 'is-invalid' : ''}`}
                                                value={form.data.scheduled_time}
                                                onChange={(e) => form.setData('scheduled_time', e.target.value)}
                                            />
                                            {form.errors.scheduled_time && (
                                                <div className="invalid-feedback">{form.errors.scheduled_time}</div>
                                            )}
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label small text-muted mb-1">Client</label>
                                            <select
                                                className={`form-select ${form.errors.client_id ? 'is-invalid' : ''}`}
                                                value={form.data.client_id}
                                                onChange={(e) => form.setData('client_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Sélectionner un client</option>
                                                {clients.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.company_name || c.company_name}
                                                    </option>
                                                ))}
                                            </select>
                                            {form.errors.client_id && (
                                                <div className="invalid-feedback">{form.errors.client_id}</div>
                                            )}
                                        </div>
                                        <div className="mb-0">
                                            <label className="form-label small text-muted mb-1">Objectif</label>
                                            <textarea
                                                className={`form-control ${form.errors.objective ? 'is-invalid' : ''}`}
                                                rows="3"
                                                maxLength={500}
                                                value={form.data.objective}
                                                onChange={(e) => form.setData('objective', e.target.value)}
                                            />
                                            {form.errors.objective && (
                                                <div className="invalid-feedback">{form.errors.objective}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0">
                                        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={closeModal}>
                                            Annuler
                                        </button>
                                        <button type="submit" className="btn btn-sm text-white" style={{ backgroundColor: GREEN }} disabled={form.processing}>
                                            {form.processing ? 'Enregistrement…' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}
            <style>{`
                .planning-filter-btn:hover {
                    background-color: #f0fdf4 !important;
                    border-color: #1FBE7A !important;
                }
                .planning-filter-menu .dropdown-item:hover {
                    background-color: #f0fdf4 !important;
                    color: #13293D !important;
                }
                .planning-filter-menu .dropdown-item.is-active,
                .planning-filter-menu .dropdown-item.is-active:hover {
                    background-color: #1FBE7A !important;
                    color: #fff !important;
                    font-weight: 600;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
