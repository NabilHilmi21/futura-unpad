import { Bot, Lightbulb, Award, Target } from "lucide-react"

const reasons = [
  { icon: Bot, title: "National Robotics Competition", },
  { icon: Lightbulb, title: "National Seminar Centered on Energy", },
  { icon: Award, title: "Participation Certificates and many more benefits", },
  { icon: Target, title: "Up to Date Competition Standards", },
]

export function ReasonToJoinSection() {
  return (
    <section
      id="reason-to-join"
      className="relative overflow-hidden bg-background px-5 pt-20 pb-8 text-slate-950 sm:px-8"
    >
      <div className="absolute right-[-5%] top-0 w-[35%] h-[50%] bg-primary/5 blur-[120px] pointer-events-none rounded-[100%]" />

      <div className="relative mx-auto max-w-[82rem] z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-balance">
            Reason to Join
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason) => {
            const Icon = reason.icon
            return (
              <div
                key={reason.title}
                className="group flex flex-col items-center gap-5 rounded-2xl border border-border/50 bg-white/80 backdrop-blur-sm p-8 text-center transition-all duration-300 hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold leading-snug tracking-tight text-slate-900">
                  {reason.title}
                </h3>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
