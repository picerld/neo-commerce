import AuthLayout from "@/app/features/auth/components/AuthLayout";
import RegisterScreen from "@/app/features/auth/components/RegisterScreen";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <RegisterScreen />
    </AuthLayout>
  );
}
