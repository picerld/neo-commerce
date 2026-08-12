import CheckoutForm from "@/app/features/checkout/components/CheckoutForm";
import PageContainer from "@/components/layout/PageContainer";
import { requirePageRole } from "@/lib/auth/session";

export default async function CheckoutPage() {
  await requirePageRole("user");
  return (
    <PageContainer className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground">Lengkapi alamat pengiriman lalu bayar dengan Midtrans.</p>
      </div>
      <CheckoutForm />
    </PageContainer>
  );
}
