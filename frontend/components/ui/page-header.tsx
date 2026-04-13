type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="max-w-4xl">
      <p className="text-sm uppercase tracking-[0.24em] text-glow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold sm:text-5xl">{title}</h2>
      <p className="mt-4 max-w-3xl text-base leading-7 text-mist/78">{description}</p>
    </section>
  );
}
