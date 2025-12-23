
/// <reference types="vite/client" />

declare const __BASE_PATH__: string;
declare const __IS_PREVIEW__: boolean;

// Типы для Telegram Web App
interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText(text: string): void;
    onClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };
  BackButton: {
    isVisible: boolean;
    onClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
  };
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
}

interface TelegramWebApps {
  WebApp: TelegramWebApp;
}

declare global {
  interface Window {
    Telegram?: TelegramWebApps;
  }
  
  // Глобальные переменные Vite
  const __BASE_PATH__: string;
  const __IS_PREVIEW__: boolean;
}

export {};
