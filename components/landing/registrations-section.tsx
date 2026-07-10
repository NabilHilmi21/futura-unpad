import { RegistrationCards } from "./registration-cards"
import { Calendar, Locate, Sparkles } from "lucide-react"
import { ButtonV2 } from "../ui/button-v2"

const events = [
    {
        title: "Seminar Nasional",
        date: "Sabtu, 7 November 2026",
        location: "Auditorium Unpad",
        description: "Bergabunglah dalam diskusi mendalam mengenai Implementasi Energi Cerdas di Era Industri 5.0. Kami mengundang para ahli untuk membahas optimalisasi Smart Grid dan Energi Baru Terbarukan demi masa depan yang lebih hijau.",
        highlightsTitle: "Key Speakers",
        highlights: [
            "Aditya Cakti C.",
            "Farras Faqih",
        ],
        speaker: "Linus Torvalds",
        image: "https://avatars.githubusercontent.com/u/1024025?v=4",
        href: "/seminar-nasional",
        reverse: false
    },
    {
        title: "Mechatura",
        date: "Minggu, 8 November 2026",
        location: "Gedung PPBS Unpad",
        description: "Kompetisi robotika tingkat nasional yang menantang para inovator muda untuk memecahkan masalah energi melalui teknologi otomasi dan mekatronika. Tunjukkan karya terbaikmu!",
        highlightsTitle: "Kategori Lomba",
        highlights: [
            "Line Follower Analog",
            "Smart IoT Innovation",
        ],
        speaker: "Mechatura Event",
        image: "/green-renewable-1.webp",
        href: "/mechatura",
        reverse: true
    },
    {
        title: "Lomba Essay",
        date: "1 - 31 Oktober 2026",
        location: "Online / Daring",
        description: "Wadahi gagasan kreatif dan solutifmu melalui tulisan. Tema tahun ini berfokus pada inovasi mahasiswa dalam mendukung transisi energi berkelanjutan di Indonesia.",
        highlightsTitle: "Tema Utama",
        highlights: [
            "Inovasi Smart Grid",
            "Pengembangan EBT",
        ],
        speaker: "Lomba Essay",
        image: "https://images.unsplash.com/photo-1455390582262-044cdead27d8?q=80&w=800&auto=format&fit=crop",
        href: "/lomba-essay",
        reverse: false
    }
]

export default function RegistrationsSection() {
    return (
        <section id="registrations" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col justify-center items-center gap-24">
            {events.map((event, index) => (
                <div key={index} className={`flex flex-col lg:items-center gap-10 lg:gap-16 w-full ${event.reverse ? "lg:flex-row-reverse" : "lg:flex-row"}`}>

                    {/* Visual Side */}

                    <RegistrationCards title={event.title} image={event.image} speaker={event.speaker} />

                    {/* Content Side */}
                    <div className="flex flex-col">
                        <div className="flex flex-col gap-4">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">{event.title}</h1>

                            <div className="space-y-2 text-neutral-700 dark:text-neutral-300">
                                <div className="flex gap-3 items-center">
                                    <Calendar className="w-5 h-5 text-blue-500" />
                                    <h2 className="text-md md:text-lg font-medium">{event.date}</h2>
                                </div>
                                <div className="flex gap-3 items-center">
                                    <Locate className="w-5 h-5 text-blue-500" />
                                    <h2 className="text-md md:text-lg font-medium">{event.location}</h2>
                                </div>
                            </div>

                            <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                                {event.description}
                            </p>
                        </div>

                        {/* <div className="bg-neutral-50 dark:bg-neutral-900/40 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800/60 my-2">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-blue-500" />
                                {event.highlightsTitle}
                            </h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {event.highlights.map((highlight, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300 font-medium">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                        {highlight}
                                    </li>
                                ))}
                            </ul>
                        </div> */}

                        <div className="mt-18">
                            <ButtonV2
                                text="Daftar Sekarang"
                                href={event.href}
                            />
                        </div>
                    </div>

                </div>
            ))}
        </section>
    )
}