import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

const NAVY = '#13293D';
const GREEN = '#1FBE7A';

export default function Index({ auth, clients, canCreate }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        company_name: '',
        sector: '',
        address: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('clients.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Clients" />

            {flash?.success && (
                <div className="alert alert-success py-2">{flash.success}</div>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 style={{ color: NAVY, fontWeight: 600 }}>Clients (Fromageries)</h4>
                    <p className="text-muted small mb-0">
                        Registre centralisé — REF-CLI généré automatiquement
                    </p>
                </div>
            </div>

            {canCreate && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white fw-semibold">Nouveau client</div>
                    <div className="card-body">
                        <form onSubmit={submit}>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label small fw-semibold">
                                        Entreprise / Raison sociale <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.company_name ? 'is-invalid' : ''}`}
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                    />
                                    {errors.company_name && (
                                        <div className="invalid-feedback">{errors.company_name}</div>
                                    )}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-semibold">Secteur</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={data.sector}
                                        onChange={(e) => setData('sector', e.target.value)}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-semibold">Adresse</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="mt-3">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn btn-sm text-white"
                                    style={{ backgroundColor: GREEN }}
                                >
                                    {processing ? 'Enregistrement…' : 'Ajouter le client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead style={{ backgroundColor: '#f4f6f8' }}>
                            <tr>
                                <th>REF-CLI</th>
                                <th>Entreprise</th>
                                <th>Secteur</th>
                                <th>Adresse</th>
                                <th>Visites</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted py-5">
                                        Aucun client enregistré.
                                    </td>
                                </tr>
                            ) : (
                                clients.map((client) => (
                                    <tr key={client.id}>
                                        <td className="fw-semibold">{client.ref_cli}</td>
                                        <td>{client.company_name}</td>
                                        <td>{client.sector || '—'}</td>
                                        <td className="small">{client.address || '—'}</td>
                                        <td>
                                            <span className="badge bg-light text-dark border">
                                                {client.visits_count ?? 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
