"use client";
import Link from "next/link";

interface ButtonV2Props {
  text: string;
  href: string;
}

export function ButtonV2({ text, href }: ButtonV2Props) {
  return (
    <Link href={href} className="cursor-pointer px-6 py-2 w-fit rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200">
      {text}
    </Link>
  );
}

