'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
    return (
        <section className="relative h-screen min-h-[700px] w-full flex items-center justify-center overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10s] hover:scale-110"
                style={{ backgroundImage: "url('/images/hero.png')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-primary-950/40 via-primary-900/40 to-primary-950/80" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-6 text-center">
                <div className="inline-block px-4 py-1.5 mb-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 animate-in fade-in slide-in-from-top-4 duration-700">
                    <span className="text-white text-xs font-black uppercase tracking-[0.2em]">Ciclo Lectivo 2026</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-display text-white mb-8 tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    Forjando el <br />
                    <span>Futuro Hoy.</span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg md:text-xl text-primary-50/80 mb-12 font-medium leading-relaxed animate-in fade-in zoom-in-95 duration-1000 delay-300">
                    Excelencia académica, formación integral y valores que trascienden.
                    Inicie el camino hacia el éxito institucional de sus hijos.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                    <Link href="/inscripcion">
                        <Button size="lg" className="h-16 px-10 bg-white text-primary-950 hover:bg-primary-50 rounded-2xl text-base font-bold shadow-2xl hover:shadow-white/20 transition-all active:scale-95 group">
                            INICIAR INSCRIPCIÓN
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                <div className="w-6 h-10 rounded-full border-2 border-white flex justify-center p-1">
                    <div className="w-1.5 h-3 bg-white rounded-full" />
                </div>
            </div>
        </section>
    );
}
