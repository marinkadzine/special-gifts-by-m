import { AccountPanel } from "@/components/account-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function AccountPage() {
  return (
    <main>
      <SiteHeader />
      <div className="shell py-8">
        <AccountPanel />
      </div>
      <SiteFooter />
    </main>
  );
}
