import VisitForm from '@/Components/Visits/VisitForm';
import { emptyVisitForm } from '@/constants/visitOptions';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const NAVY = '#13293D';
const GREEN = '#1FBE7A';

export default function Create({ auth, nextVisitNumber, clients }) {
    const { data, setData, post, processing, errors } = useForm(emptyVisitForm());

    const submit = (e) => {
        e.preventDefault();
        post(route('visits.store'));
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nouvelle visite" />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 style={{ color: NAVY, fontWeight: 600 }}>Nouvelle visite</h4>
                    <p className="text-muted small mb-0">
                        Stabilisants &amp; Fonctionnalités Fromagères
                    </p>
                </div>
                <Link href={route('visits.index')} className="btn btn-sm btn-outline-secondary">
                    ← Retour à la liste
                </Link>
            </div>

            <form onSubmit={submit}>
                <VisitForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    visitNumber={nextVisitNumber}
                    clients={clients}
                />

                <div className="d-flex gap-2 justify-content-end mb-4">
                    <Link href={route('visits.index')} className="btn btn-outline-secondary">
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="btn text-white"
                        style={{ backgroundColor: GREEN }}
                    >
                        {processing ? 'Enregistrement…' : 'Enregistrer la visite'}
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
