const points = [
  "Talks give context before the hype arrives.",
  "Competition turns theory into tradeoffs.",
  "Research sessions make early ideas easier to discuss.",
  "Participants leave with a certificate, a story, or a sharper next step.",
]

export function EventOverviewSection() {
  return (
    <section aria-labelledby="overview-heading" className="bg-[#fbfbf8] px-5 py-24 text-slate-950 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-sky-700">
            Why it exists
          </p>
          <h2
            id="overview-heading"
            className="font-heading mt-6 text-5xl font-medium leading-[0.96] text-balance sm:text-7xl"
          >
            Better technical instincts, without the noise.
          </h2>
        </div>

        <div className="grid gap-5">
          {points.map((point) => (
            <p
              key={point}
              className="rounded-[8px] border border-slate-200 bg-white/70 p-5 text-sm leading-7 text-slate-600"
            >
              {point}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
