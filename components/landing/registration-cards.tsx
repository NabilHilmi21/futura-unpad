import Link from "next/link"

type Program = {
  title: string
  label: string
  description: string
  outcomes: string[]
  href: string
  price: string
  format: string
  timeline: string
  action: string
}

const programs: Program[] = [
  {
    title: "Seminar",
    label: "Listen",
    description:
      "Understand applied technology through talks, examples, and field perspectives.",
    outcomes: ["Industry context", "Practical examples", "Certificate"],
    href: "/registration/seminar",
    price: "Free",
    format: "Open registration",
    timeline: "14 August 2026",
    action: "Register",
  },
  {
    title: "Robotic Competition",
    label: "Build",
    description:
      "Test decisions, iterate quickly, and see how a robot performs under pressure.",
    outcomes: ["Team decisions", "Technical testing", "Prizes"],
    href: "/registration/mechatura",
    price: "Rp 250.000",
    format: "Team entry",
    timeline: "15 August 2026",
    action: "View",
  },
  {
    title: "Research Dissemination",
    label: "Present",
    description:
      "Turn research into a clearer story and get useful feedback from peers.",
    outcomes: ["Research presentation", "Peer feedback", "Academic networking"],
    href: "/registration?program=research-dissemination",
    price: "Rp 150.000",
    format: "Presenter slot",
    timeline: "16 August 2026",
    action: "View",
  },
]

export function RegistrationCards() {
  return (
    <section
      id="programs"
      aria-labelledby="programs-heading"
      className="bg-[#fbfbf8] px-5 py-24 text-slate-950 sm:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-sky-700">
            Tracks
          </p>
          <h2
            id="programs-heading"
            className="font-heading mt-6 text-5xl font-medium leading-[0.96] text-balance sm:text-7xl"
          >
            Choose the way you want to participate.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {programs.map((program) => (
            <article
              key={program.title}
              className="flex min-h-[460px] flex-col justify-between rounded-[8px] border border-slate-200 bg-white p-7"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {program.label}
                </p>
                <h3 className="font-heading mt-5 text-4xl font-medium leading-tight text-slate-950">
                  {program.title}
                </h3>
                <p className="mt-5 text-sm leading-7 text-slate-600">
                  {program.description}
                </p>
              </div>

              <div className="mt-10">
                <p className="text-sm leading-7 text-slate-500">
                  {program.outcomes.join(" / ")}
                </p>
                <dl className="mt-6 grid gap-3 border-t border-slate-100 pt-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Pass</dt>
                    <dd className="font-medium text-slate-800">{program.price}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Format</dt>
                    <dd className="font-medium text-slate-800">{program.format}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-400">Date</dt>
                    <dd className="font-medium text-slate-800">{program.timeline}</dd>
                  </div>
                </dl>
                <Link
                  href={program.href}
                  className="mt-7 inline-flex text-sm font-medium text-sky-700 transition hover:text-slate-950"
                >
                  {program.action}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
