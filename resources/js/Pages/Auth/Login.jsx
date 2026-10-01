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
        <div className="login-page">
            <Head title="Connexion" />

            <div className="login-box">
                <img src="/images/logo-acp.png" alt="ACP Solution" />

                <h1>Connexion</h1>

                {status && (
                    <div className="alert alert-success py-2" role="alert">
                        {status}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
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

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
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

                    <div className="mb-3 form-check">
                        <input
                            type="checkbox"
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            className="form-check-input"
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <label htmlFor="remember" className="form-check-label">
                            Rester connecté
                        </label>
                    </div>

                    <button type="submit" disabled={processing}>
                        Entrer
                    </button>

                    {canResetPassword && (
                        <div className="mt-3">
                            <Link
                                href={route('password.request')}
                                className="small text-decoration-none"
                                style={{ color: '#6f675f' }}
                            >
                                Mot de passe oublié
                            </Link>
                        </div>
                    )}
                </form>

                <p className="login-note">Usage interne — ACP Solution</p>
            </div>
        </div>
    );
}
