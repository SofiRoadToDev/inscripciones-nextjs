'use client';

import Image from 'next/image';

interface Props {
    title: string;
    image: string;
}

export default function TallerCard({ title, image }: Props) {
    return (
        <div className="flex flex-col items-center gap-6 group cursor-pointer transition-all duration-500">
            {/* Circular Image Frame */}
            <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-2 border-primary-900 shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-700">
                <Image
                    src={image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                    sizes="(max-width: 768px) 192px, 224px"
                />
                {/* Decorative Inner Ring */}
                <div className="absolute inset-0 border-2 border-white/20 rounded-full pointer-events-none" />
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-display text-primary-950 tracking-tight group-hover:text-primary-600 transition-colors duration-300">
                {title}
            </h3>

            {/* Subtle indicator */}
            <div className="w-8 h-1 bg-primary-100 rounded-full group-hover:w-16 group-hover:bg-primary-500 transition-all duration-500" />
        </div>
    );
}
