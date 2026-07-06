"use client";

import { icons, type LucideProps } from "lucide-react";

export default function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = (icons as Record<string, React.ComponentType<LucideProps>>)[name] ?? icons.Circle;
  return <Cmp {...props} />;
}
