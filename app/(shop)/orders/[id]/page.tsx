import OrderDetailContainer from "@/app/features/orders/components/OrderDetailContainer";
import PageContainer from "@/components/layout/PageContainer";
import { requirePageRole } from "@/lib/auth/session";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageRole("user");
  const { id } = await params;
  return (
    <PageContainer className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">Detail Pesanan</h1>
        <p className="text-sm text-muted-foreground">Status dan informasi lengkap pesananmu.</p>
      </div>
      <OrderDetailContainer orderId={id} />
    </PageContainer>
  );
}
