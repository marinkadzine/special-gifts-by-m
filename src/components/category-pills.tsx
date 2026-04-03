export function CategoryPills({ categories }: { categories: string[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => (
        <a
          key={category}
          href={`#category-${category.toLowerCase().replace(/\s+/g, "-")}`}
          className="rounded-full border border-[var(--line)] bg-white/75 px-4 py-2 text-sm font-bold text-[var(--berry)]"
        >
          {category}
        </a>
      ))}
    </div>
  );
}
