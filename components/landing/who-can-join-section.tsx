import { GraduationCap, School, Users } from "lucide-react"

const audiences = [
  {
    icon: School,
    label: "Elementary, Junior, Senior High School Students",
  },
  {
    icon: GraduationCap,
    label: "University Students (Bachelor's and Applied Bachelor's)",
  },
  {
    icon: Users,
    label: "General Public",
  },
]

export function WhoCanJoinSection() {
  return (
    <section
      id="who-can-join"
      className="relative overflow-hidden bg-background px-5 pt-8 pb-20 text-slate-950 sm:px-8"
    >
      <div className="absolute left-[-8%] bottom-0 w-[30%] h-[50%] bg-primary/5 blur-[120px] pointer-events-none rounded-[100%]" />

      <div className="relative mx-auto max-w-[82rem] z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance">
            Who can join
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {audiences.map((audience) => {
            const Icon = audience.icon
            return (
              <div
                key={audience.label}
                className="group flex-1 flex flex-col items-center justify-center gap-5 rounded-2xl border border-border/50 bg-white p-10 text-center transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 transition-colors duration-300 group-hover:bg-slate-950 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-lg font-semibold leading-snug tracking-tight text-slate-900">
                  {audience.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
