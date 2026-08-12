export type CartItemSummary = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImageUrl: string | null;
  price: number;
  stock: number;
  isActive: boolean;
  quantity: number;
  subtotal: number;
};

export type CartResponse = {
  items: CartItemSummary[];
  itemCount: number;
  total: number;
};

export type AddToCartRequest = {
  productId: string;
  quantity: number;
};

export type UpdateCartItemRequest = {
  quantity: number;
};
