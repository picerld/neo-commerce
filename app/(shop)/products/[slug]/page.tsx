import ProductDetailContainer from "@/app/features/products/components/ProductDetailContainer";
import PageContainer from "@/components/layout/PageContainer";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <PageContainer>
      <ProductDetailContainer slug={slug} />
    </PageContainer>
  );
}
