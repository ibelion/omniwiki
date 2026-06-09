"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SLIDES = [
  {
    id: "league",
    eyebrow: "League of Legends",
    title: "Champions of the Rift",
    sub: "Every champion, skin, item, and rune — the definitive League reference.",
    cta: { label: "Browse Champions", href: "/league/champions" },
    cta2: { label: "Enter Universe", href: "/league" },
    accent: "#4caf72",
    art: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg",
    artAlt: "Jinx",
    isPng: false as const,
    overlay:
      "linear-gradient(to right, rgba(8,20,12,0.82) 30%, transparent 76%), linear-gradient(to top, rgba(8,12,10,0.95) 0%, transparent 52%)",
  },
  {
    id: "tft",
    eyebrow: "Teamfight Tactics",
    title: "Build the Perfect Team",
    sub: "Champions, traits, items, and augments — every synergy for the current set.",
    cta: { label: "Browse Champions", href: "/tft/champions" },
    cta2: { label: "Enter Universe", href: "/tft" },
    accent: "#4ab8c8",
    art: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg",
    artAlt: "Lux",
    isPng: false as const,
    overlay:
      "linear-gradient(to right, rgba(7,14,16,0.82) 30%, transparent 76%), linear-gradient(to top, rgba(6,12,14,0.95) 0%, transparent 52%)",
  },
  {
    id: "pokemon",
    eyebrow: "Pokémon",
    title: "Gotta Catch 'Em All",
    sub: "Complete Pokédex with stats, moves, evolutions, and abilities for every generation.",
    cta: { label: "Browse Pokédex", href: "/pokemon/pokedex" },
    cta2: { label: "Enter Universe", href: "/pokemon" },
    accent: "#8892f0",
    art: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
    artAlt: "Charizard",
    isPng: true as const,
    overlay:
      "linear-gradient(to right, rgba(8,8,20,0.92) 38%, rgba(8,8,20,0.3) 76%), linear-gradient(to top, rgba(8,8,18,0.95) 0%, transparent 52%)",
  },
  {
    id: "onepiece",
    eyebrow: "One Piece",
    title: "Sail the Grand Line",
    sub: "Character profiles and crew data from across the seas of One Piece.",
    cta: { label: "Browse Characters", href: "/onepiece/characters" },
    cta2: { label: "Enter Universe", href: "/onepiece" },
    accent: "#d4933a",
    art: null,
    artAlt: null,
    isPng: false as const,
    overlay:
      "linear-gradient(to right, rgba(14,8,2,0.88) 35%, transparent 76%), linear-gradient(to top, rgba(12,7,2,0.95) 0%, transparent 52%)",
  },
];

export function HeroRotator() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

  const slide = SLIDES[current];

  return (
    <section className="relative h-[500px] w-full overflow-hidden rounded-3xl">
      {SLIDES.map((s, i) => {
        const active = i === current;
        return (
          <div
            key={s.id}
            className="absolute inset-0"
            style={{ opacity: active ? 1 : 0, transition: "opacity 1.4s ease-in-out", zIndex: active ? 1 : 0 }}
            aria-hidden={!active}
          >
            {s.art && !s.isPng ? (
              <img
                src={s.art}
                alt={s.artAlt ?? ""}
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  filter: "brightness(0.55) saturate(1.1)",
                  transform: active ? "scale(1.0)" : "scale(1.04)",
                  transition: "transform 8s ease-out",
                }}
              />
            ) : s.art && s.isPng ? (
              <div
                className="absolute inset-0"
                style={{ background: "radial-gradient(ellipse at 65% 40%, #1a1a3a 0%, #0c0c14 60%, #0a0a10 100%)" }}
              >
                <img
                  src={s.art}
                  alt={s.artAlt ?? ""}
                  className="absolute right-0 top-0 h-full w-[52%] object-contain object-right-top"
                  style={{
                    filter: "drop-shadow(0 0 80px rgba(136,146,240,0.28))",
                    transform: active ? "scale(1.0)" : "scale(1.04)",
                    transition: "transform 8s ease-out",
                  }}
                />
              </div>
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, #0e0806 0%, #1c1006 40%, #120a04 100%)" }}
              >
                <div
                  className="absolute inset-0 opacity-[0.07]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg, #d4933a 0px, #d4933a 1px, transparent 1px, transparent 48px)",
                  }}
                />
                <span
                  className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 select-none font-black opacity-[0.04]"
                  style={{ fontSize: "clamp(3rem, 14vw, 9rem)", color: "#d4933a", letterSpacing: "-0.04em" }}
                >
                  GRAND LINE
                </span>
              </div>
            )}
            <div className="absolute inset-0" style={{ background: s.overlay }} />
          </div>
        );
      })}

      {/* dot grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          zIndex: 2,
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end px-8 pb-10 sm:px-12">
        <div className="max-w-2xl">
          <p
            className="mb-2 text-[11px] font-semibold uppercase tracking-[.24em]"
            style={{ color: slide.accent, transition: "color 0.6s" }}
          >
            {slide.eyebrow}
          </p>
          <h1
            className="mb-3 text-4xl font-extrabold leading-[1.04] tracking-tight text-[#F2E8D5] sm:text-5xl"
            style={{ textShadow: "0 2px 24px rgba(0,0,0,0.55)" }}
          >
            {slide.title}
          </h1>
          <p className="mb-6 max-w-lg text-sm text-[#9a8c7e] sm:text-base">{slide.sub}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={slide.cta.href}
              className="rounded-lg px-5 py-2.5 text-sm font-bold text-[#0c0c0e] transition hover:brightness-110"
              style={{ backgroundColor: slide.accent }}
            >
              {slide.cta.label}
            </Link>
            <Link
              href={slide.cta2.href}
              className="rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.07)] px-5 py-2.5 text-sm font-semibold text-[#F2E8D5] backdrop-blur-sm transition hover:bg-[rgba(255,255,255,0.13)]"
            >
              {slide.cta2.label}
            </Link>
          </div>
        </div>

        {/* dot indicators */}
        <div className="absolute bottom-6 right-8 flex items-center gap-2 sm:right-12">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`View ${s.eyebrow}`}
              className="flex h-6 items-center justify-center"
            >
              <span
                className="block rounded-full"
                style={{
                  width: i === current ? 22 : 8,
                  height: 8,
                  backgroundColor:
                    i === current ? slide.accent : "rgba(255,255,255,0.22)",
                  transition: "width 0.4s ease, background-color 0.4s ease",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
