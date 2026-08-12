"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import SectionHeading from "@/components/shared/SectionHeading";
import { formatRupiah } from "@/lib/utils";
import { useGetMe } from "@/app/features/auth/api/getMe";
import { useGetCart } from "@/app/features/cart/api/getCart";
import { useCheckout } from "@/app/features/orders/api/checkout";
import { checkoutFormSchema } from "@/app/features/orders/forms/checkout";
import { useMidtransSnap } from "../hooks/useMidtransSnap";

export default function CheckoutForm() {
  const router = useRouter();
  const { data: me } = useGetMe();
  const { data: cart, isLoading: cartLoading } = useGetCart();
  const { pay } = useMidtransSnap();

  const checkoutMutation = useCheckout({
    mutationConfig: {
      onSuccess: ({ order, snapToken }) => {
        if (!snapToken) {
          toast.error("Gagal membuat pembayaran, coba lagi dari halaman pesanan");
          router.push(`/orders/${order.id}`);
          return;
        }
        pay(snapToken, {
          onSuccess: () => router.push(`/orders/${order.id}`),
          onPending: () => router.push(`/orders/${order.id}`),
          onError: () => {
            toast.error("Pembayaran gagal, silakan coba lagi");
            router.push(`/orders/${order.id}`);
          },
          onClose: () => router.push(`/orders/${order.id}`),
        });
      },
      onError: (error) => toast.error(error.message || "Gagal membuat pesanan"),
    },
  });

  const form = useForm({
    defaultValues: { recipientName: me?.name ?? "", recipientPhone: me?.phone ?? "", shippingAddress: me?.address ?? "" },
    validators: { onSubmit: checkoutFormSchema },
    onSubmit: async ({ value }) => checkoutMutation.mutate(value),
  });

  React.useEffect(() => {
    if (!me) return;
    form.reset({ recipientName: me.name, recipientPhone: me.phone ?? "", shippingAddress: me.address ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  if (cartLoading || !cart) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 lg:col-span-2" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <SectionHeading>Alamat Pengiriman</SectionHeading>
        <Card className="p-5">
          <CardContent className="px-0">
            <form
              id="checkout-form"
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                event.stopPropagation();
                await form.handleSubmit();
              }}
            >
              <FieldGroup>
                <form.Field name="recipientName">
                  {(field) => {
                    const errors = field.state.meta.errors;
                    const isInvalid = field.state.meta.isTouched && errors.length > 0;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Nama Penerima</FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={checkoutMutation.isPending}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && <FieldError errors={errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="recipientPhone">
                  {(field) => {
                    const errors = field.state.meta.errors;
                    const isInvalid = field.state.meta.isTouched && errors.length > 0;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Nomor HP</FieldLabel>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={checkoutMutation.isPending}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && <FieldError errors={errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="shippingAddress">
                  {(field) => {
                    const errors = field.state.meta.errors;
                    const isInvalid = field.state.meta.isTouched && errors.length > 0;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Alamat Lengkap</FieldLabel>
                        <Textarea
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={checkoutMutation.isPending}
                          aria-invalid={isInvalid}
                          placeholder="Nama jalan, nomor rumah, kelurahan, kecamatan, kota, kode pos"
                        />
                        {isInvalid && <FieldError errors={errors} />}
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="h-fit space-y-3 lg:sticky lg:top-20">
        <SectionHeading>Ringkasan</SectionHeading>
        <Card className="p-5">
          <CardContent className="space-y-3 px-0">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="min-w-0 truncate pr-2 text-muted-foreground">
                  {item.productName} × {item.quantity}
                </span>
                <span className="shrink-0 font-semibold">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
            <div className="space-y-1 border-t border-border/60 pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatRupiah(cart.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ongkos Kirim</span>
                <span>{formatRupiah(15000)}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 text-base font-bold">
                <span>Total</span>
                <span>{formatRupiah(cart.total + 15000)}</span>
              </div>
            </div>
            <Button type="submit" form="checkout-form" className="w-full" size="lg" disabled={checkoutMutation.isPending}>
              <CreditCard className="size-4" />
              {checkoutMutation.isPending ? "Memproses..." : "Bayar Sekarang"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
