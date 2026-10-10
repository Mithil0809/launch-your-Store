import { ThemeId, StoreThemeConfig } from '../types/store';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  previewImage: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    cardBg: string;
    text: string;
    muted: string;
    border: string;
  };
  typography: {
    fontHeading: string;
    fontBody: string;
    headingStyle: string;
  };
  layout: {
    heroStyle: 'split' | 'centered' | 'full-bleed';
    cardStyle: 'clean' | 'card' | 'bordered';
    buttonStyle: string;
    badgeStyle: string;
    gridDensity: string;
  };
}

export const THEME_DEFINITIONS: Record<ThemeId, ThemeDefinition> = {
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    tagline: 'Architectural clarity & spacious grids',
    description: 'Clean typography, generous whitespace, razor-sharp lines, and understated neutral tones.',
    previewImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    colors: {
      primary: '#111827',
      accent: '#4F46E5',
      background: '#F9FAFB',
      cardBg: '#FFFFFF',
      text: '#111827',
      muted: '#6B7280',
      border: '#E5E7EB',
    },
    typography: {
      fontHeading: 'Inter, system-ui, sans-serif',
      fontBody: 'Inter, system-ui, sans-serif',
      headingStyle: 'font-semibold tracking-tight text-gray-900',
    },
    layout: {
      heroStyle: 'centered',
      cardStyle: 'clean',
      buttonStyle: 'rounded-none uppercase tracking-wider font-medium text-xs py-3 px-6 shadow-none',
      badgeStyle: 'rounded-none text-xs font-mono uppercase bg-gray-900 text-white px-2 py-0.5',
      gridDensity: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8',
    },
  },
  luxe: {
    id: 'luxe',
    name: 'Luxe',
    tagline: 'High-fashion editorial elegance',
    description: 'Editorial serif typography, warm ivory palette, champagne gold accents, and magazine-quality layouts.',
    previewImage: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    colors: {
      primary: '#18181B',
      accent: '#B89758',
      background: '#FDFBF7',
      cardBg: '#FFFFFF',
      text: '#1C1917',
      muted: '#78716C',
      border: '#E7E5E4',
    },
    typography: {
      fontHeading: 'Georgia, "Playfair Display", serif',
      fontBody: 'Inter, system-ui, sans-serif',
      headingStyle: 'font-normal italic tracking-normal text-stone-900',
    },
    layout: {
      heroStyle: 'split',
      cardStyle: 'bordered',
      buttonStyle: 'rounded-none font-serif tracking-widest text-xs uppercase py-3.5 px-8 border border-stone-900 transition-all hover:bg-stone-900 hover:text-white',
      badgeStyle: 'rounded-none text-[10px] tracking-widest uppercase bg-[#B89758] text-white px-2.5 py-1',
      gridDensity: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10',
    },
  },
  bold: {
    id: 'bold',
    name: 'Bold',
    tagline: 'High-voltage contrast & modern impact',
    description: 'Vibrant electric violet accents, thick uppercase headlines, prominent pill tags, and promotional sections.',
    previewImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    colors: {
      primary: '#4F46E5',
      accent: '#EC4899',
      background: '#0F172A',
      cardBg: '#1E293B',
      text: '#F8FAFC',
      muted: '#94A3B8',
      border: '#334155',
    },
    typography: {
      fontHeading: 'system-ui, -apple-system, sans-serif',
      fontBody: 'system-ui, -apple-system, sans-serif',
      headingStyle: 'font-black uppercase tracking-tight text-white',
    },
    layout: {
      heroStyle: 'full-bleed',
      cardStyle: 'card',
      buttonStyle: 'rounded-xl font-bold tracking-wide text-sm py-3.5 px-7 shadow-lg shadow-indigo-500/25 transition-transform active:scale-95',
      badgeStyle: 'rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-3 py-1 shadow-sm',
      gridDensity: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
    },
  },
  natural: {
    id: 'natural',
    name: 'Natural',
    tagline: 'Organic serenity & warm lifestyle tones',
    description: 'Sage greens, warm terracotta accents, soft rounded corners, and relaxing natural textures.',
    previewImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
    colors: {
      primary: '#2D3748',
      accent: '#2F855A',
      background: '#F7F6F2',
      cardBg: '#FFFFFF',
      text: '#2D3748',
      muted: '#718096',
      border: '#E2E8F0',
    },
    typography: {
      fontHeading: 'Inter, system-ui, sans-serif',
      fontBody: 'Inter, system-ui, sans-serif',
      headingStyle: 'font-medium tracking-normal text-slate-800',
    },
    layout: {
      heroStyle: 'split',
      cardStyle: 'card',
      buttonStyle: 'rounded-2xl font-medium text-sm py-3 px-6 bg-emerald-800 text-white hover:bg-emerald-900 shadow-sm transition-all',
      badgeStyle: 'rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 px-3 py-0.5',
      gridDensity: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7',
    },
  },
};

export function getDefaultThemeConfig(themeId: ThemeId): StoreThemeConfig {
  const def = THEME_DEFINITIONS[themeId];
  return {
    themeId,
    primaryColor: def.colors.primary,
    accentColor: def.colors.accent,
    fontHeading: def.typography.fontHeading,
    fontBody: def.typography.fontBody,
    heroBannerUrl: def.previewImage,
    heroHeadline: 'Crafted For Modern Living',
    heroSubheadline: 'Explore our curated collection of premium essentials made with uncompromising care and intention.',
    heroCtaText: 'Shop New Arrivals',
    heroLayout: def.layout.heroStyle,
    productCardStyle: def.layout.cardStyle,
    visibleSections: {
      hero: true,
      featuredCategories: true,
      featuredProducts: true,
      promoBanner: true,
      bestsellers: true,
      newsletter: true,
    },
  };
}
