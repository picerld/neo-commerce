"use client";

import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { KeyRound, Mail, ShieldCheck, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorState from "@/components/shared/ErrorState";
import { useGetMe } from "../api/getMe";
import { useUpdateProfile } from "../api/updateProfile";
import { useChangePassword } from "../api/changePassword";
import { updateProfileFormSchema, changePasswordFormSchema } from "../forms/auth";
import type { UserSummary } from "../types/auth.type";

export default function ProfileScreen() {
  const { data: me, isLoading, isError, refetch } = useGetMe();

  if (isError) {
    return <ErrorState title="Gagal memuat profil" onRetry={() => refetch()} />;
  }

  if (isLoading || !me) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-40 lg:col-span-3" />
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="flex-row items-center gap-4 p-5 sm:p-6">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-secondary text-xl font-extrabold text-secondary-foreground shadow-[0_2px_0_0_var(--border)]">
          {me.name?.[0]?.toUpperCase() ?? "?"}
        </span>
        <div className="min-w-0">
          <p className="truncate font-heading text-lg font-extrabold tracking-tight">{me.name}</p>
          <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            <Mail className="size-3.5 shrink-0" /> {me.email}
          </p>
          <Badge variant="secondary" className="mt-1.5">
            <ShieldCheck className="size-3" /> {me.role === "admin" ? "Admin" : "Pelanggan"}
          </Badge>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfileInfoForm me={me} />
        </div>
        <ChangePasswordForm />
      </div>
    </div>
  );
}

function ProfileInfoForm({ me }: { me: UserSummary }) {
  const updateMutation = useUpdateProfile({
    mutationConfig: {
      onSuccess: () => toast.success("Profil berhasil diperbarui"),
      onError: (error) => toast.error(error.message || "Gagal memperbarui profil"),
    },
  });

  const form = useForm({
    defaultValues: { name: me.name, phone: me.phone ?? "", address: me.address ?? "" },
    validators: { onSubmit: updateProfileFormSchema },
    onSubmit: async ({ value }) => updateMutation.mutate(value),
  });

  return (
    <Card className="p-5 sm:p-6">
      <CardHeader className="mb-2 px-0">
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="size-4 text-primary" /> Info Akun
        </CardTitle>
        <CardDescription>Perbarui nama, nomor HP, dan alamat pengirimanmu.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form
          className="space-y-6"
          onSubmit={async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await form.handleSubmit();
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input value={me.email} disabled />
            </Field>

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
                      disabled={updateMutation.isPending}
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
                      disabled={updateMutation.isPending}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="address">
              {(field) => {
                const errors = field.state.meta.errors;
                const isInvalid = field.state.meta.isTouched && errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Alamat Pengiriman</FieldLabel>
                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={updateMutation.isPending}
                      aria-invalid={isInvalid}
                      placeholder="Nama jalan, nomor rumah, kota, kode pos"
                    />
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>

          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ChangePasswordForm() {
  const changePasswordMutation = useChangePassword({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Password berhasil diubah");
        form.reset();
      },
      onError: (error) => toast.error(error.message || "Gagal mengubah password"),
    },
  });

  const form = useForm({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    validators: { onSubmit: changePasswordFormSchema },
    onSubmit: async ({ value }) => changePasswordMutation.mutate(value),
  });

  return (
    <Card className="h-fit p-5 sm:p-6">
      <CardHeader className="mb-2 px-0">
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-4 text-primary" /> Ubah Password
        </CardTitle>
        <CardDescription>Gunakan password yang kuat dan tidak dipakai di tempat lain.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <form
          className="space-y-6"
          onSubmit={async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="currentPassword">
              {(field) => {
                const errors = field.state.meta.errors;
                const isInvalid = field.state.meta.isTouched && errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password Saat Ini</FieldLabel>
                    <Input
                      id={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={changePasswordMutation.isPending}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="newPassword">
              {(field) => {
                const errors = field.state.meta.errors;
                const isInvalid = field.state.meta.isTouched && errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Password Baru</FieldLabel>
                    <Input
                      id={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={changePasswordMutation.isPending}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="confirmPassword">
              {(field) => {
                const errors = field.state.meta.errors;
                const isInvalid = field.state.meta.isTouched && errors.length > 0;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Konfirmasi Password Baru</FieldLabel>
                    <Input
                      id={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={changePasswordMutation.isPending}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && <FieldError errors={errors} />}
                  </Field>
                );
              }}
            </form.Field>
          </FieldGroup>

          <Button type="submit" variant="outline" disabled={changePasswordMutation.isPending}>
            {changePasswordMutation.isPending ? "Menyimpan..." : "Ubah Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
