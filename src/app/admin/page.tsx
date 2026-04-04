import { AdminDashboard } from "@/components/admin-dashboard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function AdminPage() {
  return (
    <main>
      <SiteHeader />
      <div className="shell py-8">
        <AdminDashboard />
      </div>
      <SiteFooter />
    </main>
  );
}
