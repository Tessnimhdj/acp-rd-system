import { forwardRef } from 'react';

const NAVY = '#0E2238';
const GREEN = '#00A86B';
const BLUE = '#3b82f6';
const ORANGE = '#fd7e14';
const RED = '#dc3545';
const GREY = '#6c757d';

const DAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

function itemsForDay(map, day) {
    if (!map || Array.isArray(map)) return [];
    return map[day] ?? map[String(day)] ?? [];
}

function appointmentsForDay(appointmentsByDay, day) {
    if (!appointmentsByDay) return [];
    return appointmentsByDay[day]
        ?? appointmentsByDay[String(day)]
        ?? [];
}

function truncate(str, max = 14) {
    if (!str) return '—';
    return str.length > max ? `${str.substring(0, max)}…` : str;
}

function toDate(year, month, day) {
    return new Date(year, month - 1, day);
}

function todayStart() {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function rdvColor(appointment, year, month, day) {
    // pending → yellow #EAB308
    if (appointment.status === 'pending') return '#EAB308';
    // refused → grey #6c757d (annulé par le responsable)
    if (appointment.status === 'refused') return GREY;
    if (appointment.status === 'completed' && appointment.negative_id) return RED;
    if (appointment.status === 'completed' && appointment.visit_id) return GREEN;
    if (appointment.status === 'planned' || appointment.status === 'approved') {
        const cellTime = toDate(year, month, day).getTime();
        const todayTime = todayStart().getTime();
        if (cellTime === todayTime) return ORANGE;
        if (cellTime > todayTime) return BLUE;
        return RED;
    }
    return '#7EBF9F';
}

function visitColor(visit) {
    return visit.status === 'rejected' ? RED : GREEN;
}

function clientName(client) {
    if (!client) return '—';
    if (typeof client === 'string') return client;
    return client.company_name || '—';
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
    statusFilter,
    roles,
    canBookOnDay = () => false,
    setModalDay,
    isCurrentMonth,
    todayDay,
}, ref) {
    const showTc = roles.includes('admin') || roles.includes('responsable_commercial');

    return (
        <>
        <div ref={ref} className="card border bg-white mb-3" style={{ overflow: 'hidden' }}>
            <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {DAYS.map((label, i) => (
                    <div
                        key={label}
                        className="text-center py-2 small fw-semibold"
                        style={{
                            backgroundColor: '#F3FBF7',
                            color: i >= 5 ? '#A8D5C0' : '#0E2238',
                            borderBottom: '1px solid #D5F0E3',
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
                                style={{ minHeight: 72, backgroundColor: '#F3FBF7', border: '1px solid #D5F0E3' }}
                            />
                        );
                    }

                    const rdvs = appointmentsForDay(appointmentsByDay, day);
                    const visits = statusFilter === 'all'
                        ? itemsForDay(visitsByDay, day).filter(
                            (v) => !v.appointment_id && !rdvs.some((a) => Number(a.visit_id) === Number(v.id)),
                        )
                        : [];
                    const hasData = visits.length > 0 || rdvs.length > 0;
                    const isToday = isCurrentMonth && day === todayDay;
                    const isSelected = selectedDay === day;
                    const isWeekend = index % 7 >= 5;
                    const canOpenModal = !hasData && canBookOnDay(day);
                    const clickable = hasData || canOpenModal;

                    const uniqueTcs = new Set(rdvs.map(appointmentTc).filter(Boolean));
                    const showTcBadge = showTc && uniqueTcs.size > 1;

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
                                border: '1px solid #D5F0E3',
                                cursor: clickable ? 'pointer' : 'default',
                                backgroundColor: isSelected ? '#E8F6EF' : isWeekend ? '#F3FBF7' : '#FFFFFF',
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
                                    color: isToday ? GREEN : isWeekend ? '#A8D5C0' : '#0E2238',
                                    backgroundColor: isToday ? '#E8F6EF' : 'transparent',
                                }}
                            >
                                {day}
                            </div>
                            {hasData && (
                                <div className="mt-1 d-flex flex-wrap gap-1 align-items-center">
                                    {rdvs.map((rdv) => (
                                        <span
                                            key={rdv.id}
                                            style={{
                                                width: 11,
                                                height: 11,
                                                borderRadius: '50%',
                                                backgroundColor: rdvColor(rdv, year, month, day),
                                                display: 'inline-block',
                                            }}
                                        />
                                    ))}
                                    {visits.map((visit) => (
                                        <span
                                            key={`v${visit.id}`}
                                            style={{
                                                width: 11,
                                                height: 11,
                                                borderRadius: '50%',
                                                backgroundColor: visitColor(visit),
                                                display: 'inline-block',
                                            }}
                                        />
                                    ))}
                                    {showTcBadge && (
                                        <span style={{ fontSize: 9, color: '#0E2238', fontWeight: 600 }}>
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
                { color: '#00A86B', label: 'RDV passé abouti' },
                { color: '#dc3545', label: 'RDV passé non abouti' },
                { color: '#EAB308', label: 'En attente de validation' },
                { color: '#6c757d', label: 'Annulé par le responsable' },
            ].map((item) => (
                <div key={item.label} className="d-flex align-items-center gap-2">
                    <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.color, display: 'inline-block' }} />
                    <span style={{ fontSize: 12, color: item.label === 'Annulé par le responsable' ? '#6c757d' : '#0E2238' }}>{item.label}</span>
                </div>
            ))}
        </div>
        </>
    );
});

export default CalendarGrid;
