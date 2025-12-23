
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { Suspense } from 'react';
import LiquidGlassBackground from './components/feature/LiquidGlassBackground';

function App() {
  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <div className="min-h-screen relative">
        <LiquidGlassBackground />
        <div className="relative z-10">
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/70">Загрузка...</p>
              </div>
            </div>
          }>
            <AppRoutes />
          </Suspense>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

