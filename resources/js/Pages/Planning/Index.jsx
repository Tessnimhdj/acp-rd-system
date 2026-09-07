/**
 * Planning/Index.jsx
 * Calendrier mensuel — visites + rendez-vous
 * Navy #13293D · Green #1FBE7A
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import CalendarGrid from '@/Components/Planning/CalendarGrid';
import DayDetailPanel from '@/Components/Planning/DayDetailPanel';
import AppointmentModal from '@/Components/Planning/AppointmentModal';
import PlanningFilters from '@/Components/Planning/PlanningFilters';

const NAVY = '#13293D';

function itemsForDay(map, day) {
    if (!map || Array.isArray(map)) return [];
    return map[day] ?? map[String(day)] ?? [];
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
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

export default function Index({
    auth,
    visitsByDay = {},
    appointmentsByDay = {},
    month,
    year,
    monthName,
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

    const isPastOrToday = (day) => toDate(year, month, day) <= todayStart();

    const closeModal = () => {
        setModalDay(null);
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

            <PlanningFilters
                teamMembers={teamMembers}
                selectedTc={selectedTc}
                statusFilter={statusFilter}
                showTc={showTc}
                showStatusFilter={showStatusFilter}
                month={month}
                year={year}
                openFilter={openFilter}
                setOpenFilter={setOpenFilter}
            />

            <CalendarGrid
                ref={calendarRef}
                cells={cells}
                visitsByDay={visitsByDay}
                appointmentsByDay={appointmentsByDay}
                selectedDay={selectedDay}
                setSelectedDay={setSelectedDay}
                month={month}
                year={year}
                negativeVisits={negativeVisits}
                positiveVisits={positiveVisits}
                statusFilter={statusFilter}
                roles={roles}
                auth={auth}
                canOpenAppointmentModal={canOpenAppointmentModal}
                setModalDay={setModalDay}
                isCurrentMonth={isCurrentMonth}
                todayDay={todayDay}
            />

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
                <DayDetailPanel
                    ref={panelRef}
                    selectedDay={selectedDay}
                    selectedDateLabel={selectedDateLabel}
                    selectedVisits={selectedVisits}
                    selectedAppointments={selectedRdvs}
                    negativeVisits={negativeVisits}
                    positiveVisits={positiveVisits}
                    showTc={showTc}
                    roles={roles}
                    auth={auth}
                    canStartVisit={canStartVisit}
                    isPastOrToday={isPastOrToday}
                    year={year}
                    month={month}
                />
            )}

            {modalDay && (
                <AppointmentModal
                    modalDay={modalDay}
                    setModalDay={setModalDay}
                    year={year}
                    month={month}
                    clients={clients}
                />
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
