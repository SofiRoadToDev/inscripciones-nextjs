'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Props {
    title: string;
    subtitle?: string;
    description: string;
    image: string;
    reverse?: boolean;
    id?: string;
}

export default function SideSection({ title, subtitle, description, image, reverse, id }: Props) {
    return (
        <section id={id} className="py-24 md:py-32 overflow-hidden bg-white">
            <div className="container mx-auto px-6">
                <div className={cn(
                    "flex flex-col lg:flex-row items-center gap-16 lg:gap-24",
                    reverse && "lg:flex-row-reverse"
                )}>
                    {/* Text Column */}
                    <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="space-y-4">
                            {subtitle && (
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 block ml-1">
                                    {subtitle}
                                </span>
                            )}
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display text-primary-950 tracking-tight leading-[1.1]">
                                {title}
                            </h2>
                        </div>

                        <p className="text-lg md:text-xl text-primary-800/70 leading-relaxed font-medium">
                            {description}
                        </p>

                        <div className="pt-4 flex items-center gap-4">
                            <div className="h-0.5 w-12 bg-primary-200" />
                            <span className="text-sm font-bold text-primary-900 uppercase italic">Formando Líderes</span>
                        </div>
                    </div>

                    {/* Image Column */}
                    <div className="flex-1 relative w-full aspect-[4/3] group animate-in fade-in zoom-in-95 duration-1000">
                        {/* Decorative Background */}
                        <div className={cn(
                            "absolute -inset-4 bg-primary-100/50 rounded-[3rem] -z-10 transition-transform duration-700 group-hover:scale-105",
                            reverse ? "rotate-2" : "-rotate-2"
                        )} />

                        <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                            <Image
                                src={image}
                                alt={title}
                                fill
                                className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            {/* Glass Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>


                    </div>
                </div>
            </div>
        </section>
    );
}
