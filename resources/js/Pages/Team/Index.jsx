import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const NAVY = '#13293D';
const GREEN = '#1FBE7A';

export default function Index({ auth, users }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('team.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Équipe Commerciale" />

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 style={{ color: NAVY, fontWeight: 600 }}>Équipe Commerciale</h4>
                    <p className="text-muted small mb-0">
                        Gestion des mandataires technico-commerciaux
                    </p>
                </div>
            </div>

            <div className="row">
                <div className="col-md-4">
                    <div className="card border-0 shadow-sm mb-4">
                        <div
                            className="card-header border-0 py-3"
                            style={{ backgroundColor: NAVY, color: '#fff' }}
                        >
                            Nouveau Commercial
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label small">Nom complet</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && (
                                        <div className="invalid-feedback">{errors.name}</div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small">Email</label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback">{errors.email}</div>
                                    )}
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small">Mot de passe</label>
                                    <input
                                        type="password"
                                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                        minLength="8"
                                    />
                                    {errors.password && (
                                        <div className="invalid-feedback">{errors.password}</div>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="btn w-100 text-white"
                                    style={{ backgroundColor: GREEN }}
                                    disabled={processing}
                                >
                                    {processing ? 'Création...' : 'Créer Commercial'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="card border-0 shadow-sm">
                        <div
                            className="card-header border-0 py-3"
                            style={{ backgroundColor: NAVY, color: '#fff' }}
                        >
                            Membres de l'équipe
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0">
                                    <thead style={{ backgroundColor: '#f4f6f8' }}>
                                        <tr>
                                            <th>Nom</th>
                                            <th>Email</th>
                                            <th>Rôle</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="text-center text-muted py-4">
                                                    Aucun commercial enregistré.
                                                </td>
                                            </tr>
                                        ) : (
                                            users.map((user) => (
                                                <tr key={user.id}>
                                                    <td className="fw-semibold">{user.name}</td>
                                                    <td className="small">{user.email}</td>
                                                    <td>
                                                        <span
                                                            className="badge"
                                                            style={{
                                                                backgroundColor: GREEN,
                                                                color: NAVY,
                                                            }}
                                                        >
                                                            Commercial
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
