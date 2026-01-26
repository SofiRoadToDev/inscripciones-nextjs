'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
    Users,
    CreditCard,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    GraduationCap,
    UserCog
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { logoutAction } from '@/lib/actions/auth.actions';

const navigation = [
    { name: 'Inscripciones', href: '/admin', icon: Users },
    { name: 'Tesorería', href: '/admin/tesoreria', icon: CreditCard },
    { name: 'Reportes', href: '/admin/reportes', icon: BarChart3 },
    { name: 'Preceptores', href: '/admin/preceptores', icon: UserCog },
    { name: 'Configuración', href: '/admin/config', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // No render layout on login page
    if (pathname === '/admin/login') return <>{children}</>;

    return (
        <div className="min-h-screen bg-neutral-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-primary-900/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-72 bg-white border-r border-primary-100 z-50 transition-transform duration-300 lg:relative lg:translate-x-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    <div className="p-8">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <Image
                                    src="/images/escudo.png"
                                    alt="Escudo Oficial"
                                    width={48}
                                    height={48}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div>
                                <h1 className="font-display text-lg text-primary-900 leading-none font-bold">EET Nº 3107</h1>
                                <p className="text-[9px] tracking-widest text-accent-600 uppercase font-black mt-1">Admin Panel</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                        isActive
                                            ? "bg-primary-50 text-primary-900 shadow-sm"
                                            : "text-primary-600 hover:bg-neutral-50 hover:text-primary-900"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "w-5 h-5",
                                        isActive ? "text-primary-500" : "text-primary-400 group-hover:text-primary-500"
                                    )} />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 mt-auto border-t border-primary-50">
                        <form action={logoutAction}>
                            <button
                                type="submit"
                                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-medium">Cerrar Sesión</span>
                            </button>
                        </form>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-20 bg-white border-b border-primary-100 flex items-center justify-between px-8 sticky top-0 z-30">
                    <button
                        className="lg:hidden p-2 text-primary-600"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="ml-auto flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-primary-900">Admin Usuario</p>
                            <p className="text-xs text-primary-500">Administrador General</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center text-primary-600 font-bold">
                            A
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-8">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
