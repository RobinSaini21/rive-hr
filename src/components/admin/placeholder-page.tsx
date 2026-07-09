type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-10 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-primary">
          <span className="text-xl font-semibold">{title[0]}</span>
        </div>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-6 inline-flex rounded-lg border border-dashed border-border px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted">
          Module coming soon
        </div>
      </div>
    </div>
  );
}
