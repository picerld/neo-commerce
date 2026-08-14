"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLogin } from "../api/login";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [shake, setShake] = React.useState(false);

  const loginMutation = useLogin({
    mutationConfig: {
      onSuccess: (data) => {
        toast.success(`Selamat datang, ${data.name}!`);
        router.push(data.role === "admin" ? "/admin" : "/");
        router.refresh();
      },
      onError: (error) => {
        toast.error(error.message || "Email atau password salah");
        setShake(true);
        window.setTimeout(() => setShake(false), 400);
      },
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="mx-auto w-full max-w-sm animate-fade-in-up">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight">Masuk</h1>
        <p className="mt-2 text-muted-foreground">Masuk ke akun Neo Commerce kamu.</p>
      </div>

      <Card className={cn("rounded-2xl p-6", shake && "animate-shake")}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loginMutation.isPending} className="w-full">
            {loginMutation.isPending ? (
              "Memproses..."
            ) : (
              <>
                <LogIn className="size-4" /> Masuk
              </>
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Belum punya akun?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Daftar
          </Link>
        </p>
      </Card>
    </div>
  );
}
