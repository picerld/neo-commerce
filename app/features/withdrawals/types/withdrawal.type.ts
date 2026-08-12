export type WithdrawalRecordSummary = {
  id: string;
  amount: number;
  note: string | null;
  createdAt: string;
  admin: { id: string; name: string };
};

export type WithdrawalsResponse = {
  records: WithdrawalRecordSummary[];
  available: number;
};

export type CreateWithdrawalRequest = {
  amount: number;
  note: string;
};
