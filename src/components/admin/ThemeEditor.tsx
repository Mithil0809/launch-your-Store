import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ThemeId, StoreThemeConfig } from '../../types/store';
import { THEME_DEFINITIONS } from '../../themes/themeStyles';
import { CURRENCY_SYMBOLS } from '../../data/seedData';
import {
  Monitor,
  Tablet,
  Smartphone,
  Save,
  RotateCcw,
  Check,
  Palette,
  Layout,
  Type,
  Eye,
  Sliders,
  ExternalLink,
} from 'lucide-react';

export const ThemeEditor: React.FC = () => {
  const { currentStore, updateStore, openStorefront } = useStore();
  const currencySymbol = CURRENCY_SYMBOLS[currentStore.settings.currency] || '$';

  // Working draft state
  const [themeId, setThemeId] = useState<ThemeId>(currentStore.themeConfig.themeId);
  const [primaryColor, setPrimaryColor] = useState(currentStore.themeConfig.primaryColor);
  const [accentColor, setAccentColor] = useState(currentStore.themeConfig.accentColor);
  const [heroHeadline, setHeroHeadline] = useState(currentStore.themeConfig.heroHeadline);
  const [heroSubheadline, setHeroSubheadline] = useState(currentStore.themeConfig.heroSubheadline);
  const [heroCtaText, setHeroCtaText] = useState(currentStore.themeConfig.heroCtaText);
  const [heroBannerUrl, setHeroBannerUrl] = useState(currentStore.themeConfig.heroBannerUrl);
  const [announcementText, setAnnouncementText] = useState(
    currentStore.settings.announcementBar?.text || 'Free shipping on orders over $50'
  );
  const [announcementEnabled, setAnnouncementEnabled] = useState(
    currentStore.settings.announcementBar?.enabled ?? true
  );

  const [visibleSections, setVisibleSections] = useState({
    hero: currentStore.themeConfig.visibleSections?.hero ?? true,
    featuredCategories: currentStore.themeConfig.visibleSections?.featuredCategories ?? true,
    featuredProducts: currentStore.themeConfig.visibleSections?.featuredProducts ?? true,
    promoBanner: currentStore.themeConfig.visibleSections?.promoBanner ?? true,
    bestsellers: currentStore.themeConfig.visibleSections?.bestsellers ?? true,
    newsletter: currentStore.themeConfig.visibleSections?.newsletter ?? true,
  });

  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'style' | 'content' | 'sections'>('style');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Undo changes to stored configuration
  const handleUndo = () => {
    setThemeId(currentStore.themeConfig.themeId);
    setPrimaryColor(currentStore.themeConfig.primaryColor);
    setAccentColor(currentStore.themeConfig.accentColor);
    setHeroHeadline(currentStore.themeConfig.heroHeadline);
    setHeroSubheadline(currentStore.themeConfig.heroSubheadline);
    setHeroCtaText(currentStore.themeConfig.heroCtaText);
    setHeroBannerUrl(currentStore.themeConfig.heroBannerUrl);
    setAnnouncementText(currentStore.settings.announcementBar?.text || '');
    setAnnouncementEnabled(currentStore.settings.announcementBar?.enabled ?? true);
    setVisibleSections(currentStore.themeConfig.visibleSections);
  };

  // Publish / Save changes
  const handlePublishTheme = () => {
    const updatedThemeConfig: StoreThemeConfig = {
      ...currentStore.themeConfig,
      themeId,
      primaryColor,
      accentColor,
      heroHeadline,
      heroSubheadline,
      heroCtaText,
      heroBannerUrl,
      visibleSections,
    };

    updateStore({
      themeConfig: updatedThemeConfig,
      settings: {
        ...currentStore.settings,
        announcementBar: {
          enabled: announcementEnabled,
          text: announcementText,
          link: `/store/${currentStore.slug}`,
        },
      },
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const currentThemeDef = THEME_DEFINITIONS[themeId];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visual Theme & Content Editor</h1>
          <p className="text-xs text-slate-500 mt-1">
            Customize typography, color palettes, hero messaging, and toggle storefront sections in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Published Live!
            </span>
          )}

          <button
            onClick={handleUndo}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" /> Undo Edits
          </button>

          <button
            onClick={handlePublishTheme}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <Save className="w-4 h-4" /> Save & Publish
          </button>
        </div>
      </div>

      {/* Editor Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Settings Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
          {/* Editor Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('style')}
              className={`flex-1 py-1.5 rounded-lg text-center transition ${
                activeTab === 'style'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Theme & Style
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 py-1.5 rounded-lg text-center transition ${
                activeTab === 'content'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Content Copy
            </button>
            <button
              onClick={() => setActiveTab('sections')}
              className={`flex-1 py-1.5 rounded-lg text-center transition ${
                activeTab === 'sections'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sections
            </button>
          </div>

          {/* TAB 1: Style & Theme */}
          {activeTab === 'style' && (
            <div className="space-y-5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-2">Base Theme Archetype</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['minimal', 'luxe', 'bold', 'natural'] as ThemeId[]).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setThemeId(t);
                        setPrimaryColor(THEME_DEFINITIONS[t].colors.primary);
                        setAccentColor(THEME_DEFINITIONS[t].colors.accent);
                      }}
                      className={`p-2.5 rounded-xl border text-left capitalize font-semibold transition ${
                        themeId === t
                          ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900 ring-1 ring-indigo-600'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="block font-bold">{THEME_DEFINITIONS[t].name}</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {THEME_DEFINITIONS[t].tagline}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Customization */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="block font-bold text-slate-800">Color Palette</label>
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-md border border-slate-300 shadow-xs"
                      style={{ backgroundColor: primaryColor }}
                    />
                    <span className="font-semibold text-slate-800">Primary Color</span>
                  </div>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-md border border-slate-300 shadow-xs"
                      style={{ backgroundColor: accentColor }}
                    />
                    <span className="font-semibold text-slate-800">Accent Color</span>
                  </div>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={e => setAccentColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Content Copy */}
          {activeTab === 'content' && (
            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">Announcement Bar</label>
                  <label className="flex items-center gap-1 cursor-pointer text-indigo-600">
                    <input
                      type="checkbox"
                      checked={announcementEnabled}
                      onChange={e => setAnnouncementEnabled(e.target.checked)}
                      className="rounded border-slate-300 w-3.5 h-3.5"
                    />
                    Enabled
                  </label>
                </div>
                <input
                  type="text"
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hero Main Headline</label>
                <input
                  type="text"
                  value={heroHeadline}
                  onChange={e => setHeroHeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hero Subheadline</label>
                <textarea
                  rows={3}
                  value={heroSubheadline}
                  onChange={e => setHeroSubheadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hero Button Label</label>
                <input
                  type="text"
                  value={heroCtaText}
                  onChange={e => setHeroCtaText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hero Banner Image URL</label>
                <input
                  type="text"
                  value={heroBannerUrl}
                  onChange={e => setHeroBannerUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Section Visibility */}
          {activeTab === 'sections' && (
            <div className="space-y-3 text-xs">
              <label className="block font-bold text-slate-800">Toggle Homepage Sections</label>
              {Object.entries(visibleSections).map(([secKey, isVisible]) => (
                <div
                  key={secKey}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white"
                >
                  <span className="font-semibold capitalize text-slate-800">
                    {secKey.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={e =>
                      setVisibleSections({ ...visibleSections, [secKey]: e.target.checked })
                    }
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Live Viewport Interactive Sandbox (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Live Storefront Viewport
              </span>
              <span className="text-[11px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                {currentThemeDef.name} Theme
              </span>
            </div>

            {/* Viewport Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  viewport === 'desktop'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Desktop 1280px"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  viewport === 'tablet'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Tablet 768px"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                  viewport === 'mobile'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Mobile 375px"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Device Mockup Canvas */}
          <div
            className={`mx-auto w-full transition-all duration-300 border border-slate-300 rounded-2xl overflow-hidden shadow-lg bg-slate-50 ${
              viewport === 'mobile' ? 'max-w-xs' : viewport === 'tablet' ? 'max-w-md' : 'max-w-full'
            }`}
          >
            {/* Announcement banner */}
            {announcementEnabled && (
              <div
                className="py-1.5 px-3 text-center text-[10px] font-semibold text-white tracking-wide"
                style={{ backgroundColor: primaryColor }}
              >
                {announcementText}
              </div>
            )}

            {/* Header */}
            <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span
                className="font-bold text-sm tracking-tight text-slate-900"
                style={{ fontFamily: currentThemeDef.typography.fontHeading }}
              >
                {currentStore.name}
              </span>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span>Shop</span>
                <span className="font-bold" style={{ color: primaryColor }}>
                  Cart (2)
                </span>
              </div>
            </div>

            {/* Hero Section */}
            {visibleSections.hero && (
              <div className="p-6 bg-white border-b border-slate-100 flex flex-col items-center text-center">
                <h3
                  className="text-lg font-bold text-slate-900 mb-1.5"
                  style={{ fontFamily: currentThemeDef.typography.fontHeading }}
                >
                  {heroHeadline}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
                  {heroSubheadline}
                </p>
                <button
                  type="button"
                  className="px-5 py-2 text-xs font-semibold text-white rounded-lg shadow-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  {heroCtaText}
                </button>
              </div>
            )}

            {/* Sample Catalog Products */}
            <div className="p-4 grid grid-cols-2 gap-3 bg-slate-50">
              <div className="border border-slate-200 rounded-xl p-2.5 bg-white">
                <img
                  src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80"
                  alt=""
                  className="aspect-square rounded-lg object-cover mb-2"
                />
                <p className="font-bold text-xs truncate">Handmade Ceramic Vessel</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: accentColor }}>
                  {currencySymbol}64.00
                </p>
              </div>
              <div className="border border-slate-200 rounded-xl p-2.5 bg-white">
                <img
                  src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80"
                  alt=""
                  className="aspect-square rounded-lg object-cover mb-2"
                />
                <p className="font-bold text-xs truncate">Sandstone Ambient Lamp</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: accentColor }}>
                  {currencySymbol}145.00
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
