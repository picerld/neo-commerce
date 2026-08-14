import InvoiceView from "@/app/features/orders/components/InvoiceView";
import PageContainer from "@/components/layout/PageContainer";
import { requirePageRole } from "@/lib/auth/session";

export default async function OrderInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageRole("user");
  const { id } = await params;
  return (
    <PageContainer>
      <InvoiceView orderId={id} />
    </PageContainer>
  );
}
