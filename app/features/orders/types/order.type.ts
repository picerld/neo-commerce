export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled"
  | "expired"
  | "refunded";

export type PaymentStatus = "pending" | "settlement" | "capture" | "deny" | "cancel" | "expire" | "refund" | "partial_refund";

export type OrderItemSummary = {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  price: number;
  quantity: number;
  subtotal: number;
};

export type PaymentSummary = {
  status: PaymentStatus;
  paymentType: string | null;
  snapToken: string | null;
  redirectUrl: string | null;
  vaNumber: string | null;
  paidAt: string | null;
  expiredAt: string | null;
};

export type OrderSummary = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  itemCount: number;
  createdAt: string;
  paidAt: string | null;
  customer?: { id: string; name: string; email: string };
};

export type OrderDetail = OrderSummary & {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  trackingNumber: string | null;
  items: OrderItemSummary[];
  payment: PaymentSummary | null;
};

export type CheckoutRequest = {
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
};

export type CheckoutResponse = {
  order: OrderDetail;
  snapToken: string | null;
};

export type UpdateOrderStatusRequest = {
  status: Extract<OrderStatus, "processing" | "shipped" | "completed" | "refunded">;
  trackingNumber?: string;
};
