"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home", activeText: "text-[#F2E8D5]", activeBg: "bg-[#1c1c22]" },
  { href: "/pokemon", label: "Pokemon", activeText: "text-[#8892f0]", activeBg: "bg-[#12122a]" },
  { href: "/league", label: "League", activeText: "text-[#4caf72]", activeBg: "bg-[#0e1c14]" },
  { href: "/tft", label: "TFT", activeText: "text-[#4ab8c8]", activeBg: "bg-[#0d181c]" },
  { href: "/onepiece", label: "One Piece", activeText: "text-[#d4933a]", activeBg: "bg-[#1c1208]" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 text-[13px] font-semibold">
      {NAV_LINKS.map(({ href, label, activeText, activeBg }) => {
        const isActive =
          href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            className={`rounded-lg px-3 py-2 transition ${
              isActive
                ? `${activeText} ${activeBg}`
                : "text-[#6b6055] hover:bg-[#1c1c22] hover:text-[#F2E8D5]"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
