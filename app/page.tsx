import type { Metadata } from "next"

import AboutSection from "@/components/landing/about-section"
import { FAQSection } from "@/components/landing/faq-section"
import { EventOverviewSection } from "@/components/landing/event-overview-section"
import { HeroSection } from "@/components/landing/hero-section"
import RegistrationsSection from "@/components/landing/registrations-section"
import { RegistrationTimeline } from "@/components/landing/registration-timeline"
import { ReasonToJoinSection } from "@/components/landing/reason-to-join-section"
import { WhoCanJoinSection } from "@/components/landing/who-can-join-section"
import { CountdownPrizeSection } from "@/components/landing/countdown-prize-section"
import OurLocation from "@/components/landing/our-location"

export const metadata: Metadata = {
  title: "Coming Soon!",
  description:
    "Register for Futura 2026, a university technology event featuring seminars, robotic competition, and research dissemination.",
}

export default function Home() {
  return (
    <main className="space-y-56">
      <HeroSection />
      <AboutSection />
      <RegistrationTimeline />
      <RegistrationsSection />
      <OurLocation />
      <FAQSection />
    </main>
  )
}
