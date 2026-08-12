import AdminShell from "@/components/layout/AdminShell";
import { requirePageRole } from "@/lib/auth/session";

export default async function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  await requirePageRole("admin");
  return <AdminShell>{children}</AdminShell>;
}
