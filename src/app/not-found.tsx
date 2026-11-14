import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-5 text-center">
      <p className="font-display text-6xl font-bold text-turquoise">404</p>
      <p className="text-mist">This wave doesn&apos;t exist.</p>
      <Link href="/" className={buttonClasses("secondary")}>
        Wind of Legend
      </Link>
    </main>
  );
}
