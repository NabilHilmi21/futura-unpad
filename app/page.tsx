import type { Metadata } from "next"

import AboutSection from "@/components/landing/about-section"
import { FAQSection } from "@/components/landing/faq-section"
import { EventOverviewSection } from "@/components/landing/event-overview-section"
import { Footer } from "@/components/layout/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { RegistrationCards } from "@/components/landing/registration-cards"
import HowToRegisterSection from "@/components/landing/how-to-register"
import { ReasonToJoinSection } from "@/components/landing/reason-to-join-section"
import { WhoCanJoinSection } from "@/components/landing/who-can-join-section"
import { CountdownPrizeSection } from "@/components/landing/countdown-prize-section"

export const metadata: Metadata = {
  title: "Coming Soon!",
  description:
    "Register for Futura 2026, a university technology event featuring seminars, robotic competition, and research dissemination.",
}

export default function Home() {
  return (
    <main className="bg-[#fbfbf8]">
      <HeroSection />
      <AboutSection />
      <ReasonToJoinSection />
      <WhoCanJoinSection />
      <CountdownPrizeSection />
      <HowToRegisterSection />
      <RegistrationCards />
      <EventOverviewSection />
      <FAQSection />
      <Footer />
    </main>
  )
}
