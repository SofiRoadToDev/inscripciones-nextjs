import LoginForm from '@/components/forms/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
    return (
        <main className="relative min-h-screen w-full flex items-center justify-center p-4">
            {/* Background Image */}
            <div className="absolute inset-0 -z-10 bg-primary-50">
                {/* Placeholder if image gen is still running or fails, but we'll use the generated one */}
                <Image
                    src="/images/admin_login_bg.png"
                    alt="Colegio Background"
                    fill
                    className="object-cover opacity-40 mix-blend-multiply transition-opacity duration-1000"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-50/80 via-transparent to-primary-100/30" />
            </div>

            <div className="w-full flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-24 h-24 mb-2">
                        <Image
                            src="/images/escudo.png"
                            alt="Escudo Oficial"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-display font-display text-primary-900 text-3xl font-bold">EET Nº 3107</h1>
                        <h2 className="text-xl font-medium text-primary-700">Juana Azurduy de Padilla</h2>
                        <p className="text-accent-600 tracking-[0.2em] uppercase text-xs font-black pt-2">Sistema de Inscripciones</p>
                    </div>
                </div>

                <LoginForm />

                <p className="text-primary-500 text-xs font-medium uppercase tracking-wider">
                    &copy; {new Date().getFullYear()} EET Nº 3107 - Juana Azurduy de Padilla
                </p>
            </div>
        </main>
    );
}
