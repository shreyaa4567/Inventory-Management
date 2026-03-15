# 📦 Warehouse Inventory & Billing Management System

> **A modern warehouse management platform that helps businesses manage inventory, suppliers, warehouse locations, purchase orders, and billing in one centralized dashboard.**

---

## 📋 Project Overview

This intuitive application simulates real warehouse operations end-to-end. Designed to bring clarity and control to local and mid-sized supply chains, it covers everything from purchasing and receiving stock to finalizing customer invoices. 

Key operational flows include:
- **Inventory tracking & movement history**
- **Supplier & buyer management**
- **Warehouse location management** (Section → Rack → Shelf format)
- **Purchase orders & Reorder suggestions**
- **Billing systems & invoice generation**
- **Stock alerts & expiry tracking**

---

## ✨ Features

- 📊 **Dashboard Analytics**  
  Displays complete visual insights into total products, active suppliers, pending orders, low stock alerts, and real-time inventory value.

- 📦 **Product Management**  
  Add, edit, and organize products with specialized properties including categories, unit price, stock quantity, expiry dates, and supplier linkage.

- 🚚 **Supplier Management**  
  Track supplier information, historical metrics, and link suppliers seamlessly to incoming inventory products.

- 🗺️ **Warehouse Location Tracking**  
  Store products in precise warehouse locations using a structured Section → Rack → Shelf format.

- 🛒 **Purchase Orders**  
  Create and manage purchase orders for supplier deliveries. Track them from *Pending* to *In Transit* to *Delivered*.

- ⚡ **Reorder Suggestions**  
  Automatically suggest order quantities when stock falls below minimum threshold logic, directly integrating with the Purchase Order pipeline.

- 🧾 **Billing System**  
  Generate dynamic supplier bills for imported products and customer invoices for exported products with built-in stock validation.

- 🔄 **Automatic Inventory Updates**  
  Inventory quantities and values update automatically behind the scenes whenever billing inputs or purchase order deliveries occur.

- ⏳ **Expiry Tracking**  
  Detects products expiring within 7 days and systematically generates warnings and dashboard alerts.

- 🔔 **Notification System**  
  Contextual alerts tracking low stock warnings, expiry warnings, billing activity, and purchase order receipts natively in the top-bar dropdown.

- 🔍 **Search System**  
  Global search bar across products, suppliers, orders, users, and warehouse locations.

- 📈 **Product Movement History**  
  A strict linear timeline tracking every individual inventory change including imports, exports, and manual stock updates.

---

## ⚙️ System Workflow

1. **Supplier delivers products**
2. **Warehouse manager generates a supplier bill (or marks PO as Delivered)**
3. **Inventory quantity increases automatically**
4. **Products are stored logically in calculated warehouse locations**
5. **Customers purchase products**
6. **Customer invoice is generated via the Billing module**
7. **Inventory quantity decreases automatically**
8. *(If stock gets low)* **System generates a notification and reorder suggestion**
9. **User clicks "Order Now" to instantly draft a new PO**

---

## 💻 Technologies Used

- **React** 
- **TypeScript** 
- **Tailwind CSS**
- **Vite** (Build Tool)
- **Recharts** (Analytics and Visualizations)
- **Lucide React** (Iconography)

---

## 🗄️ Database Relationships

The system simulates a robust relational database structure:

- **Products → Suppliers**: (Many-to-One)
- **Products → Warehouse Locations**: (One-to-One / Many-to-One)
- **Purchase Orders → Suppliers**: (Many-to-One)
- **Purchase Orders → Products**: (Many-to-Many via Items) 
- **Billing → Products**: (Many-to-Many via Line Items)
- **Billing → Customers/Suppliers**: (Many-to-One)

*This strictly relational design ensures data consistency, prevents ghost inventory, and guarantees accurate historical tracking metrics.*

---

## 📸 Screenshots

| Dashboard | Product Management |
|:---:|:---:|
| ![Dashboard Placeholder](https://via.placeholder.com/600x400?text=Dashboard+Analytics) | ![Products Placeholder](https://via.placeholder.com/600x400?text=Product+Management) |

| Warehouse Map | Billing System |
|:---:|:---:|
| ![Warehouse Placeholder](https://via.placeholder.com/600x400?text=Warehouse+Map) | ![Billing Placeholder](https://via.placeholder.com/600x400?text=Billing+Invoices) |

---

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   ```

2. **Navigate to the directory**
   ```bash
   cd inventory-management
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:5173`.*

---

## 👤 Author
**Meena Kumar**

---

## 🎯 Goal of the Project
This project explicitly demonstrates how a professional, real-world Warehouse Management System workflows behave — enforcing strict inventory tracking, contextual supplier integration, bidirectional billing workflows, and fully automated multi-state stock updates.
