import { useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div
            className="d-flex align-items-center justify-content-center min-vh-100"
            style={{ backgroundColor: '#f4f6f8' }}
        >
            <Head title="Connexion" />

            <div style={{ width: '100%', maxWidth: '420px' }}>
                {/* Logo */}
                <div className="text-center mb-4">
                    <img
                        src="/images/logo-acp.png"
                        alt="ACP Solution"
                        style={{ maxWidth: '220px', width: '100%' }}
                    />
                </div>

                {/* Card */}
                <div className="card border-0 shadow-sm">
                    {/* Bande dégradée en haut de la carte (reprend le logo) */}
                    <div
                        style={{
                            height: '6px',
                            background:
                                'linear-gradient(90deg, #13293D 0%, #0E7C66 50%, #1FBE7A 100%)',
                            borderTopLeftRadius: '0.375rem',
                            borderTopRightRadius: '0.375rem',
                        }}
                    />

                    <div className="card-body p-4 p-md-5">
                        <h5
                            className="text-center mb-1 fw-bold"
                            style={{ color: '#13293D' }}
                        >
                            ACP Solution - Connexion
                        </h5>
                        <p className="text-center text-muted small mb-4">
                            Connectez-vous pour accéder à votre espace
                        </p>

                        {status && (
                            <div className="alert alert-success py-2" role="alert">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            {/* Email */}
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label small fw-semibold">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                {errors.email && (
                                    <div className="invalid-feedback">{errors.email}</div>
                                )}
                            </div>

                            {/* Password */}
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label small fw-semibold">
                                    Mot de passe
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                {errors.password && (
                                    <div className="invalid-feedback">{errors.password}</div>
                                )}
                            </div>

                            {/* Remember me */}
                            <div className="mb-4 form-check">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    className="form-check-input"
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <label htmlFor="remember" className="form-check-label small">
                                    Se souvenir de moi
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="btn w-100 text-white fw-semibold"
                                style={{
                                    background:
                                        'linear-gradient(90deg, #13293D 0%, #0E7C66 100%)',
                                    border: 'none',
                                }}
                                disabled={processing}
                            >
                                Se connecter
                            </button>

                            {canResetPassword && (
                                <div className="text-center mt-3">
                                    <Link
                                        href={route('password.request')}
                                        className="small text-decoration-none text-muted"
                                    >
                                        Mot de passe oublié ?
                                    </Link>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                <p className="text-center text-muted small mt-4 mb-0">
                    © {new Date().getFullYear()} ACP Solution — Usage interne uniquement
                </p>
            </div>
        </div>
    );
}
