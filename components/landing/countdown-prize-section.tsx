"use client"

import { useEffect, useState } from "react"

const TARGET_DATE = new Date("2026-07-20T00:00:00+07:00").getTime()

function calculateTimeLeft() {
  const now = Date.now()
  const difference = TARGET_DATE - now

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

const timeBlocks: { key: keyof ReturnType<typeof calculateTimeLeft>; label: string }[] = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
]

export function CountdownPrizeSection() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section
      id="countdown"
      className="relative bg-[#fbfbf8] px-5 py-24 text-slate-950 sm:px-8 overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/5 blur-[140px] pointer-events-none rounded-[100%]" />

      <div className="relative mx-auto max-w-4xl z-10">
        {/* Countdown Timer */}
        <div className="flex items-center justify-center gap-3 sm:gap-5">
          {timeBlocks.map((block, index) => (
            <div key={block.key} className="flex items-center gap-3 sm:gap-5">
              <div className="flex flex-col items-center">
                <div className="flex h-20 w-20 sm:h-28 sm:w-28 lg:h-32 lg:w-32 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-950/20 transition-transform duration-300 hover:scale-105">
                  <span className="text-3xl sm:text-5xl lg:text-6xl font-bold tabular-nums tracking-tight">
                    {hasMounted
                      ? String(timeLeft[block.key]).padStart(2, "0")
                      : "--"}
                  </span>
                </div>
                <span className="mt-3 text-xs sm:text-sm font-semibold uppercase tracking-widest text-slate-500">
                  {block.label}
                </span>
              </div>

              {/* Separator colon — not after last block */}
              {index < timeBlocks.length - 1 && (
                <span className="text-2xl sm:text-4xl font-bold text-slate-300 -mt-6 sm:-mt-8 animate-countdown-pulse">
                  :
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Prize Text */}
        <div className="mt-16 text-center">
          <p className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tighter leading-tight text-slate-950">
            Win a total prize of
          </p>
          <div className="mt-4 inline-block relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/20 via-yellow-300/30 to-amber-400/20 blur-xl rounded-2xl" />
            <div className="relative rounded-2xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-50 px-8 py-5 sm:px-12 sm:py-6 shadow-lg shadow-amber-500/10">
              <span className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent animate-prize-shine bg-[length:200%_auto]">
                IDR 20.000.000
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
