import Link from "next/link";
import { tftData } from "@/lib/tft/data";

export default function TFTPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <header className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">
          Teamfight Tactics
        </p>
        <h1 className="mt-1 text-4xl font-semibold text-gray-900">TFT</h1>
        <p className="mt-2 text-gray-600">
          {tftData.champions.length} champions · {tftData.items.length} items · {tftData.traits.length} traits
        </p>
      </header>

      <nav className="grid gap-4 sm:grid-cols-3">
        <Link
          href="/tft/champions"
          className="flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:shadow-md"
        >
          <p className="text-2xl font-semibold text-gray-900">{tftData.champions.length}</p>
          <p className="text-sm font-semibold text-teal-700">Champions</p>
          <p className="text-xs text-gray-500">Cost tiers, traits, ability previews</p>
        </Link>
        <Link
          href="/tft/items"
          className="flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:shadow-md"
        >
          <p className="text-2xl font-semibold text-gray-900">{tftData.items.length}</p>
          <p className="text-sm font-semibold text-teal-700">Items</p>
          <p className="text-xs text-gray-500">Components, combined items, and more</p>
        </Link>
        <Link
          href="/tft/traits"
          className="flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:shadow-md"
        >
          <p className="text-2xl font-semibold text-gray-900">{tftData.traits.length}</p>
          <p className="text-sm font-semibold text-teal-700">Traits</p>
          <p className="text-xs text-gray-500">Origins and classes with tier breakpoints</p>
        </Link>
      </nav>
    </main>
  );
}
