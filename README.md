# 📦 Warehouse Inventory & Billing Management System

> **A full-stack warehouse management platform built with React + TypeScript + Supabase (PostgreSQL) to manage inventory, suppliers, purchase orders, billing, and stock analytics in one centralized dashboard.**

---

## 📋 Project Overview

This application simulates real-world warehouse operations end-to-end. It covers everything from purchasing and receiving stock to finalizing customer invoices — with all data persisted in a **Supabase PostgreSQL** cloud database.

Key operational flows include:
- **Inventory tracking & movement history**
- **Supplier & buyer management**
- **Warehouse location management** (Section → Rack → Shelf format)
- **Purchase orders & Reorder suggestions**
- **Billing systems & invoice generation**
- **Stock alerts, expiry tracking & low stock notifications**

---

## ✨ Features

- 📊 **Dashboard Analytics** — Visual insights into total products, suppliers, pending orders, low stock alerts, and real-time inventory value
- 📦 **Product Management** — Add, edit, organize products with categories, unit price, stock quantity, expiry dates, barcodes, images, and supplier linkage
- 🚚 **Supplier Management** — Track supplier info, order history, on-time delivery percentage, and link suppliers to products
- 🗺️ **Warehouse Location Tracking** — Store products in warehouse locations using Section → Rack → Shelf format with interactive heatmap
- 🛒 **Purchase Orders** — Create and track purchase orders from *Pending* → *In Transit* → *Delivered* (persisted in Supabase)
- ⚡ **Reorder Suggestions** — Automatic reorder when stock falls below minimum threshold, with one-click "Order Now" PO creation
- 🧾 **Billing System** — Supplier bills (import stock) and customer bills (export stock) with automatic stock updates in Supabase
- 🔄 **Automatic Inventory Updates** — Stock quantities and statuses update in Supabase whenever bills or deliveries occur
- ⏳ **Expiry Tracking** — Detects products expiring within 7 days and generates dashboard warnings
- 🔔 **Notification System** — Real-time alerts for low stock, expiry, out-of-stock, back-in-stock, billing activity, and PO receipts
- 🔍 **Search System** — Global search across products, suppliers, orders, users, and locations
- 📈 **Product Movement History** — Complete timeline of every stock change (imports, exports, purchases, manual updates)
- 🛤️ **Pick Route Optimizer** — Optimized pick routes for warehouse order fulfillment
- 🗃️ **Barcode/QR Generation** — Auto-generate barcodes for every product
- 👤 **Role-Based Access Control** — Admin, Manager, and Staff roles with different permissions
- 📊 **Reports** — Stock by category, top selling/purchased products, inventory value, and low stock reports

---

## 🗄️ Database — Supabase PostgreSQL

### Tables (10)

| # | Table | Description |
|---|-------|-------------|
| 1 | `products` | All inventory products with qty, price, status, barcode, location, expiry |
| 2 | `suppliers` | Supplier info with delivery metrics and ratings |
| 3 | `purchase_orders` | Purchase orders with status tracking (Pending/In Transit/Delivered/Cancelled) |
| 4 | `purchase_order_items` | Line items for each purchase order |
| 5 | `supplier_bills` | Import bills linked to suppliers |
| 6 | `supplier_bill_items` | Line items for each supplier bill |
| 7 | `customer_bills` | Export bills linked to customers |
| 8 | `customer_bill_items` | Line items for each customer bill |
| 9 | `movement_records` | Full audit trail of every stock change |
| 10 | `app_users` | Application users with roles and permissions |

### Database Relationships (Foreign Keys)

```
products.supplier_id → suppliers.id (Many-to-One)
purchase_order_items.purchase_order_id → purchase_orders.id (CASCADE)
purchase_order_items.product_id → products.id (CASCADE)
supplier_bills.supplier_id → suppliers.id (SET NULL)
supplier_bill_items.bill_id → supplier_bills.id (CASCADE)
supplier_bill_items.product_id → products.id (CASCADE)
customer_bill_items.bill_id → customer_bills.id (CASCADE)
customer_bill_items.product_id → products.id (CASCADE)
movement_records.product_id → products.id (CASCADE)
```

---

## 🧠 Advanced DBMS Features

### 🔁 Triggers
- **`stock_change_trigger`** — Automatically logs stock changes to `movement_records` when product quantities are modified

### 📊 Views
- **`low_stock_products`** — Products where `quantity < min_stock`
- **`inventory_value`** — Aggregated inventory value by category
- **`supplier_order_summary`** — Supplier-wise order and delivery statistics

### ⚡ Indexes (7 performance indexes)
- `idx_products_category` on `products(category)`
- `idx_products_status` on `products(status)`
- `idx_products_supplier` on `products(supplier_id)`
- `idx_movement_product` on `movement_records(product_id)`
- `idx_movement_date` on `movement_records(date)`
- `idx_po_status` on `purchase_orders(status)`
- `idx_po_date` on `purchase_orders(date)`

### 📦 Stored Procedures
- **`reorder_product(product_id, quantity)`** — Creates a purchase order automatically
- **`get_product_details(product_id)`** — Returns complete product info with supplier and movement history

---

## 💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript |
| **Styling** | Tailwind CSS |
| **Build Tool** | Vite |
| **Icons** | Lucide React |
| **Database** | Supabase (PostgreSQL) |
| **Deployment** | Vercel |

---

## ⚙️ System Workflow

1. 🏭 **Supplier delivers products** to the warehouse
2. 🧾 **Manager generates a Supplier Bill** (or marks Purchase Order as Delivered)
3. 📈 **Inventory quantity increases automatically** in Supabase
4. 📍 **Products are stored** in calculated warehouse locations (Section → Rack → Shelf)
5. 🛒 **Customers purchase products** from the warehouse
6. 🧾 **Customer invoice is generated** via the Billing module
7. 📉 **Inventory quantity decreases automatically** in Supabase
8. ⚠️ **If stock gets low** → system generates a notification and reorder suggestion
9. 🛒 **If stock hits 0** → product marked as Out of Stock, notification shown
10. ⚡ **User clicks "Order Now"** to instantly draft a new Purchase Order in Supabase

---

## 🚀 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/shreyaa4567/Inventory-Management
cd inventory-management
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env.local` with Supabase credentials
```env
VITE_SUPABASE_URL=https://jbnvuiwrclfafoxfqiip.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set up the database
Copy and paste the contents of `supabase_schema.sql` into the **Supabase SQL Editor** and run it. This creates all 10 tables with proper relationships.

---

## 🌐 Live Demo

🔗 **[https://inventory-management-two-beige.vercel.app/dashboard](https://inventory-management-two-beige.vercel.app/dashboard)**

---

## 👤 Author

**SHREYA SINGH**

---

## 🎯 Project Goal

This project demonstrates how a professional, real-world Warehouse Management System works — enforcing strict inventory tracking with a PostgreSQL database, contextual supplier integration, bidirectional billing workflows, and fully automated multi-state stock updates persisted in the cloud.
