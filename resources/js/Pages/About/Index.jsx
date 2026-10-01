import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const NAVY = '#0E2238';

export default function Index({ auth }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="À propos" />

            <div>
                <section className="pb-5" style={{ paddingTop: '0.5rem' }}>
                   
                    <h1 className="mb-2" style={{ color: NAVY, fontSize: '1.75rem', fontFamily: '"Source Serif 4", Georgia, serif', fontWeight: 600 }}>
                        ACP Solution
                    </h1>
                    <p className="mb-0" style={{ color: '#7EBF9F', fontSize: 16 }}>
                        Systèmes de stabilisation alimentaire
                    </p>
                </section>

                <section className="pt-4">
                    <h2 className="mb-2" style={{ fontSize: 18, fontWeight: 600, color: NAVY }}>
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
