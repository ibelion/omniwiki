import Link from "next/link";

type BackLinkProps = {
  href: string;
  label?: string;
};

export function BackLink({ href, label = "Back" }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-lg border border-[#1c1c22] bg-[#141418] px-3 py-2 text-sm font-semibold text-[#9a8c7e] shadow-sm transition hover:border-[#22224a] hover:text-[#8892f0]"
    >
      ← {label}
    </Link>
  );
}
