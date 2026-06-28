import { visitToFormData } from '@/constants/visitOptions';
import VisitForm from '@/Components/Visits/VisitForm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const NAVY = '#13293D';
const GREEN = '#1FBE7A';

export default function Edit({ auth, visit, clients }) {
    const { data, setData, put, processing, errors } = useForm(visitToFormData(visit));

    const submit = (e) => {
        e.preventDefault();
        put(route('visits.update', visit.id));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Modifier visite ${visit.visit_number}`} />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 style={{ color: NAVY, fontWeight: 600 }}>
                        Modifier visite N° {String(visit.visit_number).padStart(3, '0')}
                    </h4>
                    <p className="text-muted small mb-0">{visit.client?.company_name ?? '—'}</p>
                </div>
                <Link
                    href={route('visits.show', visit.id)}
                    className="btn btn-sm btn-outline-secondary"
                >
                    ← Retour au détail
                </Link>
            </div>

            <form onSubmit={submit}>
                <VisitForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    visitNumber={visit.visit_number}
                    clients={clients}
                />

                <div className="d-flex gap-2 justify-content-end mb-4">
                    <Link
                        href={route('visits.show', visit.id)}
                        className="btn btn-outline-secondary"
                    >
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn text-white"
                        style={{ backgroundColor: GREEN }}
                    >
                        {processing ? 'Mise à jour…' : 'Mettre à jour'}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
