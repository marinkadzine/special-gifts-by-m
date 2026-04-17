import { getCategoryAnchor } from "@/lib/store-navigation";
import { StoreSection } from "@/types/store";

export function CategoryPills({ categories, section }: { categories: string[]; section: StoreSection }) {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => (
        <a
          key={category}
          href={`/#${getCategoryAnchor(section, category)}`}
          className="rounded-full border border-[var(--line)] bg-white/75 px-4 py-2 text-sm font-bold text-[var(--berry)]"
        >
          {category}
        </a>
      ))}
    </div>
  );
}
