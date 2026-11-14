import type { ReactNode } from "react";
import { Card } from "./card";

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-2 py-10 text-center">
      {icon && <div className="text-3xl">{icon}</div>}
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="max-w-xs text-sm text-mist">{description}</p>
    </Card>
  );
}
