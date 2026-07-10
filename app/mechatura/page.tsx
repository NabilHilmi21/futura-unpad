import { HeroSection } from "@/components/mechatura/hero-section";
import OurMemories from "@/components/seminar/our-memories";
import { RuangLingkup } from "@/components/seminar/ruang-lingkup";
import PembicaraSection from "@/components/seminar/pembicara";
import { SeminarTimeline } from "@/components/seminar/seminar-timeline";
import { SeminarFAQ } from "@/components/seminar/seminar-faq";

export default function Mechatura() {
    // INI MASIH PAKE COMPONENT DARI SEMINAR
    return (
        <main className="space-y-36">
            <HeroSection />
            <OurMemories />
            <RuangLingkup />
            <SeminarTimeline />
            {/* <PembicaraSection /> */}
            <SeminarFAQ />
        </main>
    )
}