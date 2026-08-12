import AdminProductsListContainer from "@/app/features/products/components/AdminProductsListContainer";

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-extrabold tracking-tight">Produk</h2>
        <p className="text-sm text-muted-foreground">Kelola katalog, harga, dan stok produk.</p>
      </div>
      <AdminProductsListContainer />
    </div>
  );
}
