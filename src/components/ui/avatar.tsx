import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function Avatar({ name, src, size = 48, className }: AvatarProps) {
  const style = { width: size, height: size };
  if (src) {
    // Plain <img>: avatars are small and served from Supabase's public CDN.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        style={style}
        className={cn(
          "rounded-full object-cover ring-2 ring-turquoise/40",
          className,
        )}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={style}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-reef font-display font-semibold text-foam ring-2 ring-turquoise/40",
        className,
      )}
    >
      {initials(name) || "?"}
    </span>
  );
}
