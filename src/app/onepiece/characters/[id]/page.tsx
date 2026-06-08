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
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/onepiece/characters" label="Back to Characters" />

      <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:text-orange-700 hover:underline" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              className="hover:text-orange-700 hover:underline"
              href="/onepiece"
            >
              One Piece
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              className="hover:text-orange-700 hover:underline"
              href="/onepiece/characters"
            >
              Characters
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-orange-700">{character.name}</li>
        </ol>
      </nav>

      <section className="rounded-3xl border border-orange-200 bg-white p-8 shadow-sm">
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
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {character.role}
              </span>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                {character.name}
              </h1>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Nicknames
              </p>
              {character.nicknames.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {character.nicknames.map((nickname) => (
                    <span
                      key={nickname}
                      className="rounded-full bg-red-50 px-3 py-1 text-sm text-red-700"
                    >
                      {nickname}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No nicknames listed.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900">About</h2>
        <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-gray-700">
          {character.about ?? "No description available."}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {previousCharacter ? (
          <Link
            className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
            href={`/onepiece/characters/${previousCharacter.id}`}
          >
            <p className="text-sm text-gray-500">Previous</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {previousCharacter.name}
            </p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-5 text-sm text-gray-400">
            Start of character list
          </div>
        )}

        {nextCharacter ? (
          <Link
            className="rounded-3xl border border-gray-200 bg-white p-5 text-right shadow-sm transition hover:border-orange-300 hover:shadow-md"
            href={`/onepiece/characters/${nextCharacter.id}`}
          >
            <p className="text-sm text-gray-500">Next</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {nextCharacter.name}
            </p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-5 text-right text-sm text-gray-400">
            End of character list
          </div>
        )}
      </section>
    </main>
  );
}
