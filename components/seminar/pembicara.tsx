import { PembicaraCards } from "../ui/pembicara-cards"

const pembicaraSectionStyles = {
    section:
        "relative overflow-hidden bg-neutral-950 px-4 py-20 text-white sm:px-6 lg:px-8",
    grid:
        "pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:48px_48px] opacity-35",
    glow:
        "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/70 to-transparent",
    title:
        "mb-16 text-center font-bold tracking-tight text-white text-4xl sm:text-5xl lg:text-6xl",
} as const

export default function PembicaraSection() {
    return (
        <section className={pembicaraSectionStyles.section}>

            <h1 className={pembicaraSectionStyles.title}>Meet our speaker</h1>
            <PembicaraCards />

        </section>
    )
}
