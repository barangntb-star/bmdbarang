export type Role = 'ADMIN' | 'PRINCIPAL';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: Role;
  schoolName?: string;
  createdAt: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  acquisitionDate: string;
  quantity: number;
  provider: string;
  specifications: string;
  documentUrl?: string;
  imageUrl?: string;
  unitPrice?: number;
  createdAt: string;
}

export type ProcurementStatus = 'PENDING' | 'APPROVED' | 'DELIVERED' | 'COMPLETED';

export interface Procurement {
  id: string;
  requesterId: string;
  schoolName: string;
  items: {
    itemId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: ProcurementStatus;
  documentUrl?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}
