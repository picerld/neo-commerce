"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ImageOff, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { useGetMe } from "@/app/features/auth/api/getMe";
import { useAddToCart } from "@/app/features/cart/api/addToCart";
import type { ProductSummary } from "../types/product.type";

export default function ProductCard({ product }: { product: ProductSummary }) {
  const router = useRouter();
  const { data: me } = useGetMe();
  const outOfStock = product.stock <= 0;

  const addToCartMutation = useAddToCart({
    mutationConfig: {
      onSuccess: () => toast.success(`${product.name} ditambahkan ke keranjang`),
      onError: (error) => toast.error(error.message || "Gagal menambahkan ke keranjang"),
    },
  });

  const handleQuickAdd = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!me) {
      router.push("/login");
      return;
    }
    addToCartMutation.mutate({ productId: product.id, quantity: 1 });
  };

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <Card className="h-full overflow-hidden p-0 transition-transform group-hover:-translate-y-0.5">
        <div className="relative aspect-square w-full bg-muted">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageOff className="size-8 text-muted-foreground" />
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Badge variant="destructive">Stok Habis</Badge>
            </div>
          )}
          {!outOfStock && (
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={addToCartMutation.isPending}
              aria-label="Tambah cepat ke keranjang"
              className="absolute right-2 bottom-2 flex size-9 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground opacity-0 shadow-[0_2px_0_0_color-mix(in_oklab,var(--primary),black_18%)] transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-100"
            >
              <Plus className="size-4" />
            </button>
          )}
        </div>
        <CardContent className="space-y-1 px-3 pb-3">
          <p className="line-clamp-2 min-h-9 text-sm leading-snug font-semibold">{product.name}</p>
          <p className="font-heading text-base font-extrabold text-primary">{formatRupiah(product.price)}</p>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{product.soldCount > 0 ? `${product.soldCount} terjual` : "Baru"}</span>
            {!outOfStock && product.stock <= 5 && <span className="font-semibold text-warning">Sisa {product.stock}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
