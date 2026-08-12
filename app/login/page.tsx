import AuthHero from "@/app/features/auth/components/AuthHero";
import LoginScreen from "@/app/features/auth/components/LoginScreen";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <AuthHero />
      <div className="relative flex items-center justify-center overflow-hidden bg-background p-6">
        <div className="relative z-10 w-full">
          <LoginScreen />
        </div>
      </div>
    </main>
  );
}
