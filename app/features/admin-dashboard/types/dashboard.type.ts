import type { OrderStatus, OrderSummary } from "@/app/features/orders/types/order.type";
import type { ProductSummary } from "@/app/features/products/types/product.type";

export type DashboardResponse = {
  balance: {
    revenue: number;
    refunded: number;
    withdrawn: number;
    available: number;
  };
  orderCounts: Partial<Record<OrderStatus, number>>;
  lowStockProducts: ProductSummary[];
  recentOrders: OrderSummary[];
};
