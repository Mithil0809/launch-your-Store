import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { THEME_DEFINITIONS } from '../../themes/themeStyles';
import {
  Rocket,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  FileSpreadsheet,
  Palette,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Layers,
  BarChart3,
  ExternalLink,
  Store,
  Zap,
} from 'lucide-react';

export const MarketingPage: React.FC = () => {
  const { openWizard, openDashboard, openStorefront } = useStore();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [previewThemeTab, setPreviewThemeTab] = useState<'minimal' | 'luxe' | 'bold' | 'natural'>('luxe');

  const faqs = [
    {
      q: 'How fast can I launch a fully working store?',
      a: 'In under 3 minutes. Our 7-step guided onboarding wizard collects your business information, imports sample products or your own CSV, lets you pick a theme, and publishes a live storefront at your unique URL immediately.',
    },
    {
      q: 'Can I upload an existing product spreadsheet?',
      a: 'Yes! LaunchYourStore includes a full CSV and spreadsheet parsing engine. It automatically detects column headers, maps fields (Price, SKU, Stock, Name), performs row-level validation, and lets you download error reports.',
    },
    {
      q: 'How does the AI Store Assistant answer questions?',
      a: 'The assistant deterministically aggregates your store’s real database records (completed orders, unit counts, low stock alerts, revenue) and passes the verified metrics to Gemini. Every answer includes a transparent "Data behind this answer" panel.',
    },
    {
      q: 'Are themes just colors, or do they change the layout?',
      a: 'Each of our 4 built-in themes (Minimal, Luxe, Bold, Natural) provides a completely distinct visual architecture—custom typography, button shapes, badge treatments, hero layouts, and product grid densities.',
    },
    {
      q: 'How does multi-tenancy work?',
      a: 'Every store record (products, orders, customers, inventory logs, themes) is strictly scoped to its authenticated store identifier. You can create multiple stores and switch between them instantly.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-indigo-600/25">
              L
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                LaunchYourStore
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                AI SaaS
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition">Features</a>
            <a href="#themes" className="hover:text-slate-900 transition">Themes</a>
            <a href="#workflow" className="hover:text-slate-900 transition">How It Works</a>
            <a href="#faq" className="hover:text-slate-900 transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openDashboard()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Demo Admin
            </button>
            <button
              onClick={openWizard}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <Rocket className="w-4 h-4" /> Create Your Store
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation No-Code E-Commerce SaaS
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Your online store.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Live in minutes.
            </span>
          </h1>

          <p className="text-slate-600 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Launch a complete, multi-tenant e-commerce boutique without writing code. Choose a curated theme, import your spreadsheet catalog, and ask an AI assistant questions about real store sales.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={openWizard}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition active:scale-95"
            >
              Start Free Onboarding Wizard <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => openStorefront('aura-studio')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm border border-slate-300 shadow-sm flex items-center justify-center gap-2 transition"
            >
              <ExternalLink className="w-4 h-4 text-indigo-600" /> Explore Demo Storefront
            </button>
          </div>

          {/* Trust badges */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500 font-semibold">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant Live Unique URL
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 4 Tailored Retail Themes
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> AI Grounded in Real Data
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> CSV & Excel Spreadsheet Import
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Complete Commerce Infrastructure
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything modern merchants need
            </h2>
            <p className="text-slate-500 text-sm">
              Not a static prototype. A fully operational, production-oriented SaaS application designed for scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Wizard */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 hover:border-indigo-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <Rocket className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">7-Step Guided Wizard</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Step-by-step onboarding with automatic URL slug validation, category selection, sample product generation, and launch celebrations.
              </p>
            </div>

            {/* Feature 2: Spreadsheet Engine */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 hover:border-emerald-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Spreadsheet Import & Export</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Drag-and-drop CSV parser with intelligent header auto-mapping, row-level validation, downloadable error reports, and duplicate SKU detection.
              </p>
            </div>

            {/* Feature 3: Grounded AI Assistant */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 hover:border-purple-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">AI Store Assistant</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Natural-language Q&A powered by Gemini and grounded strictly in verified database metrics with honest data transparency tables.
              </p>
            </div>

            {/* Feature 4: 4 Themes */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 hover:border-amber-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Palette className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">4 Tailored Store Themes</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Minimal, Luxe, Bold, and Natural archetypes that change full storefront typography, card structures, buttons, and layout grids.
              </p>
            </div>

            {/* Feature 5: Multi-Tenant Architecture */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Strict Multi-Tenant Isolation</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Owner and staff roles, store-scoped catalog operations, inventory audit logs, and zero cross-tenant data leakage.
              </p>
            </div>

            {/* Feature 6: Fulfillment & Inventory */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 hover:border-rose-300 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900">Full Order & Inventory Lifecycle</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                From customer cart and sandbox checkout to Placed, Packed, Shipped, and Delivered statuses with automatic stock adjustments and printable slips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Showcase Section */}
      <section id="themes" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Design Systems
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Themes engineered for high conversion
            </h2>
            <p className="text-slate-500 text-sm">
              Explore our four distinct storefront themes. Toggle between them below to preview the aesthetic.
            </p>
          </div>

          {/* Theme switcher tabs */}
          <div className="flex justify-center gap-2 overflow-x-auto pb-2">
            {(['minimal', 'luxe', 'bold', 'natural'] as const).map(t => (
              <button
                key={t}
                onClick={() => setPreviewThemeTab(t)}
                className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition ${
                  previewThemeTab === t
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {THEME_DEFINITIONS[t].name}
              </button>
            ))}
          </div>

          {/* Featured Theme Showcase Card */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2">
            <div className="relative aspect-square md:aspect-auto">
              <img
                src={THEME_DEFINITIONS[previewThemeTab].previewImage}
                alt={THEME_DEFINITIONS[previewThemeTab].name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  {THEME_DEFINITIONS[previewThemeTab].tagline}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {THEME_DEFINITIONS[previewThemeTab].name} Theme
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-3 leading-relaxed">
                  {THEME_DEFINITIONS[previewThemeTab].description}
                </p>

                <div className="mt-6 space-y-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      Typography: {THEME_DEFINITIONS[previewThemeTab].typography.fontHeading}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      Hero Layout: {THEME_DEFINITIONS[previewThemeTab].layout.heroStyle} layout
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Card Aesthetic: {THEME_DEFINITIONS[previewThemeTab].layout.cardStyle}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={openWizard}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition"
              >
                Launch with {THEME_DEFINITIONS[previewThemeTab].name} Theme <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Setup Workflow */}
      <section id="workflow" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Simplicity First
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Three steps to your live online store
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto shadow-md shadow-indigo-600/30">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900">Define Your Business</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Provide your store name, logo, operational contact info, and claim your custom URL slug.
              </p>
            </div>

            <div className="text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto shadow-md shadow-indigo-600/30">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900">Populate Your Catalog</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate realistic demo products for your categories or drag-and-drop an inventory CSV file.
              </p>
            </div>

            <div className="text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto shadow-md shadow-indigo-600/30">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900">Publish & Sell</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pick a high-converting theme, set up your policies, and publish your store to the live web.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">FAQ</span>
            <h2 className="text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <span className="font-bold text-white text-base">LaunchYourStore</span>
            <p className="text-slate-400 text-xs leading-relaxed">
              AI-Powered E-Commerce Builder SaaS platform designed for modern online merchants.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] mb-3">Product</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={openWizard} className="hover:text-white transition">
                  Store Setup Wizard
                </button>
              </li>
              <li>
                <button onClick={() => openDashboard()} className="hover:text-white transition">
                  Admin Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => openStorefront('aura-studio')}
                  className="hover:text-white transition"
                >
                  Live Storefront Preview
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] mb-3">Architecture</h4>
            <ul className="space-y-2 text-slate-400">
              <li>Multi-Tenant Isolation</li>
              <li>Server-Side Gemini 3.8 Flash</li>
              <li>CSV & Spreadsheet Importer</li>
              <li>Order & Stock Reservation</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] mb-3">Get Started</h4>
            <p className="text-slate-400 text-xs mb-3">
              Ready to launch your e-commerce presence today?
            </p>
            <button
              onClick={openWizard}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 shadow-md transition"
            >
              Create Your Store
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} LaunchYourStore Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
