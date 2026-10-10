import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types/store';
import { CURRENCY_SYMBOLS } from '../../data/seedData';
import { exportProductsToCSV } from '../../utils/csvImporter';
import {
  Plus,
  Search,
  Download,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Filter,
  AlertTriangle,
  Check,
  X,
  Upload,
  ArrowUpDown,
  Tag,
} from 'lucide-react';

export const ProductManagement: React.FC = () => {
  const {
    currentStore,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,
    bulkUpdateProductStatus,
    categories,
    setActiveAdminTab,
  } = useStore();

  const currencySymbol = CURRENCY_SYMBOLS[currentStore.settings.currency] || '$';

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low-stock' | 'out-of-stock'>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('45.00');
  const [formCompareAt, setFormCompareAt] = useState('');
  const [formCost, setFormCost] = useState('12.00');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.name || 'Home and Living');
  const [formStock, setFormStock] = useState('20');
  const [formLowStockThreshold, setFormLowStockThreshold] = useState('5');
  const [formImageUrl, setFormImageUrl] = useState(
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'
  );
  const [formIsPublished, setFormIsPublished] = useState(true);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'low-stock' && p.stockQuantity <= (p.lowStockThreshold || 5)) ||
        (stockFilter === 'out-of-stock' && p.stockQuantity <= 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, searchQuery, selectedCategoryFilter, stockFilter]);

  // Open Add Modal
  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('Artisanal craft piece made with organic sustainable materials.');
    setFormPrice('48.00');
    setFormCompareAt('');
    setFormCost('15.00');
    setFormSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
    setFormCategory(categories[0]?.name || 'Home and Living');
    setFormStock('25');
    setFormLowStockThreshold('5');
    setFormImageUrl(
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80'
    );
    setFormIsPublished(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormSlug(p.slug);
    setFormDescription(p.description);
    setFormPrice(p.price.toString());
    setFormCompareAt(p.compareAtPrice ? p.compareAtPrice.toString() : '');
    setFormCost(p.cost ? p.cost.toString() : '');
    setFormSku(p.sku);
    setFormCategory(p.category);
    setFormStock(p.stockQuantity.toString());
    setFormLowStockThreshold((p.lowStockThreshold || 5).toString());
    setFormImageUrl(p.images[0] || '');
    setFormIsPublished(p.isPublished);
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formPrice) || 0;
    const compareNum = formCompareAt ? parseFloat(formCompareAt) : undefined;
    const costNum = formCost ? parseFloat(formCost) : undefined;
    const stockNum = parseInt(formStock, 10) || 0;
    const threshNum = parseInt(formLowStockThreshold, 10) || 5;

    const slugClean =
      formSlug.trim() ||
      formName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName,
        slug: slugClean,
        description: formDescription,
        price: priceNum,
        compareAtPrice: compareNum,
        cost: costNum,
        sku: formSku,
        category: formCategory,
        stockQuantity: stockNum,
        lowStockThreshold: threshNum,
        images: [formImageUrl],
        isPublished: formIsPublished,
      });
    } else {
      addProduct({
        storeId: currentStore.id,
        name: formName,
        slug: slugClean,
        description: formDescription,
        price: priceNum,
        compareAtPrice: compareNum,
        cost: costNum,
        sku: formSku,
        category: formCategory,
        stockQuantity: stockNum,
        lowStockThreshold: threshNum,
        images: [formImageUrl],
        isPublished: formIsPublished,
      });
    }

    setIsModalOpen(false);
  };

  // Bulk selection toggles
  const handleToggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Products</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your store's item catalog, pricing, variants, and inventory tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportProductsToCSV(products, currentStore.name)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by product name or SKU..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedCategoryFilter}
            onChange={e => setSelectedCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
          >
            <option value="All">All Categories</option>
            {Array.from(new Set(products.map(p => p.category))).map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
          >
            <option value="all">All Inventory</option>
            <option value="low-stock">Low Stock (≤ 5)</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>

        {/* Bulk Action Controls */}
        {selectedProductIds.length > 0 && (
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl px-3 py-1.5 text-xs">
            <span className="font-semibold text-indigo-900">
              {selectedProductIds.length} selected
            </span>
            <button
              onClick={() => {
                bulkUpdateProductStatus(selectedProductIds, true);
                setSelectedProductIds([]);
              }}
              className="text-xs text-indigo-700 hover:underline font-medium"
            >
              Publish
            </button>
            <button
              onClick={() => {
                bulkUpdateProductStatus(selectedProductIds, false);
                setSelectedProductIds([]);
              }}
              className="text-xs text-indigo-700 hover:underline font-medium"
            >
              Draft
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete ${selectedProductIds.length} selected product(s)?`)) {
                  bulkDeleteProducts(selectedProductIds);
                  setSelectedProductIds([]);
                }
              }}
              className="text-xs text-red-600 hover:underline font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      selectedProductIds.length === filteredProducts.length
                    }
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="py-3 px-3">Product</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Inventory</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => {
                  const isSelected = selectedProductIds.includes(p.id);
                  const isLow = p.stockQuantity <= (p.lowStockThreshold || 5);
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isSelected ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectOne(p.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                            <p className="text-slate-400 text-[11px] line-clamp-1">{p.description}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-600 text-[11px] font-semibold">
                        {p.sku}
                      </td>

                      <td className="py-3 px-3 text-slate-700 font-medium">{p.category}</td>

                      <td className="py-3 px-3 font-bold text-slate-900">
                        {currencySymbol}
                        {p.price.toFixed(2)}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-semibold ${
                              p.stockQuantity <= 0
                                ? 'text-red-600'
                                : isLow
                                ? 'text-amber-600'
                                : 'text-slate-800'
                            }`}
                          >
                            {p.stockQuantity} in stock
                          </span>
                          {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.isPublished
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {p.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${p.name}"?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-xs text-slate-500">Configure catalog details, pricing, and stock.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              {/* Product Name & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Product Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Stoneware Ceramic Teapot"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    SKU Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={e => setFormSku(e.target.value)}
                    placeholder="e.g. HOM-TEA-001"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Price, Compare At, and Cost */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Retail Price ({currencySymbol}) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Compare At Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCompareAt}
                    onChange={e => setFormCompareAt(e.target.value)}
                    placeholder="MSRP"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cost Per Item</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCost}
                    onChange={e => setFormCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Category, Stock & Threshold */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-1 focus:ring-indigo-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Inventory Units</label>
                  <input
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={e => setFormStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Low-Stock Alert Level</label>
                  <input
                    type="number"
                    min="1"
                    value={formLowStockThreshold}
                    onChange={e => setFormLowStockThreshold(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Image URL & Upload */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Image</label>
                <div className="flex items-center gap-3">
                  <img
                    src={formImageUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={e => setFormImageUrl(e.target.value)}
                    placeholder="Image URL"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-xs flex items-center gap-1.5 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload
                  </button>
                </div>
              </div>

              {/* Publication Status */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formIsPublished}
                    onChange={e => setFormIsPublished(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  Publish product immediately to live storefront
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
