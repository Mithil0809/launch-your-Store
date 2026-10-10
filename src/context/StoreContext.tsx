import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Store,
  Product,
  Category,
  Order,
  InventoryMovement,
  ActivityLog,
  User,
  StoreMembership,
  OrderFulfillmentStatus,
  ImportReport,
} from '../types/store';
import {
  INITIAL_SEED_STORE,
  INITIAL_SEED_CATEGORIES,
  INITIAL_SEED_PRODUCTS,
  INITIAL_SEED_ORDERS,
  INITIAL_SEED_INVENTORY_LOGS,
  INITIAL_SEED_ACTIVITY_LOGS,
  CURRENCY_SYMBOLS,
} from '../data/seedData';

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: string;
}

export type ViewState = 'marketing' | 'wizard' | 'dashboard' | 'storefront';
export type AdminTab =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'orders'
  | 'editor'
  | 'assistant'
  | 'staff'
  | 'settings';

interface StoreContextType {
  // Current user & Auth
  currentUser: User;
  setCurrentUser: (user: User) => void;
  userRole: 'owner' | 'staff';
  setUserRole: (role: 'owner' | 'staff') => void;

  // Multi-tenant stores
  stores: Store[];
  currentStore: Store;
  setCurrentStoreId: (storeId: string) => void;
  createStore: (store: Omit<Store, 'id' | 'createdAt'>) => Store;
  updateStore: (updates: Partial<Store>) => void;
  publishStore: (storeId: string) => void;
  checkSlugAvailability: (slug: string) => Promise<{ available: boolean; cleanSlug: string; reason: string }>;

  // Products
  products: Product[];
  allProducts: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  bulkDeleteProducts: (ids: string[]) => void;
  bulkUpdateProductStatus: (ids: string[], isPublished: boolean) => void;
  importProductsList: (newProducts: Product[], report?: ImportReport) => void;

  // Categories
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'storeId' | 'productCount'>) => Category;
  deleteCategory: (id: string) => void;

  // Inventory
  inventoryLogs: InventoryMovement[];
  adjustStock: (productId: string, quantityChange: number, reason: string) => void;

  // Orders
  orders: Order[];
  createCheckoutOrder: (orderInput: {
    customer: Order['customer'];
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    notes?: string;
  }) => Promise<Order>;
  updateOrderStatus: (
    orderId: string,
    newStatus: OrderFulfillmentStatus,
    note?: string,
    trackingNumber?: string,
    carrier?: string
  ) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: string) => void;
  updateCartQuantity: (productId: string, variant: string | undefined, quantity: number) => void;
  removeFromCart: (productId: string, variant?: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Activity logs & imports
  activityLogs: ActivityLog[];
  importReports: ImportReport[];

  // App routing and navigation
  activeView: ViewState;
  setActiveView: (view: ViewState) => void;
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  storefrontSlug: string;
  setStorefrontSlug: (slug: string) => void;
  openStorefront: (slug?: string) => void;
  openDashboard: (storeId?: string) => void;
  openWizard: () => void;
  openMarketing: () => void;

  // Staff memberships
  memberships: StoreMembership[];
  addStaffMember: (email: string, name: string, role: 'staff' | 'owner') => void;
  removeStaffMember: (membershipId: string) => void;

  // Reset
  resetToDemoData: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  STORES: 'lys_stores_v1',
  CURRENT_STORE_ID: 'lys_current_store_id_v1',
  PRODUCTS: 'lys_products_v1',
  CATEGORIES: 'lys_categories_v1',
  ORDERS: 'lys_orders_v1',
  INVENTORY: 'lys_inventory_v1',
  ACTIVITY: 'lys_activity_v1',
  USER: 'lys_user_v1',
  MEMBERSHIPS: 'lys_memberships_v1',
  REPORTS: 'lys_reports_v1',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current logged in user
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: 'usr-mithili-1',
      name: 'Mithili Hiremath',
      email: 'mithilihiremath@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    };
  });

  const [userRole, setUserRole] = useState<'owner' | 'staff'>('owner');

  // Stores
  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.STORES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [INITIAL_SEED_STORE];
  });

  const [currentStoreId, setCurrentStoreIdState] = useState<string>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_STORE_ID);
    if (saved && stores.some(s => s.id === saved)) {
      return saved;
    }
    return INITIAL_SEED_STORE.id;
  });

  // Products
  const [allProducts, setAllProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_SEED_PRODUCTS;
  });

  // Categories
  const [allCategories, setAllCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_SEED_CATEGORIES;
  });

  // Orders
  const [allOrders, setAllOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_SEED_ORDERS;
  });

  // Inventory movement logs
  const [inventoryLogs, setInventoryLogs] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.INVENTORY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_SEED_INVENTORY_LOGS;
  });

  // Activity logs
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ACTIVITY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_SEED_ACTIVITY_LOGS;
  });

  // Import Reports
  const [importReports, setImportReports] = useState<ImportReport[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.REPORTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Memberships
  const [memberships, setMemberships] = useState<StoreMembership[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.MEMBERSHIPS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: 'mem-1',
        storeId: INITIAL_SEED_STORE.id,
        userId: 'usr-mithili-1',
        userEmail: 'mithilihiremath@gmail.com',
        userName: 'Mithili Hiremath',
        role: 'owner',
        permissions: {
          canManageProducts: true,
          canManageOrders: true,
          canEditTheme: true,
          canViewAnalytics: true,
          canManageStaff: true,
          canDeleteStore: true,
        },
        createdAt: '2026-10-01T09:30:00.000Z',
      },
    ];
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // App routing
  const [activeView, setActiveView] = useState<ViewState>('marketing');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [storefrontSlug, setStorefrontSlug] = useState<string>(INITIAL_SEED_STORE.slug);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.STORES, JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_STORE_ID, currentStoreId);
  }, [currentStoreId]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(allProducts));
  }, [allProducts]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(allCategories));
  }, [allCategories]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(allOrders));
  }, [allOrders]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.INVENTORY, JSON.stringify(inventoryLogs));
  }, [inventoryLogs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ACTIVITY, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.MEMBERSHIPS, JSON.stringify(memberships));
  }, [memberships]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.REPORTS, JSON.stringify(importReports));
  }, [importReports]);

  // Active store resolution
  const currentStore = stores.find(s => s.id === currentStoreId) || stores[0] || INITIAL_SEED_STORE;

  // Filter scoped data by current store ID
  const products = allProducts.filter(p => p.storeId === currentStore.id);
  const categories = allCategories.filter(c => c.storeId === currentStore.id);
  const orders = allOrders.filter(o => o.storeId === currentStore.id);

  const setCurrentStoreId = (id: string) => {
    setCurrentStoreIdState(id);
    const st = stores.find(s => s.id === id);
    if (st) {
      setStorefrontSlug(st.slug);
    }
  };

  // Check slug availability against server and existing stores
  const checkSlugAvailability = async (slug: string) => {
    const clean = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/(^-|-$)+/g, '');
    const existingSlugs = stores.filter(s => s.id !== currentStore.id).map(s => s.slug.toLowerCase());

    try {
      const res = await fetch('/api/check-slug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: clean, existingSlugs }),
      });
      if (res.ok) {
        const data = await res.json();
        return { available: data.available, cleanSlug: data.slug || clean, reason: data.reason };
      }
    } catch (e) {
      // Fallback local check
    }

    const isTaken = existingSlugs.includes(clean);
    return {
      available: !isTaken && clean.length >= 3,
      cleanSlug: clean,
      reason: isTaken ? 'Store slug is already registered' : clean.length < 3 ? 'Must be at least 3 characters' : 'Available',
    };
  };

  // Create store
  const createStore = (storeData: Omit<Store, 'id' | 'createdAt'>): Store => {
    const newStore: Store = {
      ...storeData,
      id: `store-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setStores(prev => [...prev, newStore]);
    setCurrentStoreIdState(newStore.id);
    setStorefrontSlug(newStore.slug);

    // Create owner membership
    const ownerMembership: StoreMembership = {
      id: `mem-${Date.now()}`,
      storeId: newStore.id,
      userId: currentUser.id,
      userEmail: currentUser.email,
      userName: currentUser.name,
      role: 'owner',
      permissions: {
        canManageProducts: true,
        canManageOrders: true,
        canEditTheme: true,
        canViewAnalytics: true,
        canManageStaff: true,
        canDeleteStore: true,
      },
      createdAt: new Date().toISOString(),
    };
    setMemberships(prev => [...prev, ownerMembership]);

    // Log activity
    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      storeId: newStore.id,
      userEmail: currentUser.email,
      action: 'Store Created',
      details: `Initialized store "${newStore.name}" (${newStore.slug})`,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs(prev => [log, ...prev]);

    return newStore;
  };

  // Update store
  const updateStore = (updates: Partial<Store>) => {
    setStores(prev =>
      prev.map(s => (s.id === currentStore.id ? { ...s, ...updates } : s))
    );
    if (updates.slug) {
      setStorefrontSlug(updates.slug);
    }
  };

  // Publish store
  const publishStore = (storeId: string) => {
    const now = new Date().toISOString();
    setStores(prev =>
      prev.map(s =>
        s.id === storeId ? { ...s, status: 'published', publishedAt: now } : s
      )
    );

    const log: ActivityLog = {
      id: `act-${Date.now()}`,
      storeId,
      userEmail: currentUser.email,
      action: 'Store Published',
      details: `Storefront published and live at /store/${currentStore.slug}`,
      timestamp: now,
    };
    setActivityLogs(prev => [log, ...prev]);
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product => {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: `prod-${currentStore.id}-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    setAllProducts(prev => [newProduct, ...prev]);

    // Inventory log
    const invLog: InventoryMovement = {
      id: `mov-${Date.now()}`,
      storeId: currentStore.id,
      productId: newProduct.id,
      productName: newProduct.name,
      type: 'restock',
      quantityChange: newProduct.stockQuantity,
      newStock: newProduct.stockQuantity,
      reason: 'Initial stock on product creation',
      timestamp: now,
    };
    setInventoryLogs(prev => [invLog, ...prev]);

    // Activity log
    setActivityLogs(prev => [
      {
        id: `act-${Date.now()}`,
        storeId: currentStore.id,
        userEmail: currentUser.email,
        action: 'Product Added',
        details: `Created product "${newProduct.name}" (SKU: ${newProduct.sku})`,
        timestamp: now,
      },
      ...prev,
    ]);

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const now = new Date().toISOString();
    setAllProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          // If stock quantity changed, log movement
          if (updates.stockQuantity !== undefined && updates.stockQuantity !== p.stockQuantity) {
            const diff = updates.stockQuantity - p.stockQuantity;
            const invLog: InventoryMovement = {
              id: `mov-${Date.now()}`,
              storeId: currentStore.id,
              productId: p.id,
              productName: updates.name || p.name,
              type: diff > 0 ? 'restock' : 'adjustment',
              quantityChange: diff,
              newStock: updates.stockQuantity,
              reason: 'Manual inventory adjustment via product edit',
              timestamp: now,
            };
            setInventoryLogs(l => [invLog, ...l]);
          }

          return { ...p, ...updates, updatedAt: now };
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    const target = allProducts.find(p => p.id === id);
    setAllProducts(prev => prev.filter(p => p.id !== id));
    if (target) {
      setActivityLogs(prev => [
        {
          id: `act-${Date.now()}`,
          storeId: currentStore.id,
          userEmail: currentUser.email,
          action: 'Product Deleted',
          details: `Removed product "${target.name}" (SKU: ${target.sku})`,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  };

  const bulkDeleteProducts = (ids: string[]) => {
    setAllProducts(prev => prev.filter(p => !ids.includes(p.id)));
    setActivityLogs(prev => [
      {
        id: `act-${Date.now()}`,
        storeId: currentStore.id,
        userEmail: currentUser.email,
        action: 'Bulk Delete',
        details: `Deleted ${ids.length} products from catalog`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const bulkUpdateProductStatus = (ids: string[], isPublished: boolean) => {
    setAllProducts(prev =>
      prev.map(p => (ids.includes(p.id) ? { ...p, isPublished, updatedAt: new Date().toISOString() } : p))
    );
  };

  const importProductsList = (newProducts: Product[], report?: ImportReport) => {
    setAllProducts(prev => [...newProducts, ...prev]);
    if (report) {
      setImportReports(prev => [report, ...prev]);
    }

    setActivityLogs(prev => [
      {
        id: `act-${Date.now()}`,
        storeId: currentStore.id,
        userEmail: currentUser.email,
        action: 'Products Imported',
        details: `Imported ${newProducts.length} products to store catalog`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // Categories
  const addCategory = (categoryData: Omit<Category, 'id' | 'storeId' | 'productCount'>): Category => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${currentStore.id}-${Date.now()}`,
      storeId: currentStore.id,
      productCount: 0,
      isCustom: true,
    };
    setAllCategories(prev => [...prev, newCat]);
    return newCat;
  };

  const deleteCategory = (id: string) => {
    setAllCategories(prev => prev.filter(c => c.id !== id));
  };

  // Inventory adjustment
  const adjustStock = (productId: string, quantityChange: number, reason: string) => {
    const target = allProducts.find(p => p.id === productId);
    if (!target) return;

    const newStock = Math.max(0, target.stockQuantity + quantityChange);
    updateProduct(productId, { stockQuantity: newStock });

    const invLog: InventoryMovement = {
      id: `mov-${Date.now()}`,
      storeId: currentStore.id,
      productId,
      productName: target.name,
      type: quantityChange > 0 ? 'restock' : 'adjustment',
      quantityChange,
      newStock,
      reason,
      timestamp: new Date().toISOString(),
    };
    setInventoryLogs(prev => [invLog, ...prev]);
  };

  // Checkout and Order placement
  const createCheckoutOrder = async (orderInput: {
    customer: Order['customer'];
    items: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    notes?: string;
  }): Promise<Order> => {
    const now = new Date().toISOString();
    const orderNumber = `#LYS-${1000 + (allOrders.length + 1)}`;

    // Verify stock and decrement inventory
    orderInput.items.forEach(item => {
      const prod = allProducts.find(p => p.id === item.product.id);
      if (prod) {
        const updatedStock = Math.max(0, prod.stockQuantity - item.quantity);
        updateProduct(prod.id, { stockQuantity: updatedStock });

        const invMovement: InventoryMovement = {
          id: `mov-${Date.now()}-${item.product.id}`,
          storeId: currentStore.id,
          productId: prod.id,
          productName: prod.name,
          type: 'order',
          quantityChange: -item.quantity,
          newStock: updatedStock,
          reason: `Fulfilled order ${orderNumber}`,
          timestamp: now,
        };
        setInventoryLogs(prev => [invMovement, ...prev]);
      }
    });

    const newOrder: Order = {
      id: `ord-${currentStore.id}-${Date.now()}`,
      orderNumber,
      storeId: currentStore.id,
      customer: orderInput.customer,
      items: orderInput.items.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        selectedVariant: item.variant,
        imageUrl: item.product.images[0],
        category: item.product.category,
      })),
      subtotal: orderInput.subtotal,
      tax: orderInput.tax,
      shipping: orderInput.shipping,
      total: orderInput.total,
      currency: currentStore.settings.currency || 'USD',
      paymentStatus: 'Paid',
      fulfillmentStatus: 'Placed',
      notes: orderInput.notes,
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          status: 'Placed',
          timestamp: now,
          note: 'Customer placed order via storefront checkout',
        },
      ],
    };

    setAllOrders(prev => [newOrder, ...prev]);

    // Activity log
    setActivityLogs(prev => [
      {
        id: `act-${Date.now()}`,
        storeId: currentStore.id,
        userEmail: orderInput.customer.email,
        action: 'Order Placed',
        details: `Received order ${orderNumber} for ${CURRENCY_SYMBOLS[currentStore.settings.currency] || '$'}${orderInput.total.toFixed(2)} from ${orderInput.customer.name}`,
        timestamp: now,
      },
      ...prev,
    ]);

    // Clear cart after checkout
    clearCart();

    return newOrder;
  };

  // Update order status with stock restoration on cancellation
  const updateOrderStatus = (
    orderId: string,
    newStatus: OrderFulfillmentStatus,
    note?: string,
    trackingNumber?: string,
    carrier?: string
  ) => {
    const now = new Date().toISOString();
    setAllOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const wasCancelled = ord.fulfillmentStatus === 'Cancelled';
          const isNowCancelled = newStatus === 'Cancelled';

          // Restore inventory if cancelled
          if (!wasCancelled && isNowCancelled) {
            ord.items.forEach(item => {
              const prod = allProducts.find(p => p.id === item.productId);
              if (prod) {
                const restoredStock = prod.stockQuantity + item.quantity;
                updateProduct(prod.id, { stockQuantity: restoredStock });

                const invMovement: InventoryMovement = {
                  id: `mov-${Date.now()}-${item.productId}`,
                  storeId: currentStore.id,
                  productId: prod.id,
                  productName: prod.name,
                  type: 'cancellation',
                  quantityChange: item.quantity,
                  newStock: restoredStock,
                  reason: `Stock restored from cancelled order ${ord.orderNumber}`,
                  timestamp: now,
                };
                setInventoryLogs(l => [invMovement, ...l]);
              }
            });
          }

          const historyItem = {
            status: newStatus,
            timestamp: now,
            note: note || `Order status updated to ${newStatus}`,
          };

          return {
            ...ord,
            fulfillmentStatus: newStatus,
            trackingNumber: trackingNumber !== undefined ? trackingNumber : ord.trackingNumber,
            carrier: carrier !== undefined ? carrier : ord.carrier,
            updatedAt: now,
            statusHistory: [...ord.statusHistory, historyItem],
          };
        }
        return ord;
      })
    );

    setActivityLogs(prev => [
      {
        id: `act-${Date.now()}`,
        storeId: currentStore.id,
        userEmail: currentUser.email,
        action: 'Order Status Changed',
        details: `Order status set to ${newStatus}`,
        timestamp: now,
      },
      ...prev,
    ]);
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, variant?: string) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(
        item => item.product.id === product.id && item.variant === variant
      );
      if (existingIdx !== -1) {
        const copy = [...prev];
        const newQty = Math.min(product.stockQuantity, copy[existingIdx].quantity + quantity);
        copy[existingIdx].quantity = newQty;
        return copy;
      }
      return [...prev, { product, quantity: Math.min(product.stockQuantity, quantity), variant }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, variant: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, variant);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId && item.variant === variant) {
          const maxAllowed = item.product.stockQuantity;
          return { ...item, quantity: Math.min(maxAllowed, quantity) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string, variant?: string) => {
    setCart(prev =>
      prev.filter(item => !(item.product.id === productId && item.variant === variant))
    );
  };

  const clearCart = () => setCart([]);

  // Routing navigation helpers
  const openStorefront = (slug?: string) => {
    const targetSlug = slug || currentStore.slug;
    setStorefrontSlug(targetSlug);
    setActiveView('storefront');
  };

  const openDashboard = (storeId?: string) => {
    if (storeId) {
      setCurrentStoreId(storeId);
    }
    setActiveView('dashboard');
  };

  const openWizard = () => setActiveView('wizard');
  const openMarketing = () => setActiveView('marketing');

  // Staff members
  const addStaffMember = (email: string, name: string, role: 'staff' | 'owner') => {
    const newMember: StoreMembership = {
      id: `mem-${Date.now()}`,
      storeId: currentStore.id,
      userId: `usr-${Date.now()}`,
      userEmail: email,
      userName: name,
      role,
      permissions: {
        canManageProducts: true,
        canManageOrders: true,
        canEditTheme: role === 'owner',
        canViewAnalytics: true,
        canManageStaff: role === 'owner',
        canDeleteStore: false,
      },
      createdAt: new Date().toISOString(),
    };
    setMemberships(prev => [...prev, newMember]);
  };

  const removeStaffMember = (membershipId: string) => {
    setMemberships(prev => prev.filter(m => m.id !== membershipId));
  };

  // Reset to demo data
  const resetToDemoData = () => {
    setStores([INITIAL_SEED_STORE]);
    setCurrentStoreIdState(INITIAL_SEED_STORE.id);
    setAllProducts(INITIAL_SEED_PRODUCTS);
    setAllCategories(INITIAL_SEED_CATEGORIES);
    setAllOrders(INITIAL_SEED_ORDERS);
    setInventoryLogs(INITIAL_SEED_INVENTORY_LOGS);
    setActivityLogs(INITIAL_SEED_ACTIVITY_LOGS);
    setCart([]);
    setStorefrontSlug(INITIAL_SEED_STORE.slug);
    setActiveView('dashboard');
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        userRole,
        setUserRole,
        stores,
        currentStore,
        setCurrentStoreId,
        createStore,
        updateStore,
        publishStore,
        checkSlugAvailability,
        products,
        allProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        bulkDeleteProducts,
        bulkUpdateProductStatus,
        importProductsList,
        categories,
        addCategory,
        deleteCategory,
        inventoryLogs,
        adjustStock,
        orders,
        createCheckoutOrder,
        updateOrderStatus,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        activityLogs,
        importReports,
        activeView,
        setActiveView,
        activeAdminTab,
        setActiveAdminTab,
        storefrontSlug,
        setStorefrontSlug,
        openStorefront,
        openDashboard,
        openWizard,
        openMarketing,
        memberships,
        addStaffMember,
        removeStaffMember,
        resetToDemoData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
