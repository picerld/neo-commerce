import AdminOrdersListContainer from "@/app/features/admin-orders/components/AdminOrdersListContainer";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-extrabold tracking-tight">Pesanan</h2>
        <p className="text-sm text-muted-foreground">Pantau dan proses semua pesanan pelanggan.</p>
      </div>
      <AdminOrdersListContainer />
    </div>
  );
}
