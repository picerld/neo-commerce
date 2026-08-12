import AdminOrderDetailContainer from "@/app/features/admin-orders/components/AdminOrderDetailContainer";

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-extrabold tracking-tight">Detail Pesanan</h2>
        <p className="text-sm text-muted-foreground">Kelola status dan pengiriman pesanan ini.</p>
      </div>
      <AdminOrderDetailContainer orderId={id} />
    </div>
  );
}
