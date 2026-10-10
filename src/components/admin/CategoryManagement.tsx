import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Plus, Trash2, Tag, Search, Sparkles } from 'lucide-react';

export const CategoryManagement: React.FC = () => {
  const { categories, addCategory, deleteCategory, products } = useStore();
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [search, setSearch] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      slug: newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      icon: 'Tag',
      description: newCatDesc.trim() || 'Curated departmental collection.',
    });

    setNewCatName('');
    setNewCatDesc('');
  };

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Categories</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize products into distinct navigation collections for your customers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Category Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900">Add New Category</h3>
          <form onSubmit={handleAdd} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Category Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="e.g. Leather Accessories"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={newCatDesc}
                onChange={e => setNewCatDesc(e.target.value)}
                placeholder="Brief description for storefront page headers"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">
              Active Store Categories ({categories.length})
            </h3>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter categories..."
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs w-48"
            />
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
            {filtered.map(cat => {
              const count = products.filter(p => p.category === cat.name).length;
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{cat.name}</h4>
                      <p className="text-slate-500 text-[11px]">{cat.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {count} product(s)
                    </span>
                    {cat.isCustom && (
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded-lg"
                        title="Delete custom category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
