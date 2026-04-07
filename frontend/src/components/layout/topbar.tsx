import type { ReactNode } from "react";

type TopbarProps = {
  title: string;
  actions?: ReactNode;
};

export function Topbar({ title, actions }: TopbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <h1 className="text-lg font-semibold tracking-tight text-zinc-950">
        {title}
      </h1>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
