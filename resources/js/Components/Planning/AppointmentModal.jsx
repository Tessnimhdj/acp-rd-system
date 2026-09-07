import { useForm } from '@inertiajs/react';

const NAVY = '#13293D';
const GREEN = '#1FBE7A';

function pad2(n) {
    return String(n).padStart(2, '0');
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function AppointmentModal({
    modalDay,
    setModalDay,
    year,
    month,
    clients,
    onSuccess,
}) {
    const form = useForm({
        client_id: '',
        scheduled_date: `${year}-${pad2(month)}-${pad2(modalDay)}`,
        scheduled_time: '',
        objective: '',
    });

    const closeModal = () => {
        setModalDay(null);
        form.reset();
        form.clearErrors();
    };

    const submitAppointment = (e) => {
        e.preventDefault();
        form.post(route('appointments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
                onSuccess?.();
            },
        });
    };

    return (
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
    );
}
