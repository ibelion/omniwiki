import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { onePieceData } from "@/lib/onepiece/data";
import type {
  OnePieceCharacterRecord,
  OnePieceDataBundle,
} from "@/lib/onepiece/types";

type CharacterPageParams = {
  id: string;
};

const dataBundle: OnePieceDataBundle = onePieceData;

export const dynamicParams = false;

function truncateDescription(about: string | null): string {
  const fallback = "Character details from the One Piece section of OmniWiki.";

  if (!about) {
    return fallback;
  }

  return about.length > 155 ? `${about.slice(0, 152)}...` : about;
}

function getCharacterById(id: string): OnePieceCharacterRecord | undefined {
  return dataBundle.characters.find((character) => character.id === id);
}

export function generateStaticParams(): CharacterPageParams[] {
  return dataBundle.characters.map((character) => ({ id: character.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<CharacterPageParams>;
}): Promise<Metadata> {
  const { id } = await params;
  const character = getCharacterById(id);

  if (!character) {
    return {
      title: "Character Not Found | One Piece | OmniWiki",
      description: "The requested One Piece character page could not be found.",
    };
  }

  return {
    title: `${character.name} | One Piece | OmniWiki`,
    description: truncateDescription(character.about),
  };
}

export default async function OnePieceCharacterDetailPage({
  params,
}: {
  params: Promise<CharacterPageParams>;
}) {
  const { id } = await params;
  const character = getCharacterById(id);

  if (!character) {
    notFound();
  }

  const sortedCharacters = [...dataBundle.characters].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
  const currentIndex = sortedCharacters.findIndex(
    (entry) => entry.id === character.id,
  );
  const previousCharacter =
    currentIndex > 0 ? sortedCharacters[currentIndex - 1] : null;
  const nextCharacter =
    currentIndex < sortedCharacters.length - 1
      ? sortedCharacters[currentIndex + 1]
      : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/onepiece/characters" label="Back to Characters" />

      <nav aria-label="Breadcrumb" className="text-sm text-[#6b6055]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:text-[#d4933a] hover:underline" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              className="hover:text-[#d4933a] hover:underline"
              href="/onepiece"
            >
              One Piece
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              className="hover:text-[#d4933a] hover:underline"
              href="/onepiece/characters"
            >
              Characters
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-[#d4933a]">{character.name}</li>
        </ol>
      </nav>

      <section className="rounded-3xl border border-[#3a2410] bg-[#141418] p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <ImageWithFallback
            alt={character.name}
            className="h-40 w-40 rounded-3xl object-cover"
            src={character.image ?? ""}
          />

          <div className="flex-1 space-y-4">
            <div className="space-y-3">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  character.role === "Main"
                    ? "bg-[#1c1208] text-[#d4933a]"
                    : "bg-[#1c1c22] text-[#9a8c7e]"
                }`}
              >
                {character.role}
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-[#F2E8D5]">
                {character.name}
              </h1>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#6b6055]">
                Nicknames
              </p>
              {character.nicknames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {character.nicknames.map((nickname) => (
                    <span
                      key={nickname}
                      className="rounded-full border border-[#3a2410] bg-[#1a1208] px-3 py-1 text-sm text-[#c47830]"
                    >
                      {nickname}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#6b6055]">No nicknames listed.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {(character.position ||
        character.bounty ||
        character.devilFruit ||
        character.status ||
        character.origin ||
        character.age ||
        character.height ||
        character.birthday ||
        character.bloodType ||
        character.affiliation.length > 0 ||
        character.formerAffiliation.length > 0) && (
        <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#6b6055]">
            Profile
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {character.status && (
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6b6055]">
                  Status
                </dt>
                <dd className="text-sm text-[#F2E8D5]">{character.status}</dd>
              </div>
            )}
            {character.origin && (
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6b6055]">
                  Origin
                </dt>
                <dd className="text-sm text-[#F2E8D5]">{character.origin}</dd>
              </div>
            )}
            {character.age && (
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6b6055]">
                  Age
                </dt>
                <dd className="text-sm text-[#F2E8D5]">{character.age}</dd>
              </div>
            )}
            {character.birthday && (
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6b6055]">
                  Birthday
                </dt>
                <dd className="text-sm text-[#F2E8D5]">{character.birthday}</dd>
              </div>
            )}
            {character.height && (
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6b6055]">
                  Height
                </dt>
                <dd className="text-sm text-[#F2E8D5]">{character.height}</dd>
              </div>
            )}
            {character.bloodType && (
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6b6055]">
                  Blood Type
                </dt>
                <dd className="text-sm text-[#F2E8D5]">{character.bloodType}</dd>
              </div>
            )}
            {character.position && (
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6b6055]">
                  Position
                </dt>
                <dd className="text-sm text-[#F2E8D5]">{character.position}</dd>
              </div>
            )}
            {character.bounty && (
              <div className="flex flex-col gap-1">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6b6055]">
                  Bounty
                </dt>
                <dd className="text-sm font-semibold text-[#d4933a]">{character.bounty}</dd>
              </div>
            )}
            {character.devilFruit && (
              <div className="flex flex-col gap-1 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6b6055]">
                  Devil Fruit
                </dt>
                <dd className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const slugify = (s: string) =>
                      s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                    const fruitId = slugify(character.devilFruit!);
                    const fruitExists = onePieceData.devilFruits.some((f) => f.id === fruitId);
                    return fruitExists ? (
                      <Link
                        href={`/onepiece/devil-fruits/${fruitId}`}
                        className="rounded-full border border-[#3a2410] bg-[#1c1208] px-3 py-1 text-sm text-[#d4933a] hover:border-[#5a3820] hover:underline"
                      >
                        {character.devilFruit}
                      </Link>
                    ) : (
                      <span className="rounded-full border border-[#3a2410] bg-[#1c1208] px-3 py-1 text-sm text-[#d4933a]">
                        {character.devilFruit}
                      </span>
                    );
                  })()}
                  {character.devilFruitEnglish && (
                    <span className="text-sm text-[#6b6055]">
                      ({character.devilFruitEnglish})
                    </span>
                  )}
                  {character.devilFruitType && (
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        character.devilFruitType === "Paramecia"
                          ? "bg-[#1a1520] text-[#b890e0]"
                          : character.devilFruitType === "Zoan"
                            ? "bg-[#0e1a10] text-[#56b870]"
                            : "bg-[#0e1520] text-[#4090d0]"
                      }`}
                    >
                      {character.devilFruitType}
                    </span>
                  )}
                </dd>
              </div>
            )}
            {character.affiliation.length > 0 && (
              <div className="flex flex-col gap-1 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6b6055]">
                  Affiliation
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {character.affiliation.map((a) => {
                    const slugify = (s: string) =>
                      s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                    const crewId = slugify(a);
                    const crewExists = onePieceData.crews.some((c) => c.id === crewId);
                    return crewExists ? (
                      <Link
                        key={a}
                        href={`/onepiece/crews/${crewId}`}
                        className="rounded-full border border-[#1c1c22] bg-[#0c0c0e] px-2.5 py-1 text-xs text-[#9a8c7e] hover:border-[#4a3420] hover:text-[#d4933a]"
                      >
                        {a}
                      </Link>
                    ) : (
                      <span
                        key={a}
                        className="rounded-full border border-[#1c1c22] bg-[#0c0c0e] px-2.5 py-1 text-xs text-[#9a8c7e]"
                      >
                        {a}
                      </span>
                    );
                  })}
                </dd>
              </div>
            )}
            {character.formerAffiliation.length > 0 && (
              <div className="flex flex-col gap-1 sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-[#6b6055]">
                  Former Affiliation
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {character.formerAffiliation.map((a) => (
                    <span
                      key={a}
                      className="rounded-full border border-dashed border-[#2c2c32] bg-[#0c0c0e] px-2.5 py-1 text-xs text-[#6b6055]"
                    >
                      {a}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#F2E8D5]">About</h2>
        <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-[#9a8c7e]">
          {character.about ?? "No description available."}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {previousCharacter ? (
          <Link
            className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm transition hover:border-[#4a3420] hover:shadow-md"
            href={`/onepiece/characters/${previousCharacter.id}`}
          >
            <p className="text-sm text-[#6b6055]">Previous</p>
            <p className="mt-1 text-lg font-semibold text-[#F2E8D5]">
              {previousCharacter.name}
            </p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#1c1c22] bg-[#141418] p-5 text-sm text-[#6b6055]">
            Start of character list
          </div>
        )}

        {nextCharacter ? (
          <Link
            className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-5 text-right shadow-sm transition hover:border-[#4a3420] hover:shadow-md"
            href={`/onepiece/characters/${nextCharacter.id}`}
          >
            <p className="text-sm text-[#6b6055]">Next</p>
            <p className="mt-1 text-lg font-semibold text-[#F2E8D5]">
              {nextCharacter.name}
            </p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#1c1c22] bg-[#141418] p-5 text-right text-sm text-[#6b6055]">
            End of character list
          </div>
        )}
      </section>
    </main>
  );
}
