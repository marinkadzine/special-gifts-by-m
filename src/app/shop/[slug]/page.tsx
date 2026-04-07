import { ProductDetailLayout } from "@/components/product-detail-layout";
import { defaultProducts } from "@/data/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return defaultProducts.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  return <ProductDetailLayout slug={resolvedParams.slug} />;
}
