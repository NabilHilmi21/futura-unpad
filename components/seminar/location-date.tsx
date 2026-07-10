import { Calendar, Locate } from "lucide-react"
import Countdown from "../countdown"
import { TARGET_DATE } from "@/lib/landing/helper"
export default function LocationDate(){
    return (
        <section className="flex flex-col space-y-8 mx-auto min-h-[calc(100svh-65px)] flex justify-center items-center px-5 py-20 sm:px-8 lg:py-28 z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Get Ready!</h1>
            <div className="flex gap-10 space-y-4 w-fit p-6 rounded-2xl">
                <div>
                    <span className="flex text-sm items-center gap-1 text-stone-400">
                        <Calendar size={16}/>Tanggal
                    </span>
                    <p className="text-lg font-semibold">7 November 2026</p>
                </div>
                <div>
                    <span className="flex text-sm items-center gap-1 text-stone-400">
                        <Locate size={16}/>Lokasi 
                    </span>
                    <p className="text-lg font-semibold">Graha Sanusi Unpad Dipatiukur</p>
                </div>
            </div>
            <div>
                <Countdown 
                    targetDate={TARGET_DATE({
                        date: 7,
                        month: 11,
                        year: 2026,
                    })}
                />
            </div>
        </section>
    )
}