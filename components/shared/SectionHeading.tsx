export default function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <p className="shrink-0 text-xs font-extrabold tracking-wider text-primary uppercase">{children}</p>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
