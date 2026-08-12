import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "../types/order.type";

const STATUS_CONFIG: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" }> = {
  pending_payment: { label: "Menunggu Pembayaran", variant: "warning" },
  paid: { label: "Dibayar", variant: "success" },
  processing: { label: "Diproses", variant: "default" },
  shipped: { label: "Dikirim", variant: "default" },
  completed: { label: "Selesai", variant: "success" },
  cancelled: { label: "Dibatalkan", variant: "secondary" },
  expired: { label: "Kedaluwarsa", variant: "secondary" },
  refunded: { label: "Direfund", variant: "destructive" },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
