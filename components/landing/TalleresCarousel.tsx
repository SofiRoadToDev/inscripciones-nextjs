'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TallerCard from './TallerCard';
import { Button } from '@/components/ui/button';

const TALLERES = [
    { id: 1, title: 'Artes Plásticas', image: '/images/workshop-1.png' },
    { id: 2, title: 'Robótica Educativa', image: '/images/workshop-2.png' },
    { id: 3, title: 'Iniciación Musical', image: '/images/section-1.png' },
    { id: 4, title: 'Club de Deportes', image: '/images/section-2.png' },
    { id: 5, title: 'Programación IT', image: '/images/hero.png' },
];

export default function TalleresCarousel() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current: container } = scrollRef;
            const scrollAmount = 400;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="py-24 bg-primary-50/50 overflow-hidden">
            <div className="container mx-auto px-6">
                {/* Header with Navigation */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                    <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-400 block ml-1">
                            Extracurricular
                        </span>
                        <h2 className="text-4xl md:text-5xl font-display text-primary-950 tracking-tight leading-none">
                            Talleres de Formación
                        </h2>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scroll('left')}
                            className="w-14 h-14 rounded-full border-primary-100 hover:bg-white hover:text-primary-900 transition-all shadow-sm active:scale-90"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => scroll('right')}
                            className="w-14 h-14 rounded-full border-primary-100 hover:bg-white hover:text-primary-900 transition-all shadow-sm active:scale-90"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                {/* Carousel Container */}
                <div
                    ref={scrollRef}
                    className="flex gap-12 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {TALLERES.map((taller) => (
                        <div key={taller.id} className="snap-center shrink-0">
                            <TallerCard
                                title={taller.title}
                                image={taller.image}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
}
