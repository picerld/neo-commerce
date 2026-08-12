import DashboardOverview from "@/app/features/admin-dashboard/components/DashboardOverview";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-extrabold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Ringkasan pendapatan, pesanan, dan stok toko.</p>
      </div>
      <DashboardOverview />
    </div>
  );
}
