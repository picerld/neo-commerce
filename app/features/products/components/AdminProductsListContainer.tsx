"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Boxes, Plus, Pencil, Trash2, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import { formatRupiah } from "@/lib/utils";
import { useGetAdminProducts } from "../api/getAdminProducts";
import { useDeleteProduct } from "../api/deleteProduct";
import ProductFormDialog from "./ProductFormDialog";
import type { ProductSummary } from "../types/product.type";

export default function AdminProductsListContainer() {
  const { data: products, isLoading } = useGetAdminProducts();
  const [formTarget, setFormTarget] = React.useState<ProductSummary | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<ProductSummary | null>(null);

  const deleteMutation = useDeleteProduct({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Produk dihapus");
        setDeleteTarget(null);
      },
      onError: (error) => toast.error(error.message || "Gagal menghapus produk"),
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setFormTarget(null)}>
          <Plus /> Tambah Produk
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : products && products.length > 0 ? (
        <div className="space-y-2">
          {products.map((product) => (
            <Card key={product.id} className="p-4">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 px-0">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 border-border/60 bg-muted">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} fill className="object-cover" unoptimized />
                    ) : (
                      <ImageOff className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.category?.name ?? "Tanpa kategori"} · {formatRupiah(product.price)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={product.stock > 0 ? "outline" : "destructive"}>
                    Stok {product.stock}
                  </Badge>
                  <Badge variant={product.isActive ? "success" : "secondary"}>
                    {product.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => setFormTarget(product)}>
                    <Pencil /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setDeleteTarget(product)}>
                    <Trash2 /> Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={Boxes}
            title="Belum ada produk"
            description="Tambahkan produk pertama untuk mulai berjualan."
            action={
              <Button size="sm" onClick={() => setFormTarget(null)}>
                <Plus /> Tambah Produk
              </Button>
            }
          />
        </Card>
      )}

      <ProductFormDialog
        open={formTarget !== undefined}
        onOpenChange={(open) => !open && setFormTarget(undefined)}
        product={formTarget}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Hapus ${deleteTarget?.name}?`}
        description="Produk yang sudah pernah dipesan tidak bisa dihapus — nonaktifkan saja lewat tombol edit."
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
      />
    </div>
  );
}
