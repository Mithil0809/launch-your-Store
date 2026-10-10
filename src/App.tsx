import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { MarketingPage } from './components/marketing/MarketingPage';
import { Wizard } from './components/wizard/Wizard';
import { AdminLayout } from './components/admin/AdminLayout';
import { Storefront } from './components/storefront/Storefront';

const AppContent: React.FC = () => {
  const { activeView, setActiveView, setStorefrontSlug } = useStore();

  // Handle URL path on first load (e.g. /store/:slug)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/store/')) {
      const slug = path.replace('/store/', '').trim();
      if (slug) {
        setStorefrontSlug(slug);
        setActiveView('storefront');
      }
    }
  }, [setActiveView, setStorefrontSlug]);

  return (
    <>
      {activeView === 'marketing' && <MarketingPage />}
      {activeView === 'wizard' && <Wizard />}
      {activeView === 'dashboard' && <AdminLayout />}
      {activeView === 'storefront' && <Storefront />}
    </>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
