'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-primary-100 text-primary-900 pt-24 pb-12 overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-500/5 -skew-x-12 translate-x-1/2" />

            <div className="container mx-auto px-0 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch border border-primary-900/10 bg-white shadow-2xl overflow-hidden rounded-[2.5rem]">
                    {/* Contact & Branding */}
                    <div className="p-12 lg:p-20 space-y-12">
                        <div className="space-y-6">
                            <h3 className="text-4xl font-display tracking-tight text-primary-950 leading-tight">
                                EET Nº 3107 <br />
                                <span className="text-2xl text-primary-700">Juana Azurduy de Padilla</span>
                            </h3>
                            <p className="text-primary-600 max-w-md leading-relaxed font-medium">
                                Formando técnicos íntegros, con excelencia académica y valores humanos.
                                Un espacio donde cada alumno encuentra su potencial técnico y humano.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400">Contacto</h4>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-4 group cursor-pointer">
                                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-950 group-hover:text-white transition-all text-primary-600">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold">Av. Libertador 1234, CABA</span>
                                    </li>
                                    <li className="flex items-center gap-4 group cursor-pointer">
                                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-950 group-hover:text-white transition-all text-primary-600">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold">+54 11 4455-6677</span>
                                    </li>
                                    <li className="flex items-center gap-4 group cursor-pointer">
                                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-950 group-hover:text-white transition-all text-primary-600">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-bold">info@sanpatricio.edu.ar</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400">Redes Sociales</h4>
                                <div className="flex gap-4">
                                    {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                                        <Link key={i} href="#" className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center hover:bg-primary-950 hover:text-white transition-all active:scale-90 text-primary-600">
                                            <Icon className="w-5 h-5" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Map Section */}
                    <div className="relative min-h-[400px]">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.8473855523293!2d-58.384155!3d-34.603075!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccac693e5063b%3A0xc6bf826ee55e197c!2sTeatro%20Col%C3%B3n!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar"
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'grayscale(0.5) contrast(1.1)' }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="absolute inset-0 w-full h-full"
                        />
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-20 pt-8 border-t border-primary-200 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-widest text-primary-400">
                    <p>© {new Date().getFullYear()} EET Nº 3107 - Juana Azurduy de Padilla. Todos los derechos reservados.</p>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-primary-900 transition-colors">Privacidad</Link>
                        <Link href="#" className="hover:text-primary-900 transition-colors">Términos</Link>
                        <Link href="#" className="hover:text-primary-900 transition-colors">Soporte</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
