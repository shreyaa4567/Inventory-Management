import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

// ========== Types ==========

export type UserRole = 'Admin' | 'Manager' | 'Staff';
export type StockAction = 'Added' | 'Updated' | 'Removed' | 'Purchased' | 'Sold' | 'Imported' | 'Exported';

export interface Product {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  supplier: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  location: string;
  expiryDate: string;
  mfgDate: string;
  barcode: string;
  minStock: number;
  imageUrl: string;
  avgDailySales: number;
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
  totalDelivered?: number;
  onTimeCount?: number;
  onTimeDeliveryPercent?: number;
  rating: number;
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

export interface PurchaseOrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  items: number;
  total: string;
  date: string;
  status: 'Delivered' | 'Pending' | 'In Transit' | 'Cancelled';
  orderItems?: PurchaseOrderItem[];
}

export interface SupplierBillItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SupplierBill {
  id: string;
  supplierId: number;
  supplierName: string;
  items: SupplierBillItem[];
  grandTotal: number;
  date: string;
  createdBy: string;
}

export interface CustomerBillItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface CustomerBill {
  id: string;
  customerName: string;
  items: CustomerBillItem[];
  grandTotal: number;
  date: string;
  createdBy: string;
}

export type NotificationType = 'info' | 'warning' | 'success';

export interface AppNotification {
  id: number;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
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

// ========== Context ==========

interface InventoryContextType {
  products: Product[];
  suppliers: Supplier[];
  users: AppUser[];
  movements: MovementRecord[];
  orders: PurchaseOrder[];
  supplierBills: SupplierBill[];
  customerBills: CustomerBill[];
  notifications: AppNotification[];
  unreadCount: number;
  currentUser: AppUser | null;
  isLoading: boolean;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  setUsers: React.Dispatch<React.SetStateAction<AppUser[]>>;
  setOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  addMovement: (m: Omit<MovementRecord, 'id'>) => Promise<void>;
  addProducts: (newProducts: Omit<Product, 'id' | 'status'>[]) => Promise<void>;
  updateProduct: (id: number, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Promise<void>;
  updateSupplier: (id: number, updates: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: number) => Promise<void>;
  getStatus: (qty: number, minStock: number) => Product['status'];
  updateOrderStatus: (id: string, newStatus: PurchaseOrder['status']) => Promise<void>;
  createPurchaseOrder: (order: PurchaseOrder) => Promise<void>;
  addSupplierBill: (supplierId: number, supplierName: string, items: Omit<SupplierBillItem, 'total'>[]) => Promise<void>;
  addCustomerBill: (customerName: string, items: Omit<CustomerBillItem, 'total'>[]) => Promise<{ success: boolean; error?: string }>;
  addNotification: (message: string, type: NotificationType) => void;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
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

// Data mapping utilities
const mapProduct = (p: any): Product => ({
  id: p.id,
  name: p.name,
  category: p.category,
  quantity: p.quantity,
  price: Number(p.price),
  supplier: p.supplier_name || 'Unknown Supplier',
  status: p.status as any,
  location: p.location || '',
  expiryDate: p.expiry_date || '',
  mfgDate: '', 
  barcode: p.barcode || '',
  minStock: p.min_stock || 10,
  imageUrl: p.image_url || '',
  avgDailySales: 1
});

const mapSupplier = (s: any): Supplier => ({
  id: s.id,
  name: s.name,
  contactPerson: s.contact_person || '',
  phone: s.phone || '',
  email: s.email || '',
  address: '',
  totalOrders: s.total_orders || 0,
  onTimeDeliveries: Math.round(((s.on_time_count || 0) / Math.max(s.total_delivered || 1, 1)) * (s.total_orders || 1)), // Retroactively fitting the UI mock formula 
  totalDelivered: s.total_delivered || 0,
  onTimeCount: s.on_time_count || 0,
  onTimeDeliveryPercent: s.on_time_delivery || 0,
  rating: Number(s.rating) || 0
});

const mapUser = (u: any): AppUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role as any,
  department: u.department || '',
  lastActive: u.last_active || '',
  status: u.status as any
});

const mapMovement = (m: any): MovementRecord => ({
  id: m.id,
  productId: m.product_id,
  productName: m.product_name,
  action: m.action as any,
  quantityChange: m.quantity_change,
  date: m.date,
  user: m.user_name || ''
});

const mapOrder = (o: any): PurchaseOrder => ({
  id: o.id,
  supplier: o.supplier_name,
  items: o.items,
  total: o.total,
  date: o.date,
  status: o.status as any,
  orderItems: o.orderItems?.map((it: any) => ({
    productId: it.product_id,
    productName: it.product_name,
    quantity: it.quantity,
    price: Number(it.price),
    total: Number(it.total)
  }))
});

const mapSupplierBill = (b: any): SupplierBill => ({
  id: b.id,
  supplierId: b.supplier_id,
  supplierName: b.supplier_name,
  items: b.items?.map((it: any) => ({
    productId: it.product_id,
    productName: it.product_name,
    quantity: it.quantity,
    price: Number(it.price),
    total: Number(it.total)
  })) || [],
  grandTotal: Number(b.total_amount),
  date: b.date,
  createdBy: b.created_by
});

const mapCustomerBill = (b: any): CustomerBill => ({
  id: b.id,
  customerName: b.customer_name,
  items: b.items?.map((it: any) => ({
    productId: it.product_id,
    productName: it.product_name,
    quantity: it.quantity,
    price: Number(it.price),
    total: Number(it.total)
  })) || [],
  grandTotal: Number(b.total_amount),
  date: b.date,
  createdBy: b.created_by
});


export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [movements, setMovements] = useState<MovementRecord[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [supplierBills, setSupplierBills] = useState<SupplierBill[]>([]);
  const [customerBills, setCustomerBills] = useState<CustomerBill[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const currentUser = users.length > 0 ? users[0] : null;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        { data: prods },
        { data: supps },
        { data: usrs },
        { data: movs },
        { data: ords },
        { data: sBills },
        { data: cBills }
      ] = await Promise.all([
        supabase.from('products').select('*').order('id', { ascending: false }),
        supabase.from('suppliers').select('*').order('id', { ascending: true }),
        supabase.from('app_users').select('*').order('id', { ascending: true }),
        supabase.from('movement_records').select('*').order('id', { ascending: false }),
        supabase.from('purchase_orders').select(`*, orderItems:purchase_order_items(*)`).order('date', { ascending: false }),
        supabase.from('supplier_bills').select(`*, items:supplier_bill_items(*)`).order('date', { ascending: false }),
        supabase.from('customer_bills').select(`*, items:customer_bill_items(*)`).order('date', { ascending: false })
      ]);

      if (supps) setSuppliers(supps.map(mapSupplier));
      if (prods) setProducts(prods.map(mapProduct));
      if (movs) setMovements(movs.map(mapMovement));
      if (ords) setOrders(ords.map(mapOrder));
      if (sBills) setSupplierBills(sBills.map(mapSupplierBill));
      if (cBills) setCustomerBills(cBills.map(mapCustomerBill));

      // Handle users and default creation
      if (usrs && usrs.length > 0) {
        setUsers(usrs.map(mapUser));
      } else {
        const defaultUser = {
          name: 'Meena Kumar', email: 'meena.kumar@ims.com',
          role: 'Admin', department: 'Management', last_active: 'Just now', status: 'Active'
        };
        const { data: newUser } = await supabase.from('app_users').insert([defaultUser]).select();
        if (newUser) setUsers([mapUser(newUser[0])]);
      }

      // Initial Notifications based on loaded products
      const loadedProducts = prods ? prods.map(mapProduct) : [];
      const notifs: AppNotification[] = [];
      let nid = 1;
      const today = new Date();
      loadedProducts.forEach(p => {
        if (p.quantity > 0 && p.quantity <= p.minStock) {
          notifs.push({ id: nid++, message: `Low stock alert: ${p.name} only ${p.quantity} units remaining`, type: 'warning', timestamp: new Date().toISOString(), read: false });
        }
        if (p.expiryDate) {
          const diff = (new Date(p.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
          if (diff >= 0 && diff <= 7) {
            notifs.push({ id: nid++, message: `Product ${p.name} expiring in ${Math.ceil(diff)} day(s)`, type: 'warning', timestamp: new Date().toISOString(), read: false });
          }
        }
      });
      setNotifications(notifs);

    } catch (error) {
      console.error('Error fetching inventory data from Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const addNotification = useCallback((message: string, type: NotificationType) => {
    setNotifications(prev => [{ id: Date.now(), message, type, timestamp: new Date().toISOString(), read: false }, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const getStatus = (qty: number, minStock: number): Product['status'] => {
    if (qty === 0) return 'Out of Stock';
    if (qty <= minStock) return 'Low Stock';
    return 'In Stock';
  };

  const addMovement = useCallback(async (m: Omit<MovementRecord, 'id'>) => {
    const { data } = await supabase.from('movement_records').insert([{
      product_id: m.productId,
      product_name: m.productName,
      action: m.action,
      quantity_change: m.quantityChange,
      date: m.date,
      user_name: m.user
    }]).select();
    
    if (data) setMovements(prev => [mapMovement(data[0]), ...prev]);
  }, []);

  const addProducts = useCallback(async (newProducts: Omit<Product, 'id' | 'status'>[]) => {
    const payloads = newProducts.map(p => ({
      name: p.name,
      category: p.category,
      quantity: p.quantity,
      price: p.price,
      supplier_name: p.supplier,
      location: p.location,
      expiry_date: p.expiryDate || null,
      barcode: p.barcode,
      min_stock: p.minStock,
      image_url: p.imageUrl || null,
      status: getStatus(p.quantity, p.minStock)
    }));

    const { data } = await supabase.from('products').insert(payloads).select();

    if (data) {
      const created = data.map(mapProduct);
      setProducts(prev => [...created, ...prev]);
      
      const userName = currentUser?.name || 'System';
      created.forEach(p => {
        addMovement({ productId: p.id, productName: p.name, action: 'Added', quantityChange: p.quantity, date: new Date().toISOString().split('T')[0], user: userName });
        addNotification(`New product added: ${p.name}`, 'success');
      });
    }
  }, [addMovement, addNotification, currentUser]);

  const updateProduct = useCallback(async (id: number, updates: Partial<Product>) => {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.quantity !== undefined) payload.quantity = updates.quantity;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.supplier !== undefined) payload.supplier_name = updates.supplier;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.expiryDate !== undefined) payload.expiry_date = updates.expiryDate || null;
    if (updates.barcode !== undefined) payload.barcode = updates.barcode;
    if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
    if (updates.minStock !== undefined) payload.min_stock = updates.minStock;
    if (updates.quantity !== undefined || updates.minStock !== undefined) {
      const q = updates.quantity ?? products.find(p => p.id === id)?.quantity ?? 0;
      const m = updates.minStock ?? products.find(p => p.id === id)?.minStock ?? 10;
      payload.status = getStatus(q, m);
    }
    
    const { error } = await supabase.from('products').update(payload).eq('id', id);
    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates, status: payload.status || p.status } : p));
      addNotification(`Product updated`, 'success');
    }
  }, [products, getStatus, addNotification]);

  const deleteProduct = useCallback(async (id: number) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(prev => prev.filter(p => p.id !== id));
      addNotification(`Product deleted`, 'info');
    }
  }, [addNotification]);

  const addSupplier = useCallback(async (supplier: Omit<Supplier, 'id'>) => {
    const { data } = await supabase.from('suppliers').insert([{
      name: supplier.name, contact_person: supplier.contactPerson, phone: supplier.phone,
      email: supplier.email, total_orders: supplier.totalOrders, rating: supplier.rating
    }]).select();
    if (data) {
      setSuppliers(prev => [...prev, mapSupplier(data[0])]);
      addNotification(`Supplier ${supplier.name} added`, 'success');
    }
  }, [addNotification]);

  const updateSupplier = useCallback(async (id: number, updates: Partial<Supplier>) => {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.contactPerson !== undefined) payload.contact_person = updates.contactPerson;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.totalOrders !== undefined) payload.total_orders = updates.totalOrders;
    if (updates.rating !== undefined) payload.rating = updates.rating;

    const { error } = await supabase.from('suppliers').update(payload).eq('id', id);
    if (!error) {
      setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      addNotification(`Supplier updated`, 'success');
    }
  }, [addNotification]);

  const deleteSupplier = useCallback(async (id: number) => {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (!error) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      addNotification(`Supplier deleted`, 'info');
    }
  }, [addNotification]);

  const createPurchaseOrder = useCallback(async (order: PurchaseOrder) => {
    // 1. Insert into purchase_orders table
    const { error: poError } = await supabase.from('purchase_orders').insert([{
      id: order.id,
      supplier_name: order.supplier,
      items: order.items,
      total: order.total,
      date: order.date,
      status: order.status
    }]);

    if (poError) {
      console.error('Error creating purchase order:', poError);
      return;
    }

    // 2. Insert each item into purchase_order_items table
    if (order.orderItems && order.orderItems.length > 0) {
      const itemsPayload = order.orderItems.map(it => ({
        purchase_order_id: order.id,
        product_id: it.productId,
        product_name: it.productName,
        quantity: it.quantity,
        price: it.price,
        total: it.total
      }));

      const { error: itemsError } = await supabase.from('purchase_order_items').insert(itemsPayload);
      if (itemsError) {
        console.error('Error creating purchase order items:', itemsError);
      }
    }

    // 3. Update local state
    setOrders(prev => [order, ...prev]);
  }, []);

  const updateOrderStatus = useCallback(async (id: string, newStatus: PurchaseOrder['status']) => {
    const { error } = await supabase.from('purchase_orders').update({ status: newStatus }).eq('id', id);
    if (error) {
      console.error(error);
      return;
    }

    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

    const order = orders.find(o => o.id === id);
    if (!order) return;

    if (order.status !== 'Delivered' && newStatus === 'Delivered') {
      // Update supplier on-time delivery metrics
      const supplier = suppliers.find(s => s.name === order.supplier);
      if (supplier) {
        const newTotalDelivered = (supplier.totalDelivered || 0) + 1;
        const newOnTimeCount = (supplier.onTimeCount || 0) + 1;
        const newOnTimePercent = (newOnTimeCount / newTotalDelivered) * 100;

        await supabase.from('suppliers').update({
          total_delivered: newTotalDelivered,
          on_time_count: newOnTimeCount,
          on_time_delivery: newOnTimePercent
        }).eq('id', supplier.id);

        setSuppliers(currSupps => currSupps.map(s =>
          s.id === supplier.id
            ? { ...s, totalDelivered: newTotalDelivered, onTimeCount: newOnTimeCount, onTimeDeliveryPercent: newOnTimePercent }
            : s
        ));
      }

      // Update product stock for each order item
      if (order.orderItems && order.orderItems.length > 0) {
        for (const it of order.orderItems) {
          const product = products.find(p => p.id === it.productId);
          if (product) {
            const newQty = product.quantity + it.quantity;
            const newStockStatus = getStatus(newQty, product.minStock);
            await supabase.from('products').update({ quantity: newQty, status: newStockStatus }).eq('id', product.id);
            setProducts(currProds => currProds.map(p =>
              p.id === product.id ? { ...p, quantity: newQty, status: newStockStatus } : p
            ));
            const userName = currentUser?.name || 'System';
            addMovement({ productId: product.id, productName: product.name, action: 'Purchased', quantityChange: it.quantity, date: new Date().toISOString().split('T')[0], user: userName });
            addNotification(`${product.name} stock increased by ${it.quantity} via PO ${id}`, 'success');
          }
        }
      }
    }
  }, [orders, suppliers, products, addMovement, addNotification, currentUser, getStatus]);

  const addSupplierBill = useCallback(async (supplierId: number, supplierName: string, items: Omit<SupplierBillItem, 'total'>[]) => {
    const billItems = items.map(it => ({ ...it, total: it.quantity * it.price }));
    const grandTotal = billItems.reduce((s, it) => s + it.total, 0);
    const billId = `SUP-${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];
    const createdBy = currentUser?.name || 'System';

    // 1. Insert Bill
    await supabase.from('supplier_bills').insert([{
      id: billId, supplier_id: supplierId, supplier_name: supplierName, total_amount: grandTotal, date, created_by: createdBy
    }]);

    // 2. Insert Bill Items
    const itemsPayload = billItems.map(it => ({
      bill_id: billId, product_id: it.productId, product_name: it.productName, quantity: it.quantity, price: it.price, total: it.total
    }));
    await supabase.from('supplier_bill_items').insert(itemsPayload);

    // 3. Update Supplier Context Model
    const newBill: SupplierBill = { id: billId, supplierId, supplierName, items: billItems, grandTotal, date, createdBy };
    setSupplierBills(prev => [newBill, ...prev]);

    // 4. Update Product Stock
    for (const it of billItems) {
      const product = products.find(p => p.id === it.productId);
      if (product) {
        const newQty = product.quantity + it.quantity;
        const newStockStatus = getStatus(newQty, product.minStock);
        await supabase.from('products').update({ quantity: newQty, status: newStockStatus }).eq('id', product.id);
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, quantity: newQty, status: newStockStatus } : p));
        
        await addMovement({ productId: it.productId, productName: it.productName, action: 'Imported', quantityChange: it.quantity, date, user: createdBy });
        
        if (product.quantity <= product.minStock && newQty > product.minStock) {
           addNotification(`${it.productName} stock replenished to ${newQty} units — back In Stock`, 'success');
        }
      }
    }

    const targetSupplier = suppliers.find(s => s.id === supplierId);
    if (targetSupplier) {
       await supabase.from('suppliers').update({ total_orders: targetSupplier.totalOrders + 1 }).eq('id', supplierId);
       setSuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, totalOrders: s.totalOrders + 1 } : s));
    }

    addNotification(`Supplier bill ${billId} created — ₹${grandTotal.toLocaleString()} from ${supplierName}`, 'success');
  }, [currentUser, products, suppliers, addMovement, addNotification]);

  const addCustomerBill = useCallback(async (customerName: string, items: Omit<CustomerBillItem, 'total'>[]): Promise<{ success: boolean; error?: string }> => {
    for (const it of items) {
      const product = products.find(p => p.id === it.productId);
      if (!product) return { success: false, error: `Product not found.` };
      if (it.quantity > product.quantity) return { success: false, error: `Not enough inventory available for ${product.name}. Available: ${product.quantity}` };
    }

    const billItems = items.map(it => ({ ...it, total: it.quantity * it.price }));
    const grandTotal = billItems.reduce((s, it) => s + it.total, 0);
    const billId = `CUS-${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];
    const createdBy = currentUser?.name || 'System';

    await supabase.from('customer_bills').insert([{
      id: billId, customer_name: customerName, total_amount: grandTotal, date, created_by: createdBy
    }]);

    const itemsPayload = billItems.map(it => ({
      bill_id: billId, product_id: it.productId, product_name: it.productName, quantity: it.quantity, price: it.price, total: it.total
    }));
    await supabase.from('customer_bill_items').insert(itemsPayload);

    const newBill: CustomerBill = { id: billId, customerName, items: billItems, grandTotal, date, createdBy };
    setCustomerBills(prev => [newBill, ...prev]);

    for (const it of billItems) {
      const product = products.find(p => p.id === it.productId);
      if (product) {
        const newQty = product.quantity - it.quantity;
        const newStockStatus = getStatus(newQty, product.minStock);
        await supabase.from('products').update({ quantity: newQty, status: newStockStatus }).eq('id', product.id);
        setProducts(prev => prev.map(p => p.id === product.id ? { ...p, quantity: newQty, status: newStockStatus } : p));
        
        await addMovement({ productId: it.productId, productName: it.productName, action: 'Exported', quantityChange: -it.quantity, date, user: createdBy });
        
        if (newQty === 0) {
          addNotification(`Out of stock: ${it.productName} has 0 units remaining`, 'warning');
        } else if (newQty > 0 && newQty <= product.minStock) {
          addNotification(`Low stock alert: ${it.productName} only ${newQty} units remaining`, 'warning');
        }
      }
    }

    addNotification(`Customer bill ${billId} created — ₹${grandTotal.toLocaleString()} for ${customerName}`, 'success');
    return { success: true };
  }, [currentUser, products, addMovement, addNotification]);

  const lowStockProducts = products.filter(p => p.quantity <= p.minStock);
  const today = new Date();
  
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

  const reorderSuggestions = products
    .filter(p => p.quantity < p.minStock)
    .map(p => ({
      product: p,
      suggestedQty: Math.max(p.minStock * 3 - p.quantity, 20),
      supplier: p.supplier,
    }));

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={48} color="#3b82f6" />
        <p style={{ color: '#64748b', fontWeight: 500 }}>Connecting to Cloud Database...</p>
      </div>
    );
  }

  return (
    <InventoryContext.Provider value={{
      products, suppliers, users, movements, orders, supplierBills, customerBills, notifications, unreadCount, currentUser, isLoading,
      setProducts, setSuppliers, setUsers, setOrders,
      addMovement, addProducts, updateProduct, deleteProduct, addSupplier, updateSupplier, deleteSupplier, getStatus, updateOrderStatus, createPurchaseOrder, addSupplierBill, addCustomerBill,
      addNotification, markNotificationRead, markAllNotificationsRead,
      lowStockProducts, expiringProducts, stockForecasts, reorderSuggestions,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
