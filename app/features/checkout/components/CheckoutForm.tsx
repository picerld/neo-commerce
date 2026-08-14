"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { CreditCard, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import SectionHeading from "@/components/shared/SectionHeading";
import LocationPickerDialog from "@/components/shared/LocationPickerDialog";
import { cn, formatRupiah } from "@/lib/utils";
import { useGetMe } from "@/app/features/auth/api/getMe";
import { useGetCart } from "@/app/features/cart/api/getCart";
import { useCheckout } from "@/app/features/orders/api/checkout";
import { checkoutFormSchema } from "@/app/features/orders/forms/checkout";
import { COURIER_OPTIONS, getCourierByCode } from "@/lib/shipping/couriers";

export default function CheckoutForm() {
  const router = useRouter();
  const { data: me } = useGetMe();
  const { data: cart, isLoading: cartLoading } = useGetCart();
  const [mapOpen, setMapOpen] = React.useState(false);

  // Payment happens on the order detail page (embedded Snap form there),
  // not a popup here — one consistently-styled place to pay instead of a
  // plain Midtrans popup immediately on top of checkout.
  const checkoutMutation = useCheckout({
    mutationConfig: {
      onSuccess: ({ order, snapToken }) => {
        if (!snapToken) toast.error("Gagal membuat pembayaran, coba lagi dari halaman pesanan");
        router.push(`/orders/${order.id}`);
      },
      onError: (error) => toast.error(error.message || "Gagal membuat pesanan"),
    },
  });

  const form = useForm({
    defaultValues: {
      recipientName: me?.name ?? "",
      recipientPhone: me?.phone ?? "",
      shippingAddress: me?.address ?? "",
      courierCode: "",
    },
    validators: { onSubmit: checkoutFormSchema },
    onSubmit: async ({ value }) => checkoutMutation.mutate(value),
  });

  React.useEffect(() => {
    if (!me) return;
    form.reset({
      recipientName: me.name,
      recipientPhone: me.phone ?? "",
      shippingAddress: me.address ?? "",
      courierCode: "",
    });
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
    <div className="animate-fade-in-up grid gap-6 lg:grid-cols-3">
      <div className="space-y-3 lg:col-span-2">
        <SectionHeading>Alamat Pengiriman</SectionHeading>
        <Card className="rounded-2xl p-5">
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
                        <div className="flex items-center justify-between gap-2">
                          <FieldLabel htmlFor={field.name}>Alamat Lengkap</FieldLabel>
                          <button
                            type="button"
                            onClick={() => setMapOpen(true)}
                            className="press-shadow flex shrink-0 items-center gap-1 rounded-full border-2 border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary/15"
                          >
                            <MapPin className="size-3.5" /> Pilih di Peta
                          </button>
                        </div>
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
                        <LocationPickerDialog
                          open={mapOpen}
                          onOpenChange={setMapOpen}
                          onConfirm={({ address }) => field.handleChange(address)}
                        />
                      </Field>
                    );
                  }}
                </form.Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <SectionHeading>Pilih Kurir</SectionHeading>
        <Card className="rounded-2xl p-5">
          <CardContent className="px-0">
            <form.Field name="courierCode">
              {(field) => {
                const errors = field.state.meta.errors;
                const isInvalid = errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="space-y-2">
                      {COURIER_OPTIONS.map((courier) => {
                        const selected = field.state.value === courier.code;
                        return (
                          <button
                            key={courier.code}
                            type="button"
                            onClick={() => field.handleChange(courier.code)}
                            disabled={checkoutMutation.isPending}
                            className={cn(
                              "press-shadow flex w-full items-center justify-between gap-3 rounded-xl border-2 p-3 text-left transition-colors",
                              selected
                                ? "border-primary bg-accent shadow-[0_2px_0_0_var(--border)]"
                                : "border-border/60 hover:bg-muted",
                            )}
                          >
                            <span
                              className={cn(
                                "flex size-4.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                selected ? "border-primary bg-primary" : "border-border",
                              )}
                            >
                              {selected && <span className="size-1.5 rounded-full bg-primary-foreground" />}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-bold">
                                {courier.name} {courier.service}
                              </span>
                              <span className="text-xs text-muted-foreground">{courier.etaLabel}</span>
                            </span>
                            <span className="shrink-0 text-sm font-bold">{formatRupiah(courier.price)}</span>
                          </button>
                        );
                      })}
                    </div>
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </CardContent>
        </Card>
      </div>

      <div className="h-fit space-y-3 lg:sticky lg:top-20">
        <SectionHeading>Ringkasan</SectionHeading>
        <Card className="rounded-2xl p-5">
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
              <form.Subscribe selector={(state) => state.values.courierCode}>
                {(courierCode) => {
                  const shippingFee = getCourierByCode(courierCode)?.price ?? 0;
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ongkos Kirim</span>
                        <span>{shippingFee ? formatRupiah(shippingFee) : "Pilih kurir"}</span>
                      </div>
                      <div className="flex justify-between border-t border-border/60 pt-2 text-base font-bold">
                        <span>Total</span>
                        <span>{formatRupiah(cart.total + shippingFee)}</span>
                      </div>
                    </>
                  );
                }}
              </form.Subscribe>
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
