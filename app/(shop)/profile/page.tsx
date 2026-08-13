import ProfileScreen from "@/app/features/auth/components/ProfileScreen";
import PageContainer from "@/components/layout/PageContainer";
import { requirePageRole } from "@/lib/auth/session";

export default async function ProfilePage() {
  await requirePageRole("user");
  return (
    <PageContainer className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">Profil Saya</h1>
        <p className="text-sm text-muted-foreground">Kelola informasi akun dan keamanan login-mu.</p>
      </div>
      <ProfileScreen />
    </PageContainer>
  );
}
