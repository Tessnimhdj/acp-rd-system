import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ROLE_LABELS } from '@/constants/visitOptions';
import { Head, router, useForm, usePage } from '@inertiajs/react';

const NAVY = '#13293D';
const GREEN = '#1FBE7A';

export default function Index({ auth, users, roles }) {
    const { flash, errors: pageErrors } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'commercial',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => reset('name', 'email', 'password'),
        });
    };

    const updateRole = (userId, role) => {
        router.patch(route('admin.users.update-role', userId), { role });
    };

    const destroyUser = (userId, name) => {
        if (confirm(`Supprimer l'utilisateur « ${name} » ?`)) {
            router.delete(route('admin.users.destroy', userId));
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Gestion des utilisateurs" />

            {flash?.success && (
                <div className="alert alert-success py-2">{flash.success}</div>
            )}
            {pageErrors?.role && (
                <div className="alert alert-danger py-2">{pageErrors.role}</div>
            )}
            {pageErrors?.user && (
                <div className="alert alert-danger py-2">{pageErrors.user}</div>
            )}

            <div className="mb-4">
                <h4 style={{ color: NAVY, fontWeight: 600 }}>Gestion des utilisateurs</h4>
                <p className="text-muted small mb-0">
                    Seul l&apos;administrateur peut créer des comptes et assigner les rôles.
                </p>
            </div>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white fw-semibold">Nouveau compte</div>
                <div className="card-body">
                    <form onSubmit={submit}>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">Nom</label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">Email</label>
                                <input
                                    type="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">Mot de passe</label>
                                <input
                                    type="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-semibold">Rôle</label>
                                <select
                                    className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                >
                                    {roles.map((role) => (
                                        <option key={role} value={role}>
                                            {ROLE_LABELS[role] ?? role}
                                        </option>
                                    ))}
                                </select>
                                {errors.role && <div className="invalid-feedback">{errors.role}</div>}
                            </div>
                        </div>
                        <div className="mt-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="btn btn-sm text-white"
                                style={{ backgroundColor: GREEN }}
                            >
                                {processing ? 'Création…' : 'Créer le compte'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead style={{ backgroundColor: '#f4f6f8' }}>
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Rôle</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td className="small">{user.email}</td>
                                    <td>
                                        <select
                                            className="form-select form-select-sm"
                                            style={{ maxWidth: '200px' }}
                                            value={user.roles[0] ?? ''}
                                            onChange={(e) => updateRole(user.id, e.target.value)}
                                            disabled={user.id === auth.user.id}
                                        >
                                            {roles.map((role) => (
                                                <option key={role} value={role}>
                                                    {ROLE_LABELS[role] ?? role}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="text-end">
                                        {user.id !== auth.user.id && (
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => destroyUser(user.id, user.name)}
                                            >
                                                Supprimer
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
