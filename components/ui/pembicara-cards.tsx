"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CatIcon,
  BirdIcon,
  PlayCircleIcon,
  ArrowBigDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Pembicara {
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  githubUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
}

const pembicara: Pembicara[] = [
  {
    name: "Aditya Cakti C.",
    title: "Kabid PALING MENGERIKAN",
    description:
      "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum ",
    imageUrl:
      "/green-renewable-1.webp",
    githubUrl: "#",
    twitterUrl: "#",
    youtubeUrl: "#",
    linkedinUrl: "#",
  },
  {
    name: "Farras Faqih",
    title: "Project Officer SIGMA PISAN",
    description:
      "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum ",
    imageUrl:
      "/green-renewable-1.webp",
    githubUrl: "#",
    twitterUrl: "#",
    youtubeUrl: "#",
    linkedinUrl: "#",
  },
];

export interface PembicaraCardsProps {
  className?: string;
}

export function PembicaraCards({ className }: PembicaraCardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () =>
    setCurrentIndex((index) => (index + 1) % pembicara.length);
  const handlePrevious = () =>
    setCurrentIndex(
      (index) => (index - 1 + pembicara.length) % pembicara.length
    );

  const currentTestimonial = pembicara[currentIndex];

  const socialIcons = [
    { icon: CatIcon,url: currentTestimonial.githubUrl, label: "GitHub" },
    { icon: BirdIcon, url: currentTestimonial.twitterUrl, label: "Twitter" },
    { icon: PlayCircleIcon, url: currentTestimonial.youtubeUrl, label: "YouTube" },
    { icon: ArrowBigDown, url: currentTestimonial.linkedinUrl, label: "LinkedIn" },
  ];

  return (
    <div className={cn("w-full max-w-5xl mx-auto", className)}>
      {/* Desktop layout */}
      <div className='hidden md:flex relative items-center'>
        {/* Avatar */}
        <div className='w-[470px] h-[470px] rounded-md overflow-hidden border border-white/10 bg-white/[0.04] shadow-[0_24px_90px_rgba(0,0,0,0.35)] flex-shrink-0'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentTestimonial.imageUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className='w-full h-full'
            >
              <Image
                src={currentTestimonial.imageUrl}
                alt={currentTestimonial.name}
                width={470}
                height={470}
                className='w-full h-full object-cover'
                draggable={false}
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card */}
        <div className='relative z-10 rounded-md ml-[-80px] max-w-xl flex-1 overflow-hidden border border-white/10 bg-neutral-950/85 p-8 shadow-[0_24px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-sky-500 before:to-transparent'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentTestimonial.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className='mb-6'>
                <h2 className="mb-2 text-xl font-semibold tracking-tight text-white">
                  {currentTestimonial.name}
                </h2>

                <p className='text-sm font-medium text-sky-400'>
                  {currentTestimonial.title}
                </p>
              </div>

              <p className='mb-8 text-base leading-relaxed text-neutral-300'>
                {currentTestimonial.description}
              </p>

              <div className='flex space-x-4'>
                {socialIcons.map(({ icon: IconComponent, url, label }) => (
                  <Link
                    key={label}
                    href={url || "#"}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sky-500 transition hover:border-sky-300/40 hover:bg-blue-500/20 hover:text-white hover:shadow-[0_0_24px_rgba(168,85,247,0.3)]'
                    aria-label={label}
                  >
                    <IconComponent className='h-5 w-5' />
                  </Link>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile layout */}
      <div className='mx-auto max-w-sm text-center md:hidden'>
        {/* Avatar */}
        <div className='mb-6 aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentTestimonial.imageUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className='w-full h-full'
            >
              <Image
                src={currentTestimonial.imageUrl}
                alt={currentTestimonial.name}
                width={400}
                height={400}
                className='w-full h-full object-cover'
                draggable={false}
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Card content */}
        <div className='px-2 pb-2'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentTestimonial.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <h2 className="mb-2 text-lg font-semibold tracking-tight text-white">
                {currentTestimonial.name}
              </h2>
              
              <p className='mb-4 text-sm font-medium text-sky-500'>
                {currentTestimonial.title}
              </p>
              
              <p className='mb-6 text-sm leading-relaxed text-neutral-300'>
                {currentTestimonial.description}
              </p>
              
              <div className='flex justify-center space-x-4'>
                {socialIcons.map(({ icon: IconComponent, url, label }) => (
                  <Link
                    key={label}
                    href={url || "#"}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-neutral-200 transition hover:border-purple-300/40 hover:bg-purple-500/20 hover:text-white'
                    aria-label={label}
                  >
                    <IconComponent className='h-5 w-5' />
                  </Link>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className='flex justify-center items-center gap-6 mt-8'>
        {/* Previous */}
        <button
          onClick={handlePrevious}
          aria-label='Previous testimonial'
          className='flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-neutral-200 shadow-[0_12px_36px_rgba(0,0,0,0.24)] transition hover:border-sky-300/40 hover:bg-sky-500/20 hover:text-white'
        >
          <ChevronLeft className='h-6 w-6' />
        </button>

        {/* Dots */}
        <div className='flex gap-2'>
          {pembicara.map((_, testimonialIndex) => (
            <button
              key={testimonialIndex}
              onClick={() => setCurrentIndex(testimonialIndex)}
              className={cn(
                "h-3 w-3 cursor-pointer rounded-full transition-colors",
                testimonialIndex === currentIndex
                  ? "bg-sky-500 shadow-[0_0_18px_rgba(216,180,254,0.75)]"
                  : "bg-white/25 hover:bg-white/45"
              )}
              aria-label={`Go to testimonial ${testimonialIndex + 1}`}
            />
          ))}
        </div>

        {/* Next */}
        <button
          onClick={handleNext}
          aria-label='Next testimonial'
          className='flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-neutral-200 shadow-[0_12px_36px_rgba(0,0,0,0.24)] transition hover:border-sky-300/40 hover:bg-sky-500/20 hover:text-white'
        >
          <ChevronRight className='h-6 w-6' />
        </button>
      </div>
    </div>
  );
}
