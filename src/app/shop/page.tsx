"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductDetailLayout } from "@/components/product-detail-layout";

function ShopPageContent() {
  const searchParams = useSearchParams();

  return <ProductDetailLayout slug={searchParams.get("slug") ?? undefined} />;
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ProductDetailLayout />}>
      <ShopPageContent />
    </Suspense>
  );
}
