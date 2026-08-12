import CartContainer from "@/app/features/cart/components/CartContainer";
import PageContainer from "@/components/layout/PageContainer";
import { requirePageRole } from "@/lib/auth/session";

export default async function CartPage() {
  await requirePageRole("user");
  return (
    <PageContainer className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">Keranjang</h1>
        <p className="text-sm text-muted-foreground">Periksa kembali pesananmu sebelum checkout.</p>
      </div>
      <CartContainer />
    </PageContainer>
  );
}
