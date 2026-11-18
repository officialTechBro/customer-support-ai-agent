export interface Order {
  orderId: string;
  customerId: string;
  status: string;
  amount: number;
  deliveryDate: string | undefined;
}

const orders: Order[] = [
  {
    orderId: "ORD-101",
    customerId: "CUS-001",
    status: "delivered",
    amount: 15000,
    deliveryDate: "2026-11-10",
  },
  {
    orderId: "ORD-102",
    customerId: "CUS-001",
    status: "shipped",
    amount: 25000,
    deliveryDate: "2026-11-16",
  },
  {
    orderId: "ORD-103",
    customerId: "CUS-001",
    status: "processing",
    amount: 35000,
    deliveryDate: "2026-11-20",
  },
];

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  return orders.filter(
    order => order.customerId === customerId
  );
}

export async function getCustomerOrderById(orderId: string, customerId: string): Promise<Order | undefined> {
  return orders.find(
    order =>
      order.orderId === orderId &&
      order.customerId === customerId
  );
}