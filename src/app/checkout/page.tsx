import { CartSummary } from "@/components/cart-summary";
import { CheckoutForm } from "@/components/checkout-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function CheckoutPage() {
  return (
    <main>
      <SiteHeader />
      <div className="shell grid gap-8 py-8 md:grid-cols-[1.05fr_0.95fr]">
        <CartSummary />
        <CheckoutForm />
      </div>
      <SiteFooter />
    </main>
  );
}
