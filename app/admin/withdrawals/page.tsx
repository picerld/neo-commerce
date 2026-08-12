import WithdrawalsContainer from "@/app/features/withdrawals/components/WithdrawalsContainer";

export default function AdminWithdrawalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-extrabold tracking-tight">Penarikan</h2>
        <p className="text-sm text-muted-foreground">Catat penarikan saldo platform ke rekening toko.</p>
      </div>
      <WithdrawalsContainer />
    </div>
  );
}
