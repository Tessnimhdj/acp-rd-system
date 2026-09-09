import { forwardRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { VISIT_STATUS_LABELS, VISIT_STATUS_COLORS } from '@/constants/visitOptions';

const NAVY = '#13293D';
const GREEN = '#1FBE7A';
const BLUE = '#3b82f6';
const ORANGE = '#fd7e14';
const RED = '#dc3545';
const GREY = '#6c757d';

function formatTime(time) {
    if (!time) return '—';
    return String(time).substring(0, 5);
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

function lookupById(map, id) {
    if (!map || id == null) return null;
    return map[id] ?? map[String(id)] ?? null;
}

const DayDetailPanel = forwardRef(function DayDetailPanel({
    selectedDay,
    selectedDateLabel,
    selectedVisits,
    selectedAppointments,
    negativeVisits,
    positiveVisits,
    showTc,
    roles,
    auth,
    canStartVisit,
    isPastOrToday,
    year,
    month,
}, ref) {
    const [refuseFormId, setRefuseFormId] = useState(null);
    const [refusalReason, setRefusalReason] = useState('');
    const selectedRdvs = selectedAppointments;

    return (
        <div ref={ref} className="card border-0 shadow-sm" style={{ borderLeft: `4px solid ${GREEN}` }}>
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
                                    <div>
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
                                                {rdv.status === 'pending' && (
                                                    <span className="badge mt-1" style={{ backgroundColor: '#f59e0b', color: '#fff', fontSize: 11 }}>
                                                         En attente de validation
                                                    </span>
                                                )}
                                                {rdv.status === 'approved' && (
                                                    <span className="badge mt-1" style={{ backgroundColor: GREEN, color: '#fff', fontSize: 11 }}>
                                                        ✅ Validé
                                                    </span>
                                                )}
                                                {rdv.status === 'refused' && (
                                                    <div className="mt-1">
                                                        <span className="badge" style={{ backgroundColor: RED, color: '#fff', fontSize: 11 }}>
                                                            ❌ Refusé
                                                        </span>
                                                        {rdv.refusal_reason && (
                                                            <div className="small text-muted mt-1">Motif : {rdv.refusal_reason}</div>
                                                        )}
                                                    </div>
                                                )}
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
                                            {rdv.status === 'pending' && roles.includes('responsable_commercial') && (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm text-white"
                                                        style={{ backgroundColor: GREEN, fontSize: 12 }}
                                                        onClick={() => router.patch(route('appointments.approve', rdv.id))}
                                                    >
                                                        ✅ Valider
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm text-white"
                                                        style={{ backgroundColor: RED, fontSize: 12 }}
                                                        onClick={() => setRefuseFormId(rdv.id)}
                                                    >
                                                        ❌ Refuser
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        {refuseFormId === rdv.id && rdv.status === 'pending' && roles.includes('responsable_commercial') && (
                                            <div className="mt-3">
                                                <textarea
                                                    className="form-control mb-2"
                                                    rows="3"
                                                    maxLength={500}
                                                    placeholder="Motif du refus"
                                                    value={refusalReason}
                                                    onChange={(e) => setRefusalReason(e.target.value)}
                                                />
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm text-white"
                                                        style={{ backgroundColor: RED, fontSize: 12 }}
                                                        onClick={() => router.patch(
                                                            route('appointments.refuse', rdv.id),
                                                            { refusal_reason: refusalReason },
                                                            { onSuccess: () => { setRefuseFormId(null); setRefusalReason(''); } },
                                                        )}
                                                    >
                                                        Confirmer le refus
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary"
                                                        style={{ fontSize: 12 }}
                                                        onClick={() => setRefuseFormId(null)}
                                                    >
                                                        Annuler
                                                    </button>
                                                </div>
                                            </div>
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
    );
});

export default DayDetailPanel;
