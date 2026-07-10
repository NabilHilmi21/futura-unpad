"use client";
import Link from "next/link";
import React from "react";
import { motion } from "motion/react";
import { isInternalAppHref } from "@/lib/navigation";

const navbarMenuSettings = {
  motion: {
    dropdown: {
      type: "spring",
      mass: 0.65,
      damping: 24,
      stiffness: 150,
      restDelta: 0.001,
      restSpeed: 0.001,
    },
    label: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
} as const;

type NavbarMenuLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

function NavbarMenuLink({ href, children, ...props }: NavbarMenuLinkProps) {
  if (isInternalAppHref(href)) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative ">
      <motion.p
        transition={navbarMenuSettings.motion.label}
        className="cursor-pointer text-black transition-opacity duration-500 ease-out hover:opacity-[0.9] dark:text-white"
      >
        {item}
      </motion.p>
      {active !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={navbarMenuSettings.motion.dropdown}
        >
          {active === item && (
            <div className="absolute top-[calc(100%_+_1.2rem)] left-1/2 transform -translate-x-1/2 pt-4">
              <motion.div
                transition={navbarMenuSettings.motion.dropdown}
                layoutId="active" // layoutId biar smooth animasinya
                className="bg-white dark:bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-xl"
              >
                <motion.div
                  layout // layout ini biar smooth animasinya
                  className="w-max h-full p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)} // reset state
      className="relative rounded-full border border-transparent dark:bg-black dark:border-white/[0.2] bg-white shadow-input flex justify-center space-x-4 px-8 py-6 "
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <NavbarMenuLink href={href} className="flex space-x-2">
      <img
        src={src}
        width={140}
        height={70}
        alt={title}
        className="shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black dark:text-white">
          {title}
        </h4>
        <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
          {description}
        </p>
      </div>
    </NavbarMenuLink>
  );
};

export const HoveredLink = ({
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
  if (rest.href && isInternalAppHref(rest.href)) {
    return (
      <Link
        {...rest}
        href={rest.href}
        className="text-neutral-700 dark:text-neutral-200 hover:text-black "
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      {...rest}
      className="text-neutral-700 dark:text-neutral-200 hover:text-black "
    >
      {children}
    </a>
  );
};
