"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useRegister } from "../api/register";
import { registerFormSchema } from "../forms/auth";

export default function RegisterScreen() {
  const router = useRouter();

  const registerMutation = useRegister({
    mutationConfig: {
      onSuccess: (data) => {
        toast.success(`Akun dibuat, selamat datang ${data.name}!`);
        router.push("/");
        router.refresh();
      },
      onError: (error) => toast.error(error.message || "Gagal membuat akun"),
    },
  });

  const form = useForm({
    defaultValues: { name: "", email: "", phone: "", password: "" },
    validators: { onSubmit: registerFormSchema },
    onSubmit: async ({ value }) => registerMutation.mutate(value),
  });

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Daftar Akun</h1>
        <p className="mt-2 text-muted-foreground">Buat akun untuk mulai belanja.</p>
      </div>

      <Card className="p-6">
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
                    <FieldLabel htmlFor={field.name}>Nama</FieldLabel>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={registerMutation.isPending}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="email">
              {(field) => {
                const errors = field.state.meta.errors;
                const isInvalid = field.state.meta.isTouched && errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={registerMutation.isPending}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="phone">
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
                      disabled={registerMutation.isPending}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="password">
              {(field) => {
                const errors = field.state.meta.errors;
                const isInvalid = field.state.meta.isTouched && errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <Input
                      id={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={registerMutation.isPending}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>

          <Button type="submit" disabled={registerMutation.isPending} className="w-full">
            {registerMutation.isPending ? (
              "Memproses..."
            ) : (
              <>
                <UserPlus className="size-4" /> Daftar
              </>
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Masuk
          </Link>
        </p>
      </Card>
    </div>
  );
}
