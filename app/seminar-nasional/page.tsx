import { HeroSection } from "@/components/seminar/hero-section"
import { RuangLingkup } from "@/components/seminar/ruang-lingkup"
import PembicaraSection from "@/components/seminar/pembicara"
import { SeminarTimeline } from "@/components/seminar/seminar-timeline"
import { SeminarFAQ } from "@/components/seminar/seminar-faq"
import OurMemories from "@/components/seminar/our-memories"

export default function SeminarNasional() {
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
