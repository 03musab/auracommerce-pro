export interface User {
  _id: string;
  name: string;
  email: string;
  token?: string;
}

export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
  createdAt?: string;
}

export interface CartItem {
  _id: string; // The database cart item ID
  productId: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  _id?: string;
  customerName: string;
  address: string;
  mobile: string;
  items: OrderItem[];
  total: number;
  createdAt?: string;
}
