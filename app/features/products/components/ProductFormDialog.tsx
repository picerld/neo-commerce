"use client";

import * as React from "react";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useGetCategories } from "@/app/features/categories/api/getCategories";
import { useCreateProduct } from "../api/createProduct";
import { useUpdateProduct } from "../api/updateProduct";
import { productFormSchema } from "../forms/product";
import type { ProductSummary } from "../types/product.type";

type ProductFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present = editing this product; absent = creating a new one. */
  product?: ProductSummary | null;
};

const NO_CATEGORY = "__none__";

export default function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const isEdit = !!product;
  const { data: categories } = useGetCategories();

  const createMutation = useCreateProduct({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Produk dibuat");
        onOpenChange(false);
      },
      onError: (error) => toast.error(error.message || "Gagal membuat produk"),
    },
  });

  const updateMutation = useUpdateProduct({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Produk diupdate");
        onOpenChange(false);
      },
      onError: (error) => toast.error(error.message || "Gagal mengupdate produk"),
    },
  });

  const pending = createMutation.isPending || updateMutation.isPending;

  const form = useForm({
    defaultValues: {
      name: "",
      categoryId: NO_CATEGORY,
      description: "",
      price: 0,
      stock: 0,
      imageUrl: "",
      isActive: true,
    },
    validators: { onSubmit: productFormSchema },
    onSubmit: async ({ value }) => {
      const payload = { ...value, categoryId: value.categoryId === NO_CATEGORY ? null : value.categoryId };
      if (isEdit && product) {
        updateMutation.mutate({ id: product.id, ...payload });
      } else {
        createMutation.mutate(payload);
      }
    },
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset({
      name: product?.name ?? "",
      categoryId: product?.category?.id ?? NO_CATEGORY,
      description: product?.description ?? "",
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      imageUrl: product?.imageUrl ?? "",
      isActive: product?.isActive ?? true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit produk" : "Tambah produk"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui detail produk ini." : "Isi detail produk baru untuk ditambahkan ke katalog."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-6"
          onSubmit={async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="name">
              {(field) => {
                const errors = field.state.meta.errors;
                const isInvalid = field.state.meta.isTouched && errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Nama Produk</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={pending}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="categoryId">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Kategori</FieldLabel>
                  <Select value={field.state.value} onValueChange={field.handleChange} disabled={pending}>
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_CATEGORY}>Tanpa kategori</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Deskripsi</FieldLabel>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={pending}
                  />
                </Field>
              )}
            </form.Field>

            <div className="grid grid-cols-2 gap-4">
              <form.Field name="price">
                {(field) => {
                  const errors = field.state.meta.errors;
                  const isInvalid = field.state.meta.isTouched && errors.length > 0;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Harga (Rp)</FieldLabel>
                      <Input
                        id={field.name}
                        type="number"
                        min={0}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        disabled={pending}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && <FieldError errors={errors} />}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="stock">
                {(field) => {
                  const errors = field.state.meta.errors;
                  const isInvalid = field.state.meta.isTouched && errors.length > 0;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Stok</FieldLabel>
                      <Input
                        id={field.name}
                        type="number"
                        min={0}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        disabled={pending}
                        aria-invalid={isInvalid}
                      />
                      {isInvalid && <FieldError errors={errors} />}
                    </Field>
                  );
                }}
              </form.Field>
            </div>

            <form.Field name="imageUrl">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>URL Gambar</FieldLabel>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={pending}
                    placeholder="https://..."
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="isActive">
              {(field) => (
                <Field className="flex-row items-center justify-between rounded-lg border-2 border-border/60 px-3.5 py-3">
                  <div>
                    <FieldLabel htmlFor={field.name}>Aktif</FieldLabel>
                    <p className="text-xs text-muted-foreground">Produk nonaktif tidak tampil di katalog.</p>
                  </div>
                  <Switch id={field.name} checked={field.state.value} onCheckedChange={field.handleChange} disabled={pending} />
                </Field>
              )}
            </form.Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Menyimpan..." : isEdit ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
