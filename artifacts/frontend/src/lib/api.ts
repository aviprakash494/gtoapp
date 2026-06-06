import axios from "axios";

const TOKEN_KEY = "globetrek_token";

export const apiClient = axios.create({ baseURL: "/" });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const auth = {
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  getToken: () => localStorage.getItem(TOKEN_KEY),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
};

export type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
};

export type University = {
  _id: string;
  name: string;
  country: string;
  course: string;
  applicationFee: number;
  description?: string;
  createdAt: string;
};

export type Application = {
  _id: string;
  student: User;
  university: University;
  status: "pending" | "under_review" | "accepted" | "rejected";
  statement?: string;
  paymentStatus: "unpaid" | "paid";
  createdAt: string;
};

export type Payment = {
  _id: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: "created" | "succeeded" | "failed";
  application: Application;
  createdAt: string;
};
