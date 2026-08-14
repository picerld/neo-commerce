import AuthHero from "./AuthHero";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <AuthHero />
      <div className="relative flex items-center justify-center overflow-hidden bg-background p-6">
        <div className="relative z-10 w-full">{children}</div>
      </div>
    </main>
  );
}
