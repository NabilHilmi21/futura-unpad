import Link from "next/link"

const facts = [
  ["Date", "14-16 August 2026"],
  ["Place", "Telkom University"],
  ["Tracks", "Seminar, robotics, research"],
]

export function HeroSection() {
  return (
    <section id="home" className="bg-[#fbfbf8] text-slate-950">
      <div className="mx-auto grid min-h-[calc(100svh-65px)] max-w-6xl content-center gap-16 px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-sky-700">
            Futura 2026
          </p>
          <h1 className="font-heading mt-8 text-6xl font-medium leading-[0.92] text-balance sm:text-8xl lg:text-9xl">
            A small space to learn what moves next.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-slate-600">
            Join a university technology event shaped around talks, prototypes,
            research, and the useful questions that happen between them.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm font-medium">
            <Link
              href="/registration"
              className="rounded-full bg-slate-950 px-5 py-3 text-white transition hover:bg-slate-700"
            >
              Register now
            </Link>
            <Link
              href="#programs"
              className="rounded-full border border-slate-200 px-5 py-3 text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
            >
              Explore tracks
            </Link>
          </div>
        </div>

        <dl className="mx-auto grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {facts.map(([label, value]) => (
            <div key={label} className="rounded-[8px] border border-slate-200 bg-white/70 p-5">
              <dt className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                {label}
              </dt>
              <dd className="mt-3 text-sm font-medium text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
