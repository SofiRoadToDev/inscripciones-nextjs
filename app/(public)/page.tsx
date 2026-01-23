import Hero from '@/components/landing/Hero';
import SideSection from '@/components/landing/SideSection';
import TalleresCarousel from '@/components/landing/TalleresCarousel';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
    return (
        <main className="min-h-screen">
            {/* Hero Section */}
            <Hero />

            {/* About Section (Image Right) */}
            <SideSection
                id="nosotros"
                subtitle="Institución"
                title="Excelencia Técnica que inspira el mañana."
                description="Como Escuela de Educación Técnica Nº 3107, combinamos la formación técnica profesional con las metodologías más innovadoras del siglo XXI. Nuestro compromiso es brindar una educación de vanguardia centrada en el desarrollo de capacidades tecnológicas y humanas."
                image="/images/section-1.png"
            />



            {/* Activities Section (Image Left) */}
            <SideSection
                subtitle="Vida Escolar"
                title="Mucho más que un aula."
                description="Creemos en la formación integral. Desde deportes de alto nivel hasta laboratorios de ciencia y artes creativas, nuestros alumnos disponen de los mejores espacios y recursos para descubrir y potenciar sus talentos únicos."
                image="/images/section-2.png"
                reverse
            />
            {/* Talleres Section */}
            <TalleresCarousel />
            {/* Footer Section */}
            <Footer />
        </main>
    );
}
