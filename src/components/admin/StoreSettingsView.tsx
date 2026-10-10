import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CURRENCY_SYMBOLS } from '../../data/seedData';
import {
  Settings,
  Globe,
  Save,
  Check,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Copy,
  Lock,
} from 'lucide-react';

export const StoreSettingsView: React.FC = () => {
  const { currentStore, updateStore, checkSlugAvailability, openStorefront } = useStore();

  const [name, setName] = useState(currentStore.name);
  const [slug, setSlug] = useState(currentStore.slug);
  const [slugStatus, setSlugStatus] = useState<{ available: boolean; message: string }>({
    available: true,
    message: '',
  });
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [description, setDescription] = useState(currentStore.description);
  const [email, setEmail] = useState(currentStore.email);
  const [phone, setContactPhone] = useState(currentStore.phone);
  const [currency, setCurrency] = useState(currentStore.settings.currency);
  const [taxRate, setTaxRate] = useState(currentStore.settings.taxRate);
  const [taxInclusive, setTaxInclusive] = useState(currentStore.settings.taxInclusive);
  const [shippingFlatRate, setShippingFlatRate] = useState(
    currentStore.settings.shippingFlatRate
  );
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    currentStore.settings.freeShippingThreshold
  );
  const [shippingPolicy, setShippingPolicy] = useState(currentStore.settings.shippingPolicy);
  const [returnPolicy, setReturnPolicy] = useState(currentStore.settings.returnPolicy);

  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSlugBlur = async () => {
    if (slug === currentStore.slug) {
      setSlugStatus({ available: true, message: 'Current slug' });
      return;
    }
    setIsCheckingSlug(true);
    const res = await checkSlugAvailability(slug);
    setSlugStatus({ available: res.available, message: res.reason });
    setIsCheckingSlug(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slugStatus.available && slug !== currentStore.slug) return;

    updateStore({
      name,
      slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-'),
      description,
      email,
      phone,
      settings: {
        ...currentStore.settings,
        currency,
        currencySymbol: CURRENCY_SYMBOLS[currency] || '$',
        taxRate,
        taxInclusive,
        shippingFlatRate,
        freeShippingThreshold,
        shippingPolicy,
        returnPolicy,
      },
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleCopyStoreUrl = () => {
    const url = `${window.location.origin}/store/${currentStore.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Store Settings & URL</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure URL routes, regional currencies, sales taxation, and customer policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Settings Saved!
            </span>
          )}

          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Storefront URL & Publishing Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Globe className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Live URL & Domain Route</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store URL Slug</label>
              <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                <span className="bg-slate-100 text-slate-500 px-3 py-2 text-xs select-none border-r border-slate-200 font-mono">
                  /store/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  onBlur={handleSlugBlur}
                  className="w-full px-3 py-2 text-xs focus:outline-none font-mono"
                />
              </div>
              {isCheckingSlug ? (
                <span className="text-[11px] text-slate-400 mt-1 block">Checking availability...</span>
              ) : (
                slugStatus.message && (
                  <span
                    className={`text-[11px] font-semibold mt-1 block ${
                      slugStatus.available ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {slugStatus.available ? '✓ URL is valid and ready' : `✕ ${slugStatus.message}`}
                  </span>
                )
              )}
            </div>

            <div className="flex flex-col justify-end">
              <label className="block font-semibold text-slate-700 mb-1">Live Storefront Link</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openStorefront(currentStore.slug)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open /store/{currentStore.slug}
                </button>
                <button
                  type="button"
                  onClick={handleCopyStoreUrl}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-xs text-slate-700"
                >
                  {copiedLink ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
            <strong>Subdomain & Custom Domain Deployment:</strong> This applet operates on development and production environments using live unique routes (e.g.{' '}
            <code className="text-indigo-600 font-bold">/store/{currentStore.slug}</code>). In external custom domain setups (e.g.{' '}
            <code className="text-indigo-600 font-bold">{currentStore.slug}.yourplatform.com</code>), configure a CNAME record pointing to your cloud run hosting endpoint.
          </div>
        </div>

        {/* General Business Information */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Business Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Short Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Public Contact Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Financial, Currency & Taxation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Currency & Taxation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
                <option value="CAD">CAD (CA$) - Canadian Dollar</option>
                <option value="AUD">AUD (AU$) - Australian Dollar</option>
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="JPY">JPY (¥) - Japanese Yen</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sales Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={taxRate}
                onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={taxInclusive}
                  onChange={e => setTaxInclusive(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                Prices include tax
              </label>
            </div>
          </div>
        </div>

        {/* Shipping & Policies */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Shipping Rules & Customer Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Standard Shipping Flat Rate ({CURRENCY_SYMBOLS[currency] || '$'})
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={shippingFlatRate}
                onChange={e => setShippingFlatRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Free Shipping Threshold ({CURRENCY_SYMBOLS[currency] || '$'})
              </label>
              <input
                type="number"
                step="5"
                min="0"
                value={freeShippingThreshold}
                onChange={e => setFreeShippingThreshold(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Shipping Policy</label>
              <textarea
                rows={3}
                value={shippingPolicy}
                onChange={e => setShippingPolicy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Return & Refund Policy</label>
              <textarea
                rows={3}
                value={returnPolicy}
                onChange={e => setReturnPolicy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
