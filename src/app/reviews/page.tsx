import { ReviewsHub } from "@/components/reviews-hub";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function ReviewsPage() {
  return (
    <main>
      <SiteHeader />
      <div className="shell py-8">
        <ReviewsHub />
      </div>
      <SiteFooter />
    </main>
  );
}
