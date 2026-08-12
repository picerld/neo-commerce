"use client";

import * as React from "react";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { PiggyBank, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import SectionHeading from "@/components/shared/SectionHeading";
import EmptyState from "@/components/shared/EmptyState";
import { formatRupiah } from "@/lib/utils";
import { useGetWithdrawals } from "../api/getWithdrawals";
import { useCreateWithdrawal } from "../api/createWithdrawal";
import { withdrawalFormSchema } from "../forms/withdrawal";

export default function WithdrawalsContainer() {
  const { data, isLoading } = useGetWithdrawals();

  const createMutation = useCreateWithdrawal({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Penarikan dicatat");
        form.reset();
      },
      onError: (error) => toast.error(error.message || "Gagal mencatat penarikan"),
    },
  });

  const form = useForm({
    defaultValues: { amount: 0, note: "" },
    validators: { onSubmit: withdrawalFormSchema },
    onSubmit: async ({ value }) => createMutation.mutate(value),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <SectionHeading>Riwayat Penarikan</SectionHeading>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : data && data.records.length > 0 ? (
          <div className="space-y-2">
            {data.records.map((record) => (
              <Card key={record.id} className="p-4">
                <CardContent className="flex items-center justify-between gap-2 px-0">
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{record.note || "Penarikan saldo"}</p>
                    <p className="text-xs text-muted-foreground">
                      {record.admin.name} · {new Date(record.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-destructive">-{formatRupiah(record.amount)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState icon={Wallet} title="Belum ada penarikan" description="Riwayat penarikan saldo akan muncul di sini." />
          </Card>
        )}
      </div>

      <div className="h-fit space-y-4 lg:sticky lg:top-6">
        <Card className="p-5">
          <CardContent className="space-y-1 px-0">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase">Saldo Tersedia</p>
              <PiggyBank className="size-4 text-muted-foreground" />
            </div>
            <p className="font-heading text-2xl font-extrabold">
              {isLoading || !data ? "..." : formatRupiah(data.available)}
            </p>
          </CardContent>
        </Card>

        <Card className="p-5">
          <CardContent className="px-0">
            <p className="mb-4 text-xs font-bold text-muted-foreground uppercase">Catat Penarikan</p>
            <form
              className="space-y-4"
              onSubmit={async (event) => {
                event.preventDefault();
                event.stopPropagation();
                await form.handleSubmit();
              }}
            >
              <FieldGroup>
                <form.Field name="amount">
                  {(field) => {
                    const errors = field.state.meta.errors;
                    const isInvalid = field.state.meta.isTouched && errors.length > 0;
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>Jumlah (Rp)</FieldLabel>
                        <Input
                          id={field.name}
                          type="number"
                          min={0}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(Number(e.target.value))}
                          disabled={createMutation.isPending}
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && <FieldError errors={errors} />}
                      </Field>
                    );
                  }}
                </form.Field>

                <form.Field name="note">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Catatan (opsional)</FieldLabel>
                      <Textarea
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={createMutation.isPending}
                        placeholder="mis. Transfer ke rekening toko"
                      />
                    </Field>
                  )}
                </form.Field>
              </FieldGroup>

              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Menyimpan..." : "Catat Penarikan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
