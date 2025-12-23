
import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

// Lazy loading компонентов
const HomePage = lazy(() => import('../pages/home/page'));
const OnboardingPage = lazy(() => import('../pages/onboarding/page'));
const MorningCheckinPage = lazy(() => import('../pages/checkin/morning/page'));
const EveningCheckinPage = lazy(() => import('../pages/checkin/evening/page'));
const EmotionsPage = lazy(() => import('../pages/emotions/page'));
const JournalPage = lazy(() => import('../pages/journal/page'));
const AskezaPage = lazy(() => import('../pages/askeza/page'));
const MenuPage = lazy(() => import('../pages/menu/page'));
const SettingsPage = lazy(() => import('../pages/settings/page'));
const AdminPage = lazy(() => import('../pages/admin/page'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />
  },
  {
    path: '/checkin/morning',
    element: <MorningCheckinPage />
  },
  {
    path: '/checkin/evening',
    element: <EveningCheckinPage />
  },
  {
    path: '/emotions',
    element: <EmotionsPage />
  },
  {
    path: '/journal',
    element: <JournalPage />
  },
  {
    path: '/askeza',
    element: <AskezaPage />
  },
  {
    path: '/menu',
    element: <MenuPage />
  },
  {
    path: '/settings',
    element: <SettingsPage />
  },
  {
    path: '/admin',
    element: <AdminPage />
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
];

export default routes;
