import { forwardRef } from 'react';

const NAVY = '#13293D';
const GREEN = '#1FBE7A';
const BLUE = '#3b82f6';
const ORANGE = '#fd7e14';
const RED = '#dc3545';
const GREY = '#6c757d';

const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

function itemsForDay(map, day) {
    if (!map || Array.isArray(map)) return [];
    return map[day] ?? map[String(day)] ?? [];
}

function truncate(str, max = 14) {
    if (!str) return '—';
    return str.length > max ? `${str.substring(0, max)}…` : str;
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

function appointmentTc(appointment) {
    return appointment?.user?.name || appointment?.tc || '';
}

function tcInitial(name) {
    if (!name) return '';
    return name.trim().charAt(0).toUpperCase();
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

const CalendarGrid = forwardRef(function CalendarGrid({
    cells,
    visitsByDay,
    appointmentsByDay,
    selectedDay,
    setSelectedDay,
    month,
    year,
    negativeVisits,
    positiveVisits,
    statusFilter,
    roles,
    auth,
    canOpenAppointmentModal,
    setModalDay,
    isCurrentMonth,
    todayDay,
}, ref) {
    const showTc = roles.includes('admin') || roles.includes('responsable_commercial');
    const isFuture = (day) => toDate(year, month, day) > todayStart();

    return (
        <div ref={ref} className="card border-0 shadow-sm mb-3" style={{ overflow: 'hidden' }}>
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
                                    setModalDay(null);
                                    setSelectedDay(isSelected ? null : day);
                                    return;
                                }
                                if (canOpenModal) {
                                    setSelectedDay(null);
                                    setModalDay(day);
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
    );
});

export default CalendarGrid;
