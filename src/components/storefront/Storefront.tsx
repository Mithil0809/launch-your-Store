import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';
import { Product, Store, CartItem } from '../../types/store';
import { THEME_DEFINITIONS } from '../../themes/themeStyles';
import { CURRENCY_SYMBOLS } from '../../data/seedData';
import {
  ShoppingBag,
  Search,
  X,
  Plus,
  Minus,
  Check,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  ExternalLink,
  ChevronRight,
  CreditCard,
  Printer,
  Sparkles,
  Heart,
  SlidersHorizontal,
} from 'lucide-react';

export const Storefront: React.FC = () => {
  const {
    stores,
    storefrontSlug,
    products: currentStoreProducts,
    allProducts = [],
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    createCheckoutOrder,
    openDashboard,
    openMarketing,
  } = useStore();

  // 1. Resolve store by slug
  const activeStore: Store =
    stores.find(s => s.slug === storefrontSlug) ||
    stores.find(s => s.id === 'store-aura-101') ||
    stores[0];

  // 2. Resolve products belonging to this store
  const storeProducts = useMemo((): Product[] => {
    return allProducts.filter((p: Product) => p.storeId === activeStore.id && p.isPublished);
  }, [allProducts, activeStore.id]);

  const themeConfig = activeStore.themeConfig;
  const themeDef = THEME_DEFINITIONS[themeConfig.themeId] || THEME_DEFINITIONS.minimal;
  const currencySymbol = CURRENCY_SYMBOLS[activeStore.settings.currency] || '$';

  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high'>('featured');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [detailQuantity, setDetailQuantity] = useState<number>(1);

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'success'>('form');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Customer Checkout Form
  const [custName, setCustName] = useState('Elena Rostova');
  const [custEmail, setCustEmail] = useState('elena.rostova@example.com');
  const [custPhone, setCustPhone] = useState('+1 (555) 349-2810');
  const [custAddress, setCustAddress] = useState('742 Evergreen Terrace');
  const [custCity, setCustCity] = useState('Portland');
  const [custState, setCustState] = useState('OR');
  const [custZip, setCustZip] = useState('97201');
  const [orderNotes, setOrderNotes] = useState('Please leave package on front porch.');

  // Categories present in this store's products
  const availableCategories = useMemo((): string[] => {
    const cats = new Set<string>();
    storeProducts.forEach((p: Product) => cats.add(p.category));
    return ['All', ...Array.from(cats)];
  }, [storeProducts]);

  // Filtered & Sorted products
  const filteredProducts = useMemo((): Product[] => {
    return storeProducts
      .filter((p: Product) => {
        const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch =
          !searchQuery ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
      })
      .sort((a: Product, b: Product) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        return 0;
      });
  }, [storeProducts, selectedCategory, searchQuery, sortBy]);

  // Cart calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [cart]);

  const qualifiesForFreeShipping =
    activeStore.settings.freeShippingThreshold > 0 &&
    cartSubtotal >= activeStore.settings.freeShippingThreshold;

  const shippingCost = cart.length === 0 ? 0 : qualifiesForFreeShipping ? 0 : activeStore.settings.shippingFlatRate;
  const taxAmount = (cartSubtotal * (activeStore.settings.taxRate || 0)) / 100;
  const orderTotal = cartSubtotal + shippingCost + taxAmount;
  const totalCartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  // Handle Checkout submission
  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmittingOrder(true);
    try {
      const order = await createCheckoutOrder({
        customer: {
          name: custName,
          email: custEmail,
          phone: custPhone,
          address: custAddress,
          city: custCity,
          state: custState,
          zip: custZip,
          country: activeStore.country || 'United States',
        },
        items: cart,
        subtotal: cartSubtotal,
        tax: taxAmount,
        shipping: shippingCost,
        total: orderTotal,
        notes: orderNotes,
      });

      setConfirmedOrder(order);
      setCheckoutStep('success');

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#10B981', '#F59E0B'],
      });
    } catch (err) {
      console.error('Failed to create order:', err);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{
        backgroundColor: themeDef.colors.background,
        color: themeDef.colors.text,
        fontFamily: themeConfig.fontBody || themeDef.typography.fontBody,
      }}
    >
      {/* Merchant Top Bar */}
      <div className="bg-slate-900 text-slate-200 px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Live Storefront: {activeStore.name}</span>
          <span className="text-slate-400 hidden sm:inline">
            ({themeDef.name} Theme • {activeStore.status === 'published' ? 'Published' : 'Draft'})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => openDashboard(activeStore.id)}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1 rounded-md transition shadow-xs"
          >
            Open Admin Dashboard
          </button>
          <button
            onClick={openMarketing}
            className="text-slate-400 hover:text-white text-xs underline"
          >
            Platform Home
          </button>
        </div>
      </div>

      {/* Announcement Bar */}
      {activeStore.settings.announcementBar?.enabled && (
        <div
          className="text-center py-2 px-4 text-xs font-semibold tracking-wide transition-colors"
          style={{
            backgroundColor: themeConfig.primaryColor || themeDef.colors.primary,
            color: '#FFFFFF',
          }}
        >
          {activeStore.settings.announcementBar.text}
        </div>
      )}

      {/* Store Navigation Header */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur-md transition-colors"
        style={{
          backgroundColor: `${themeDef.colors.cardBg}F0`,
          borderColor: themeDef.colors.border,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Store Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedCategory('All')}>
            {activeStore.logoUrl ? (
              <img
                src={activeStore.logoUrl}
                alt={activeStore.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl text-white font-bold flex items-center justify-center text-lg shadow-sm"
                style={{ backgroundColor: themeConfig.primaryColor || themeDef.colors.primary }}
              >
                {activeStore.name.slice(0, 1)}
              </div>
            )}
            <div>
              <span
                className="text-xl font-bold tracking-tight block"
                style={{
                  fontFamily: themeConfig.fontHeading || themeDef.typography.fontHeading,
                }}
              >
                {activeStore.name}
              </span>
              <span className="text-[11px] text-slate-500 block truncate max-w-[200px]">
                {activeStore.description}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`transition hover:opacity-80 ${
                selectedCategory === 'All' ? 'font-bold underline underline-offset-8' : 'opacity-70'
              }`}
            >
              Shop All
            </button>
            {availableCategories.slice(1, 4).map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`transition hover:opacity-80 ${
                  selectedCategory === cat ? 'font-bold underline underline-offset-8' : 'opacity-70'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* Actions: Search & Cart */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-full px-3 py-1.5 shadow-sm">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    autoFocus
                    className="text-xs bg-transparent focus:outline-none w-32 sm:w-48 text-slate-900"
                  />
                  <button onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-full hover:bg-slate-100 transition text-slate-700"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-slate-100 transition text-slate-800"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartItemCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[11px] font-bold text-white flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: themeConfig.accentColor || themeDef.colors.accent }}
                >
                  {totalCartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      {themeConfig.visibleSections?.hero && selectedCategory === 'All' && !searchQuery && (
        <section
          className="border-b transition-all overflow-hidden"
          style={{ borderColor: themeDef.colors.border }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            {themeDef.id === 'luxe' ? (
              // Luxe Split Editorial Hero
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <span className="text-xs uppercase tracking-widest text-[#B89758] font-bold">
                    Curated Collection 2026
                  </span>
                  <h1
                    className="text-4xl sm:text-5xl lg:text-6xl font-normal italic tracking-tight"
                    style={{ fontFamily: themeConfig.fontHeading }}
                  >
                    {themeConfig.heroHeadline || 'Conscious Botanical Rituals'}
                  </h1>
                  <p className="text-slate-600 text-base max-w-lg leading-relaxed">
                    {themeConfig.heroSubheadline ||
                      'Formulated with organic cold-pressed botanicals to restore balance, radiance, and quiet intention to your daily life.'}
                  </p>
                  <div>
                    <button
                      onClick={() => {
                        const el = document.getElementById('store-catalog');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-8 py-4 uppercase tracking-widest text-xs font-semibold border border-stone-900 bg-stone-900 text-white hover:bg-stone-800 transition"
                    >
                      {themeConfig.heroCtaText || 'Explore Collection'}
                    </button>
                  </div>
                </div>
                <div className="relative aspect-4/3 md:aspect-square overflow-hidden rounded-sm shadow-xl">
                  <img
                    src={themeConfig.heroBannerUrl}
                    alt={themeConfig.heroHeadline}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              </div>
            ) : themeDef.id === 'bold' ? (
              // Bold Full-Bleed Modern Hero
              <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 text-white p-8 sm:p-16 relative overflow-hidden shadow-2xl border border-indigo-900/50">
                <div className="max-w-xl relative z-10 space-y-6">
                  <span className="inline-block bg-pink-500 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                    New Season Arrivals
                  </span>
                  <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight">
                    {themeConfig.heroHeadline || 'Engineered For Performance'}
                  </h1>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {themeConfig.heroSubheadline ||
                      'High impact gear built with zero compromises. Elevate your daily routine today.'}
                  </p>
                  <button
                    onClick={() => {
                      const el = document.getElementById('store-catalog');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm bg-gradient-to-r from-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30 hover:opacity-90 transition active:scale-95"
                  >
                    {themeConfig.heroCtaText || 'Shop The Drop'}
                  </button>
                </div>
              </div>
            ) : (
              // Minimal / Natural Clean Hero
              <div className="text-center max-w-3xl mx-auto py-6 sm:py-10 space-y-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Welcome to {activeStore.name}
                </span>
                <h1
                  className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900"
                  style={{ fontFamily: themeConfig.fontHeading }}
                >
                  {themeConfig.heroHeadline || 'Crafted For Modern Living'}
                </h1>
                <p className="text-slate-600 text-base max-w-xl mx-auto">
                  {themeConfig.heroSubheadline ||
                    'Explore our curated collection of premium essentials made with uncompromising care.'}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      const el = document.getElementById('store-catalog');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-7 py-3 rounded-xl font-bold text-sm text-white shadow-sm transition hover:opacity-90"
                    style={{ backgroundColor: themeConfig.primaryColor }}
                  >
                    {themeConfig.heroCtaText || 'Shop Collection'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* MAIN CATALOG SECTION */}
      <main id="store-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Category Tabs & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {availableCategories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {cat} {cat === 'All' ? `(${storeProducts.length})` : ''}
                </button>
              );
            })}
          </div>

          {/* Sort & Filter Controls */}
          <div className="flex items-center gap-3 self-end md:self-auto text-xs">
            <span className="text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No products found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find any products matching your current category or search criteria.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid ${themeDef.layout.gridDensity}`}>
            {filteredProducts.map((product: Product) => {
              const isLowStock = product.stockQuantity <= (product.lowStockThreshold || 5);
              const isOutOfStock = product.stockQuantity <= 0;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col justify-between bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300"
                >
                  {/* Product Image & Badges */}
                  <div
                    className="relative aspect-square bg-slate-100 overflow-hidden cursor-pointer"
                    onClick={() => {
                      setSelectedProduct(product);
                      setSelectedVariant(product.variants?.[0]?.options[0] || '');
                      setDetailQuantity(1);
                    }}
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Stock & Sale Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded shadow-xs">
                          Sale
                        </span>
                      )}
                      {isOutOfStock ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-white px-2 py-0.5 rounded shadow-xs">
                          Sold Out
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded shadow-xs">
                          Only {product.stockQuantity} Left
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Product Info & Action */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                        {product.category}
                      </span>
                      <h3
                        onClick={() => {
                          setSelectedProduct(product);
                          setSelectedVariant(product.variants?.[0]?.options[0] || '');
                          setDetailQuantity(1);
                        }}
                        className="font-bold text-sm text-slate-900 mt-1 hover:text-indigo-600 cursor-pointer line-clamp-1"
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-extrabold text-slate-900">
                          {currencySymbol}
                          {product.price.toFixed(2)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {currencySymbol}
                            {product.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        disabled={isOutOfStock}
                        onClick={() => addToCart(product, 1)}
                        className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all flex items-center gap-1 shadow-xs ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-900 hover:bg-slate-800 text-white active:scale-95'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 relative animate-scaleUp">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Gallery */}
              <div className="space-y-3">
                <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {selectedProduct.images.length > 1 && (
                  <div className="flex gap-2">
                    {selectedProduct.images.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover border border-slate-200 cursor-pointer"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Information & Purchase options */}
              <div className="flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    {selectedProduct.category}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    {selectedProduct.name}
                  </h2>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    SKU: {selectedProduct.sku}
                  </p>

                  <div className="flex items-baseline gap-3 my-4">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {currencySymbol}
                      {selectedProduct.price.toFixed(2)}
                    </span>
                    {selectedProduct.compareAtPrice && (
                      <span className="text-base text-slate-400 line-through">
                        {currencySymbol}
                        {selectedProduct.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {selectedProduct.description}
                  </p>

                  {/* Variant Selection if available */}
                  {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {selectedProduct.variants.map((v, i) => (
                        <div key={i}>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            {v.name}:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {v.options.map(opt => (
                              <button
                                key={opt}
                                onClick={() => setSelectedVariant(opt)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                  selectedVariant === opt
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Stock validation badge */}
                  <div className="mb-6">
                    {selectedProduct.stockQuantity > 0 ? (
                      <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> In Stock ({selectedProduct.stockQuantity} available)
                      </span>
                    ) : (
                      <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                    )}
                  </div>
                </div>

                {/* Quantity and Add to Cart Button */}
                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setDetailQuantity(Math.max(1, detailQuantity - 1))}
                      className="px-3 py-2 text-slate-500 hover:bg-slate-50"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 py-2 text-xs font-bold text-slate-800">
                      {detailQuantity}
                    </span>
                    <button
                      onClick={() =>
                        setDetailQuantity(
                          Math.min(selectedProduct.stockQuantity, detailQuantity + 1)
                        )
                      }
                      className="px-3 py-2 text-slate-500 hover:bg-slate-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    disabled={selectedProduct.stockQuantity <= 0}
                    onClick={() => {
                      addToCart(selectedProduct, detailQuantity, selectedVariant);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                  >
                    Add {detailQuantity} to Cart • {currencySymbol}
                    {(selectedProduct.price * detailQuantity).toFixed(2)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHOPPING CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white max-w-md w-full h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-slideLeft">
            {/* Cart Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-slate-900" />
                <h3 className="font-bold text-slate-900 text-base">Your Cart</h3>
                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                  {totalCartItemCount}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-semibold text-slate-700 text-sm">Your cart is currently empty</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Explore our catalog and add items to your shopping bag.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div
                    key={`${item.product.id}-${item.variant}-${index}`}
                    className="flex gap-3 pb-4 border-b border-slate-100 text-xs"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-900 text-xs">{item.product.name}</h4>
                          {item.variant && (
                            <span className="text-[11px] text-slate-400 font-medium">
                              Variant: {item.variant}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.variant)}
                          className="text-slate-400 hover:text-red-600 text-[11px]"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              updateCartQuantity(item.product.id, item.variant, item.quantity - 1)
                            }
                            className="px-2 py-1 text-slate-500 hover:bg-slate-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 py-1 font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(item.product.id, item.variant, item.quantity + 1)
                            }
                            className="px-2 py-1 text-slate-500 hover:bg-slate-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-bold text-slate-900 text-xs">
                          {currencySymbol}
                          {(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary & Checkout CTA */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      {currencySymbol}
                      {cartSubtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span>
                      {shippingCost === 0 ? (
                        <strong className="text-emerald-600 font-semibold">FREE</strong>
                      ) : (
                        `${currencySymbol}${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({activeStore.settings.taxRate}%)</span>
                    <span>
                      {currencySymbol}
                      {taxAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                    <span>Total</span>
                    <span>
                      {currencySymbol}
                      {orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL & ORDER CONFIRMATION */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            {checkoutStep === 'form' ? (
              <form onSubmit={handleCompleteOrder} className="space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                      Sandbox Test Checkout
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">Complete Your Order</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Customer Information */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    1. Contact Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={custName}
                      onChange={e => setCustName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      value={custEmail}
                      onChange={e => setCustEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    2. Shipping Address
                  </h4>
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Street Address"
                      value={custAddress}
                      onChange={e => setCustAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="City"
                        value={custCity}
                        onChange={e => setCustCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        required
                        placeholder="State"
                        value={custState}
                        onChange={e => setCustState(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        required
                        placeholder="Zip"
                        value={custZip}
                        onChange={e => setCustZip(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Test Payment Method Banner */}
                <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-900">
                  <CreditCard className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Test Mode Active:</span> No real payment card is charged.
                    Submitting this form immediately validates stock, records the order in your database, and decrements catalog inventory.
                  </div>
                </div>

                {/* Order Summary & Submit */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500">Order Total</span>
                    <p className="text-lg font-extrabold text-slate-900">
                      {currencySymbol}
                      {orderTotal.toFixed(2)}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingOrder}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmittingOrder ? 'Processing Order...' : 'Place Test Order'}
                  </button>
                </div>
              </form>
            ) : (
              // Order Success View
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Order Confirmed!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Thank you, <strong>{confirmedOrder?.customer.name}</strong>. Your order{' '}
                  <strong className="text-indigo-600">{confirmedOrder?.orderNumber}</strong> has been
                  recorded and is pending packing.
                </p>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 my-4">
                  <div className="flex justify-between font-medium">
                    <span>Order Reference:</span>
                    <span className="font-mono">{confirmedOrder?.orderNumber}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total Paid:</span>
                    <span>
                      {currencySymbol}
                      {confirmedOrder?.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Fulfillment Status:</span>
                    <span className="text-indigo-600 font-bold">{confirmedOrder?.fulfillmentStatus}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setCheckoutStep('form');
                    }}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Continue Shopping
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      openDashboard(activeStore.id);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                  >
                    View in Admin Orders
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STOREFRONT FOOTER */}
      <footer
        className="border-t mt-20 transition-colors"
        style={{
          backgroundColor: themeDef.colors.cardBg,
          borderColor: themeDef.colors.border,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <span
                className="text-lg font-bold block"
                style={{ fontFamily: themeConfig.fontHeading }}
              >
                {activeStore.name}
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                {activeStore.description || 'Modern e-commerce boutique.'}
              </p>
              <p className="text-xs text-slate-400">
                {activeStore.city}, {activeStore.country}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-700">Policies</h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-2">
                {activeStore.settings.shippingPolicy}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {activeStore.settings.returnPolicy}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-700">Customer Care</h4>
              <p className="text-xs text-slate-500 mb-1">
                Email: {activeStore.settings.contactEmail || activeStore.email}
              </p>
              <p className="text-xs text-slate-500 mb-1">
                Phone: {activeStore.settings.contactPhone || activeStore.phone}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-slate-500">Secure Checkout Guarantee</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-700">Platform</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Powered by <strong>LaunchYourStore</strong>. Instant no-code online stores with AI analytics.
              </p>
              <button
                onClick={() => openDashboard(activeStore.id)}
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                Manage this store in Admin →
              </button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
            <span>© {new Date().getFullYear()} {activeStore.name}. All rights reserved.</span>
            <span>Built with LaunchYourStore AI SaaS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
