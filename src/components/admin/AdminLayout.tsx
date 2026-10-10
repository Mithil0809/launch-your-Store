import React, { useState } from 'react';
import { useStore, AdminTab } from '../../context/StoreContext';
import { DashboardHome } from './DashboardHome';
import { ProductManagement } from './ProductManagement';
import { CategoryManagement } from './CategoryManagement';
import { InventoryManagement } from './InventoryManagement';
import { OrderManagement } from './OrderManagement';
import { ThemeEditor } from './ThemeEditor';
import { AiStoreAssistant } from './AiStoreAssistant';
import { StaffManagement } from './StaffManagement';
import { StoreSettingsView } from './StoreSettingsView';
import {
  LayoutDashboard,
  Package,
  Tag,
  Warehouse,
  ShoppingBag,
  Palette,
  Sparkles,
  Users,
  Settings,
  ExternalLink,
  ChevronDown,
  Plus,
  RotateCcw,
  Menu,
  X,
  Search,
  Bell,
  Check,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const {
    currentStore,
    stores,
    setCurrentStoreId,
    activeAdminTab,
    setActiveAdminTab,
    openStorefront,
    openWizard,
    openMarketing,
    currentUser,
    userRole,
    resetToDemoData,
    orders,
    products,
  } = useStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const pendingOrdersCount = orders.filter(
    o => o.fulfillmentStatus === 'Placed' || o.fulfillmentStatus === 'Packed'
  ).length;

  const lowStockCount = products.filter(
    p => p.stockQuantity <= (p.lowStockThreshold || 5)
  ).length;

  const navItems: { tab: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { tab: 'products', label: 'Products', icon: Package },
    { tab: 'categories', label: 'Categories', icon: Tag },
    { tab: 'inventory', label: 'Inventory', icon: Warehouse, badge: lowStockCount },
    { tab: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount },
    { tab: 'editor', label: 'Theme & Editor', icon: Palette },
    { tab: 'assistant', label: 'AI Store Assistant', icon: Sparkles },
    { tab: 'staff', label: 'Staff & Roles', icon: Users },
    { tab: 'settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Application Bar */}
      <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={openMarketing}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-base shadow-xs">
              L
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-base hidden sm:inline">
              LaunchYourStore
            </span>
          </div>

          {/* Store Switcher Dropdown */}
          <div className="relative ml-2 sm:ml-4">
            <button
              onClick={() => setIsStoreDropdownOpen(!isStoreDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 transition shadow-xs"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="truncate max-w-[130px] sm:max-w-[180px]">{currentStore.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isStoreDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-60 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 block">
                  Switch Active Store
                </span>
                {stores.map(st => (
                  <button
                    key={st.id}
                    onClick={() => {
                      setCurrentStoreId(st.id);
                      setIsStoreDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition ${
                      st.id === currentStore.id
                        ? 'bg-indigo-50 font-bold text-indigo-700'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="truncate">{st.name}</span>
                    {st.id === currentStore.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsStoreDropdownOpen(false);
                      openWizard();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-indigo-600 hover:bg-indigo-50 font-semibold flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create New Store
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => openStorefront(currentStore.slug)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs flex items-center gap-1.5 transition active:scale-95"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">View Store</span>
          </button>

          {/* User Profile & Role Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-200"
              />
              <span className="text-xs font-semibold text-slate-800 hidden md:inline">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                {userRole}
              </span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-xs space-y-1">
                <div className="px-2.5 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                </div>

                <button
                  onClick={() => {
                    resetToDemoData();
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" /> Reset Demo Data
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    openMarketing();
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Exit to Landing Page
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Work Area: Left Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 gap-6">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white lg:bg-transparent border-r lg:border-r-0 border-slate-200 p-4 lg:p-0 transition-transform duration-300 lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeAdminTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => {
                    setActiveAdminTab(item.tab);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-indigo-800 text-white' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Help Card */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 text-xs space-y-2">
            <span className="font-bold text-indigo-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Multi-Tenant Active
            </span>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Every order, product SKU, and theme change is strictly isolated to{' '}
              <strong>{currentStore.name}</strong>.
            </p>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 min-w-0">
          {activeAdminTab === 'dashboard' && <DashboardHome />}
          {activeAdminTab === 'products' && <ProductManagement />}
          {activeAdminTab === 'categories' && <CategoryManagement />}
          {activeAdminTab === 'inventory' && <InventoryManagement />}
          {activeAdminTab === 'orders' && <OrderManagement />}
          {activeAdminTab === 'editor' && <ThemeEditor />}
          {activeAdminTab === 'assistant' && <AiStoreAssistant />}
          {activeAdminTab === 'staff' && <StaffManagement />}
          {activeAdminTab === 'settings' && <StoreSettingsView />}
        </main>
      </div>
    </div>
  );
};
