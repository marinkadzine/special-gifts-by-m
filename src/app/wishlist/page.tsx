import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WishlistPanel } from "@/components/wishlist-panel";

export default function WishlistPage() {
  return (
    <main>
      <SiteHeader />
      <div className="shell py-8">
        <WishlistPanel />
      </div>
      <SiteFooter />
    </main>
  );
}
