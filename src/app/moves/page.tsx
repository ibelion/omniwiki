import Link from "next/link";
import { pokemonData } from "@/lib/pokemon/data";

export default function MovesPage() {
  const moves = pokemonData.moves;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Moves
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Moves ({moves.length} total)
        </h1>
        <p className="text-gray-600">
          All moves with type, class, power, accuracy, and PP.
        </p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {moves.map((move) => (
          <Link
            key={move.id}
            href={`/moves/${move.slug}`}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50"
          >
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-900">
                {move.name}
              </div>
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {move.type || "—"}
              </span>
            </div>
            <p className="text-sm text-gray-600">{move.shortEffect}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-700">
              <span className="rounded bg-gray-100 px-2 py-1">
                Power: {move.power ?? "—"}
              </span>
              <span className="rounded bg-gray-100 px-2 py-1">
                Acc: {move.accuracy ?? "—"}
              </span>
              <span className="rounded bg-gray-100 px-2 py-1">
                PP: {move.pp ?? "—"}
              </span>
              <span className="rounded bg-gray-100 px-2 py-1">
                Class: {move.damageClass ?? "—"}
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
