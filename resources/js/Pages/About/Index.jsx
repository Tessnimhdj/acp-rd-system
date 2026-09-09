import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const NAVY = '#13293D';
const GREEN = '#1FBE7A';
const GREY = '#6c757d';

export default function Index({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="À propos" />

            <div style={{ backgroundColor: '#fff' }}>
                <section className="pb-5" style={{ paddingTop: '0.5rem' }}>
                   
                    <h1 className="fw-bold mb-3" style={{ color: NAVY, fontSize: '2rem' }}>
                        ACP Solution
                    </h1>
                    <p
                        className="mb-0"
                        style={{
                            color: NAVY,
                            fontSize: 16,
                            borderLeft: `3px solid ${GREEN}`,
                            paddingLeft: '0.85rem',
                        }}
                    >
                        Systèmes de stabilisation alimentaire
                    </p>
                </section>

                <section className="pt-2">
                    <h2
                        className="mb-3"
                        style={{
                            fontSize: 14,
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: GREY,
                        }}
                    >
                        Qui sommes-nous
                    </h2>
                    <p
                        className="mb-0"
                        style={{ color: NAVY, fontSize: 16, lineHeight: 1.7, maxWidth: 720 }}
                    >
                        ACP Solution est une société algérienne spécialisée dans l’ingénierie
                        des systèmes de stabilisation alimentaire. Nous travaillons avec les
                        industriels de la transformation agroalimentaire, de la formulation
                        jusqu’à la mise en œuvre en usine. Notre activité couvre plusieurs
                        gammes de produits et secteurs, avec un suivi technique sur le terrain.
                    </p>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
