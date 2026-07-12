import { HeroSection } from "@/components/seminar/hero-section"
import { RuangLingkup } from "@/components/seminar/ruang-lingkup"
import { SeminarTimeline } from "@/components/seminar/seminar-timeline"
import { SeminarFAQ } from "@/components/seminar/seminar-faq"
import OurMemories from "@/components/seminar/our-memories"
import PembicaraSeminarPleno from "@/components/seminar/pembicara-seminar-pleno"
import PembicaraTalkshow from "@/components/seminar/pembicara-talk-show"
import Location from "@/components/ui/location"

export default function SeminarNasional() {
    return (
        <main className="space-y-36">
            <HeroSection />
            <OurMemories />
            <RuangLingkup />
            <SeminarTimeline />
            <PembicaraSeminarPleno />
            <PembicaraTalkshow />
            <Location
                id="lokasi"
                title="Temukan Kami"
                location="Aula Graha Sanusi Hardjadinata, Universitas Padjadjaran"
                mapSrc="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9848904239084!2d107.6144918749962!3d-6.8924101931067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6ff3218aacd%3A0xce249fca022b09c4!2sGraha%20Sanusi%20Hardjadinata!5e0!3m2!1sen!2sid!4v1783634649226!5m2!1sen!2sid"
            />
            <SeminarFAQ />
        </main>
    )
}
