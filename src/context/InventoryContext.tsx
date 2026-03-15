import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// ========== Types ==========

export type UserRole = 'Admin' | 'Manager' | 'Staff';
export type StockAction = 'Added' | 'Updated' | 'Removed' | 'Purchased' | 'Sold';

export interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  location: string;       // e.g. "A-03-B"
  expiryDate: string;     // ISO date
  mfgDate: string;        // ISO date
  barcode: string;        // unique code
  minStock: number;       // minimum stock level
  imageUrl: string;       // product image
  avgDailySales: number;  // for demand prediction
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  totalOrders: number;
  onTimeDeliveries: number;
  rating: number; // 1-5
}

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  lastActive: string;
  status: 'Active' | 'Inactive';
}

export interface MovementRecord {
  id: number;
  productId: number;
  productName: string;
  action: StockAction;
  quantityChange: number;
  date: string;
  user: string;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  items: number;
  total: string;
  date: string;
  status: 'Delivered' | 'Pending' | 'In Transit' | 'Cancelled';
}

// ========== Permissions ==========

export const rolePermissions: Record<UserRole, string[]> = {
  Admin: ['manage_users', 'manage_suppliers', 'manage_products', 'manage_orders', 'view_reports', 'import_csv', 'full_access'],
  Manager: ['manage_products', 'manage_orders', 'view_reports'],
  Staff: ['view_inventory'],
};

export const hasPermission = (role: UserRole, permission: string): boolean => {
  return rolePermissions[role].includes(permission) || rolePermissions[role].includes('full_access');
};

// ========== Initial Data ==========

const today = new Date();
const d = (offset: number) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + offset);
  return dt.toISOString().split('T')[0];
};

const initialProducts: Product[] = [
  { id: 1, name: 'Basmati Rice 5kg', category: 'Groceries', quantity: 150, price: 320, supplier: 'Sharma Traders', status: 'In Stock', location: 'A-01-A', expiryDate: d(90), mfgDate: d(-60), barcode: 'GRC-001-2024', minStock: 30, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&h=80&fit=crop', avgDailySales: 5 },
  { id: 2, name: 'Toor Dal 1kg', category: 'Groceries', quantity: 8, price: 140, supplier: 'Patel Wholesale', status: 'Low Stock', location: 'A-01-B', expiryDate: d(5), mfgDate: d(-120), barcode: 'GRC-002-2024', minStock: 20, imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=80&h=80&fit=crop', avgDailySales: 3 },
  { id: 3, name: 'Sunflower Oil 1L', category: 'Groceries', quantity: 200, price: 180, supplier: 'Singh Supplies', status: 'In Stock', location: 'A-02-A', expiryDate: d(180), mfgDate: d(-30), barcode: 'GRC-003-2024', minStock: 25, imageUrl: 'https://images.unsplash.com/photo-1474979266404-7f28db3f3c9b?w=80&h=80&fit=crop', avgDailySales: 4 },
  { id: 4, name: 'Wheat Flour 10kg', category: 'Groceries', quantity: 0, price: 450, supplier: 'Sharma Traders', status: 'Out of Stock', location: 'A-02-B', expiryDate: d(60), mfgDate: d(-90), barcode: 'GRC-004-2024', minStock: 15, imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=80&h=80&fit=crop', avgDailySales: 3 },
  { id: 5, name: 'Sugar 5kg', category: 'Groceries', quantity: 95, price: 225, supplier: 'Patel Wholesale', status: 'In Stock', location: 'A-03-A', expiryDate: d(365), mfgDate: d(-10), barcode: 'GRC-005-2024', minStock: 20, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=80&h=80&fit=crop', avgDailySales: 2 },
  { id: 6, name: 'Wireless Keyboard MK-200', category: 'Electronics', quantity: 45, price: 1299, supplier: 'Gupta Electronics', status: 'In Stock', location: 'B-01-A', expiryDate: '', mfgDate: d(-180), barcode: 'ELC-001-2024', minStock: 10, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=80&h=80&fit=crop', avgDailySales: 1 },
  { id: 7, name: 'USB-C Hub 7-in-1', category: 'Electronics', quantity: 5, price: 2499, supplier: 'Gupta Electronics', status: 'Low Stock', location: 'B-01-B', expiryDate: '', mfgDate: d(-90), barcode: 'ELC-002-2024', minStock: 15, imageUrl: 'https://images.unsplash.com/photo-1625723044792-44de16100294?w=80&h=80&fit=crop', avgDailySales: 2 },
  { id: 8, name: 'LED Monitor 24"', category: 'Electronics', quantity: 28, price: 12999, supplier: 'Reddy Distributors', status: 'In Stock', location: 'B-02-A', expiryDate: '', mfgDate: d(-365), barcode: 'ELC-003-2024', minStock: 5, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=80&h=80&fit=crop', avgDailySales: 0.5 },
  { id: 9, name: 'Bluetooth Speaker', category: 'Electronics', quantity: 0, price: 1899, supplier: 'Gupta Electronics', status: 'Out of Stock', location: 'B-02-B', expiryDate: '', mfgDate: d(-200), barcode: 'ELC-004-2024', minStock: 8, imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=80&h=80&fit=crop', avgDailySales: 1 },
  { id: 10, name: 'Webcam HD 1080p', category: 'Electronics', quantity: 62, price: 2199, supplier: 'Reddy Distributors', status: 'In Stock', location: 'B-03-A', expiryDate: '', mfgDate: d(-150), barcode: 'ELC-005-2024', minStock: 10, imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=80&h=80&fit=crop', avgDailySales: 1 },
  { id: 11, name: 'A4 Paper Bundle (500)', category: 'Stationery', quantity: 3, price: 350, supplier: 'Jain Enterprises', status: 'Low Stock', location: 'C-01-A', expiryDate: '', mfgDate: d(-30), barcode: 'STN-001-2024', minStock: 25, imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=80&h=80&fit=crop', avgDailySales: 4 },
  { id: 12, name: 'Ball Pen (Pack of 10)', category: 'Stationery', quantity: 120, price: 80, supplier: 'Jain Enterprises', status: 'In Stock', location: 'C-01-B', expiryDate: '', mfgDate: d(-60), barcode: 'STN-002-2024', minStock: 20, imageUrl: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=80&h=80&fit=crop', avgDailySales: 3 },
  { id: 13, name: 'Spiral Notebook A5', category: 'Stationery', quantity: 200, price: 60, supplier: 'Verma Industries', status: 'In Stock', location: 'C-02-A', expiryDate: '', mfgDate: d(-45), barcode: 'STN-003-2024', minStock: 30, imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=80&h=80&fit=crop', avgDailySales: 5 },
  { id: 14, name: 'Sticky Notes (100 sheets)', category: 'Stationery', quantity: 75, price: 45, supplier: 'Jain Enterprises', status: 'In Stock', location: 'C-02-B', expiryDate: '', mfgDate: d(-20), barcode: 'STN-004-2024', minStock: 15, imageUrl: 'https://images.unsplash.com/photo-1572726729207-a78d6feb18d7?w=80&h=80&fit=crop', avgDailySales: 2 },
  { id: 15, name: 'Floor Cleaner 1L', category: 'Household Items', quantity: 90, price: 199, supplier: 'Nair Trading Co.', status: 'In Stock', location: 'A-03-B', expiryDate: d(365), mfgDate: d(-60), barcode: 'HHD-001-2024', minStock: 15, imageUrl: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=80&h=80&fit=crop', avgDailySales: 1 },
  { id: 16, name: 'Dish Soap 500ml', category: 'Household Items', quantity: 7, price: 89, supplier: 'Singh Supplies', status: 'Low Stock', location: 'B-03-B', expiryDate: d(3), mfgDate: d(-180), barcode: 'HHD-002-2024', minStock: 20, imageUrl: 'https://images.unsplash.com/photo-1622398925373-3f91b1e275f4?w=80&h=80&fit=crop', avgDailySales: 2 },
  { id: 17, name: 'Broom Set', category: 'Household Items', quantity: 35, price: 299, supplier: 'Nair Trading Co.', status: 'In Stock', location: 'C-03-A', expiryDate: '', mfgDate: d(-90), barcode: 'HHD-003-2024', minStock: 10, imageUrl: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=80&h=80&fit=crop', avgDailySales: 0.5 },
  { id: 18, name: 'Glass Cleaner 500ml', category: 'Household Items', quantity: 55, price: 145, supplier: 'Nair Trading Co.', status: 'In Stock', location: 'C-03-B', expiryDate: d(240), mfgDate: d(-30), barcode: 'HHD-004-2024', minStock: 10, imageUrl: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=80&h=80&fit=crop', avgDailySales: 1 },
  { id: 19, name: 'Cotton T-Shirt (M)', category: 'Clothing', quantity: 60, price: 499, supplier: 'Verma Industries', status: 'In Stock', location: 'A-02-C', expiryDate: '', mfgDate: d(-30), barcode: 'CLT-001-2024', minStock: 10, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop', avgDailySales: 2 },
  { id: 20, name: 'Denim Jeans (32)', category: 'Clothing', quantity: 0, price: 1299, supplier: 'Verma Industries', status: 'Out of Stock', location: 'A-03-C', expiryDate: '', mfgDate: d(-60), barcode: 'CLT-002-2024', minStock: 10, imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=80&h=80&fit=crop', avgDailySales: 1 },
  { id: 21, name: 'Formal Shirt (L)', category: 'Clothing', quantity: 40, price: 899, supplier: 'Verma Industries', status: 'In Stock', location: 'B-01-C', expiryDate: '', mfgDate: d(-45), barcode: 'CLT-003-2024', minStock: 8, imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=80&h=80&fit=crop', avgDailySales: 1 },
  { id: 22, name: 'Sports Shoes (9)', category: 'Clothing', quantity: 4, price: 2499, supplier: 'Reddy Distributors', status: 'Low Stock', location: 'B-02-C', expiryDate: '', mfgDate: d(-120), barcode: 'CLT-004-2024', minStock: 10, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop', avgDailySales: 1 },
];

const initialSuppliers: Supplier[] = [
  { id: 1, name: 'Sharma Traders', contactPerson: 'Rajesh Sharma', phone: '+91 9876543210', email: 'rajesh@sharmatraders.in', address: 'Delhi', totalOrders: 145, onTimeDeliveries: 138, rating: 4.5 },
  { id: 2, name: 'Gupta Electronics', contactPerson: 'Amit Gupta', phone: '+91 9123456780', email: 'amit@guptaelectronics.in', address: 'Mumbai', totalOrders: 98, onTimeDeliveries: 89, rating: 4.2 },
  { id: 3, name: 'Patel Wholesale', contactPerson: 'Mehul Patel', phone: '+91 9812345678', email: 'mehul@patelwholesale.in', address: 'Ahmedabad', totalOrders: 210, onTimeDeliveries: 195, rating: 4.0 },
  { id: 4, name: 'Singh Supplies', contactPerson: 'Harpreet Singh', phone: '+91 9988776655', email: 'harpreet@singhsupplies.in', address: 'Chandigarh', totalOrders: 67, onTimeDeliveries: 62, rating: 4.3 },
  { id: 5, name: 'Verma Industries', contactPerson: 'Sanjay Verma', phone: '+91 9876123456', email: 'sanjay@vermaindustries.in', address: 'Pune', totalOrders: 120, onTimeDeliveries: 108, rating: 3.8 },
  { id: 6, name: 'Reddy Distributors', contactPerson: 'Krishna Reddy', phone: '+91 9654321098', email: 'krishna@reddydist.in', address: 'Hyderabad', totalOrders: 85, onTimeDeliveries: 80, rating: 4.6 },
  { id: 7, name: 'Jain Enterprises', contactPerson: 'Pooja Jain', phone: '+91 9543216789', email: 'pooja@jainenterprises.in', address: 'Jaipur', totalOrders: 156, onTimeDeliveries: 148, rating: 4.4 },
  { id: 8, name: 'Nair Trading Co.', contactPerson: 'Anil Nair', phone: '+91 9432167890', email: 'anil@nairtrading.in', address: 'Kochi', totalOrders: 73, onTimeDeliveries: 70, rating: 4.7 },
];

const initialUsers: AppUser[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@ims.com', role: 'Admin', department: 'Management', lastActive: '2 min ago', status: 'Active' },
  { id: 2, name: 'Priya Singh', email: 'priya.singh@ims.com', role: 'Manager', department: 'Procurement', lastActive: '1 hour ago', status: 'Active' },
  { id: 3, name: 'Amit Gupta', email: 'amit.gupta@ims.com', role: 'Staff', department: 'Warehouse', lastActive: '3 hours ago', status: 'Active' },
  { id: 4, name: 'Mehul Patel', email: 'mehul.patel@ims.com', role: 'Staff', department: 'Inventory', lastActive: '1 day ago', status: 'Active' },
  { id: 5, name: 'Sneha Reddy', email: 'sneha.reddy@ims.com', role: 'Manager', department: 'Sales', lastActive: '2 days ago', status: 'Inactive' },
  { id: 6, name: 'Vikram Nair', email: 'vikram.nair@ims.com', role: 'Staff', department: 'Logistics', lastActive: '5 hours ago', status: 'Active' },
];

const initialMovements: MovementRecord[] = [
  { id: 1, productId: 1, productName: 'Basmati Rice 5kg', action: 'Added', quantityChange: 100, date: d(-1), user: 'John Doe' },
  { id: 2, productId: 8, productName: 'LED Monitor 24"', action: 'Sold', quantityChange: -2, date: d(-1), user: 'Priya Singh' },
  { id: 3, productId: 11, productName: 'A4 Paper Bundle (500)', action: 'Updated', quantityChange: -22, date: d(-2), user: 'Amit Gupta' },
  { id: 4, productId: 6, productName: 'Wireless Keyboard MK-200', action: 'Purchased', quantityChange: 20, date: d(-2), user: 'Mehul Patel' },
  { id: 5, productId: 9, productName: 'Bluetooth Speaker', action: 'Removed', quantityChange: -15, date: d(-3), user: 'John Doe' },
  { id: 6, productId: 19, productName: 'Cotton T-Shirt (M)', action: 'Sold', quantityChange: -5, date: d(-3), user: 'Priya Singh' },
  { id: 7, productId: 3, productName: 'Sunflower Oil 1L', action: 'Added', quantityChange: 50, date: d(-4), user: 'Amit Gupta' },
  { id: 8, productId: 15, productName: 'Floor Cleaner 1L', action: 'Purchased', quantityChange: 30, date: d(-5), user: 'Mehul Patel' },
];

const initialOrders: PurchaseOrder[] = [
  { id: 'PO-2024-0847', supplier: 'Sharma Traders', items: 15, total: '₹48,500', date: '2024-03-12', status: 'Delivered' },
  { id: 'PO-2024-0846', supplier: 'Gupta Electronics', items: 8, total: '₹1,25,000', date: '2024-03-11', status: 'In Transit' },
  { id: 'PO-2024-0845', supplier: 'Patel Wholesale', items: 22, total: '₹32,800', date: '2024-03-10', status: 'Pending' },
  { id: 'PO-2024-0844', supplier: 'Singh Supplies', items: 10, total: '₹18,200', date: '2024-03-09', status: 'Delivered' },
  { id: 'PO-2024-0843', supplier: 'Verma Industries', items: 5, total: '₹67,500', date: '2024-03-08', status: 'Cancelled' },
  { id: 'PO-2024-0842', supplier: 'Reddy Distributors', items: 12, total: '₹89,000', date: '2024-03-07', status: 'Delivered' },
  { id: 'PO-2024-0841', supplier: 'Jain Enterprises', items: 30, total: '₹15,600', date: '2024-03-06', status: 'In Transit' },
  { id: 'PO-2024-0840', supplier: 'Nair Trading Co.', items: 18, total: '₹42,300', date: '2024-03-05', status: 'Delivered' },
];

// ========== Context ==========

interface InventoryContextType {
  products: Product[];
  suppliers: Supplier[];
  users: AppUser[];
  movements: MovementRecord[];
  orders: PurchaseOrder[];
  currentUser: AppUser;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
  setOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  addMovement: (m: Omit<MovementRecord, 'id'>) => void;
  addProducts: (newProducts: Omit<Product, 'id' | 'status'>[]) => void;
  getStatus: (qty: number, minStock: number) => Product['status'];
  lowStockProducts: Product[];
  expiringProducts: Product[];
  stockForecasts: { product: Product; daysRemaining: number }[];
  reorderSuggestions: { product: Product; suggestedQty: number; supplier: string }[];
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export const useInventory = () => {
  const ctx = useContext(InventoryContext);
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider');
  return ctx;
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [movements, setMovements] = useState<MovementRecord[]>(initialMovements);
  const [orders, setOrders] = useState<PurchaseOrder[]>(initialOrders);
  const currentUser = users[0]; // Admin by default

  const getStatus = (qty: number, minStock: number): Product['status'] => {
    if (qty === 0) return 'Out of Stock';
    if (qty <= minStock) return 'Low Stock';
    return 'In Stock';
  };

  const addMovement = useCallback((m: Omit<MovementRecord, 'id'>) => {
    setMovements(prev => [{ ...m, id: Date.now() }, ...prev]);
  }, []);

  const addProducts = useCallback((newProducts: Omit<Product, 'id' | 'status'>[]) => {
    const created = newProducts.map((p, i) => ({
      ...p,
      id: Date.now() + i,
      status: getStatus(p.quantity, p.minStock),
    } as Product));
    setProducts(prev => [...prev, ...created]);
    created.forEach(p => {
      addMovement({ productId: p.id, productName: p.name, action: 'Added', quantityChange: p.quantity, date: new Date().toISOString().split('T')[0], user: currentUser.name });
    });
  }, [addMovement, currentUser.name]);

  // Derived data
  const lowStockProducts = products.filter(p => p.quantity > 0 && p.quantity <= p.minStock);

  const expiringProducts = products.filter(p => {
    if (!p.expiryDate) return false;
    const diff = (new Date(p.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  const stockForecasts = products
    .filter(p => p.avgDailySales > 0 && p.quantity > 0)
    .map(p => ({ product: p, daysRemaining: Math.round(p.quantity / p.avgDailySales) }))
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 8);

  const reorderSuggestions = lowStockProducts.map(p => ({
    product: p,
    suggestedQty: Math.max(p.minStock * 3 - p.quantity, 20),
    supplier: p.supplier,
  }));

  return (
    <InventoryContext.Provider value={{
      products, suppliers, users, movements, orders, currentUser,
      setProducts, setSuppliers, setUsers, setOrders,
      addMovement, addProducts, getStatus,
      lowStockProducts, expiringProducts, stockForecasts, reorderSuggestions,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
