import OrderListContainer from "@/app/features/orders/components/OrderListContainer";
import PageContainer from "@/components/layout/PageContainer";
import { requirePageRole } from "@/lib/auth/session";

export default async function OrdersPage() {
  await requirePageRole("user");
  return (
    <PageContainer className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">Pesanan Saya</h1>
        <p className="text-sm text-muted-foreground">Riwayat dan status semua pesananmu.</p>
      </div>
      <OrderListContainer />
    </PageContainer>
  );
}
