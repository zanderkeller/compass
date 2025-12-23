
export interface UserProfile {
  id?: number;
  telegram_id: number;
  telegram_username?: string;
  telegram_first_name?: string;
  telegram_last_name?: string;
  name: string;
  birth_date: string;
  birth_place: string;
  about_me: string;
  problem: string;
  created_at: string;
}

export interface ClientProfile {
  id?: number;
  telegram_id: number;
  selected_widgets: string[]; // JSON массив ID виджетов
  widget_order: string[]; // JSON массив порядка виджетов
  is_pro: boolean;
  energy: number;
  completed_askezas: number;
  settings: string; // JSON объект с настройками
  created_at: string;
  updated_at: string;
}

export interface UserResponses {
  id?: number;
  telegram_id: number;
  response_type: 'checkin' | 'checkout' | 'journal' | 'emotion' | 'askeza' | 'other';
  response_data: string; // JSON объект с данными ответа
  date: string;
  created_at: string;
}

export interface EmotionEntry {
  id?: string | number;
  telegram_id: number;
  type: 'morning' | 'evening';
  emotion: string;
  level: number;
  date: string;
  feelings?: string;
  goals?: string;
  gratitude?: string;
  day_reflection?: string;
  tomorrow_goals?: string;
  day_rating?: number;
  sleep_quality?: number;
  morning_mood?: string;
  today_goals?: string;
  intention?: string;
  created_at: string;
}

export interface JournalEntry {
  id?: number;
  telegram_id: number;
  title: string;
  content: string;
  mood?: string;
  tags?: string;
  created_at: string;
}

export interface AskezaEntry {
  id?: number;
  telegram_id: number;
  title: string;
  icon: string;
  color: string;
  duration: number;
  current_day: number;
  is_active: boolean;
  show_on_home: boolean;
  created_at: string;
  updated_at: string;
}

class DatabaseManager {
  private baseUrl = '/api/database'; // API endpoint на вашем сервере
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Проверяем соединение с сервером и инициализируем базу данных
      const response = await fetch(`${this.baseUrl}/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Ошибка инициализации базы данных: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('База данных инициализирована:', result.message);
      this.initialized = true;
    } catch (error) {
      console.error('Ошибка инициализации базы данных:', error);
      throw error;
    }
  }

  // Методы для работы с пользователями
  async createUser(user: UserProfile): Promise<number> {
    console.log('Создание нового пользователя...');

    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user)
    });

    if (!response.ok) {
      throw new Error(`Ошибка создания пользователя: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`Пользователь создан с ID: ${result.id}`);
    return result.id;
  }

  async getUserByTelegramId(telegramId: number): Promise<UserProfile | null> {
    const response = await fetch(`${this.baseUrl}/users/${telegramId}`);
    
    if (response.status === 404) {
      console.log(`Пользователь с Telegram ID ${telegramId}: не найден`);
      return null;
    }

    if (!response.ok) {
      throw new Error(`Ошибка получения пользователя: ${response.statusText}`);
    }

    const user = await response.json();
    console.log(`Поиск пользователя с Telegram ID ${telegramId}: найден`);
    return user;
  }

  // Методы для работы с профилем клиента
  async createClientProfile(profile: ClientProfile): Promise<number> {
    // Преобразуем массивы в JSON строки для отправки
    const profileData = {
      ...profile,
      selected_widgets: Array.isArray(profile.selected_widgets) 
        ? JSON.stringify(profile.selected_widgets) 
        : profile.selected_widgets,
      widget_order: Array.isArray(profile.widget_order) 
        ? JSON.stringify(profile.widget_order) 
        : profile.widget_order,
      settings: typeof profile.settings === 'string' ? profile.settings : JSON.stringify(profile.settings || {})
    };

    console.log('Отправка данных профиля клиента:', profileData);

    const response = await fetch(`${this.baseUrl}/client-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка создания профиля клиента:', errorText);
      throw new Error(`Ошибка создания профиля клиента: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Профиль клиента создан с ID:', result.id);
    return result.id;
  }

  async getClientProfileByTelegramId(telegramId: number): Promise<ClientProfile | null> {
    const response = await fetch(`${this.baseUrl}/client-profile/${telegramId}`);
    
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Ошибка получения профиля клиента: ${response.statusText}`);
    }

    const profile = await response.json();
    
    // Парсим JSON строки обратно в массивы
    if (profile) {
      try {
        profile.selected_widgets = typeof profile.selected_widgets === 'string' 
          ? JSON.parse(profile.selected_widgets || '[]') 
          : (Array.isArray(profile.selected_widgets) ? profile.selected_widgets : []);
        
        profile.widget_order = typeof profile.widget_order === 'string' 
          ? JSON.parse(profile.widget_order || '[]') 
          : (Array.isArray(profile.widget_order) ? profile.widget_order : []);
        
        profile.settings = typeof profile.settings === 'string' 
          ? profile.settings 
          : JSON.stringify(profile.settings || {});
      } catch (parseError) {
        console.error('Ошибка парсинга данных профиля:', parseError);
        profile.selected_widgets = [];
        profile.widget_order = [];
        profile.settings = '{}';
      }
    }

    return profile;
  }

  async updateClientProfile(telegramId: number, updates: Partial<ClientProfile>): Promise<void> {
    // Преобразуем массивы в JSON строки для отправки
    const updateData = { ...updates };
    
    if (updateData.selected_widgets) {
      updateData.selected_widgets = Array.isArray(updateData.selected_widgets)
        ? JSON.stringify(updateData.selected_widgets)
        : updateData.selected_widgets as any;
    }
    
    if (updateData.widget_order) {
      updateData.widget_order = Array.isArray(updateData.widget_order)
        ? JSON.stringify(updateData.widget_order)
        : updateData.widget_order as any;
    }
    
    if (updateData.settings && typeof updateData.settings !== 'string') {
      updateData.settings = JSON.stringify(updateData.settings);
    }

    console.log('Отправка обновлений профиля клиента:', updateData);

    const response = await fetch(`${this.baseUrl}/client-profile/${telegramId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка обновления профиля клиента:', errorText);
      throw new Error(`Ошибка обновления профиля клиента: ${response.statusText}`);
    }

    console.log('Профиль клиента успешно обновлен');
  }

  // Методы для работы с ответами пользователей
  async createUserResponse(response: UserResponses): Promise<number> {
    const apiResponse = await fetch(`${this.baseUrl}/user-responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(response)
    });

    if (!apiResponse.ok) {
      throw new Error(`Ошибка создания ответа пользователя: ${apiResponse.statusText}`);
    }

    const result = await apiResponse.json();
    return result.id;
  }

  async getUserResponsesByTelegramId(telegramId: number, responseType?: string, limit?: number): Promise<UserResponses[]> {
    let url = `${this.baseUrl}/user-responses/${telegramId}`;
    const params = new URLSearchParams();
    
    if (responseType) params.append('type', responseType);
    if (limit) params.append('limit', limit.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Ошибка получения ответов пользователя: ${response.statusText}`);
    }

    return await response.json();
  }

  // Методы для работы с эмоциональными записями
  async createEmotionEntry(entry: EmotionEntry): Promise<number> {
    const response = await fetch(`${this.baseUrl}/emotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry)
    });

    if (!response.ok) {
      throw new Error(`Ошибка создания эмоциональной записи: ${response.statusText}`);
    }

    const result = await response.json();
    return result.id;
  }

  async getEmotionEntriesByTelegramId(telegramId: number, limit?: number): Promise<EmotionEntry[]> {
    let url = `${this.baseUrl}/emotions/user/${telegramId}`;
    if (limit) {
      url += `?limit=${limit}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Ошибка получения эмоциональных записей: ${response.statusText}`);
    }

    return await response.json();
  }

  async getEmotionEntryByDate(telegramId: number, date: string, type: 'morning' | 'evening'): Promise<EmotionEntry | null> {
    const response = await fetch(`${this.baseUrl}/emotions/user/${telegramId}/date/${date}/${type}`);
    
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Ошибка получения эмоциональной записи: ${response.statusText}`);
    }

    return await response.json();
  }

  // Методы для работы с журнальными записями
  async createJournalEntry(entry: JournalEntry): Promise<number> {
    const response = await fetch(`${this.baseUrl}/journal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry)
    });

    if (!response.ok) {
      throw new Error(`Ошибка создания журнальной записи: ${response.statusText}`);
    }

    const result = await response.json();
    return result.id;
  }

  async getJournalEntriesByTelegramId(telegramId: number, limit?: number): Promise<JournalEntry[]> {
    let url = `${this.baseUrl}/journal/user/${telegramId}`;
    if (limit) {
      url += `?limit=${limit}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Ошибка получения журнальных записей: ${response.statusText}`);
    }

    return await response.json();
  }

  // Методы для работы с аскезами
  async createAskezaEntry(entry: AskezaEntry): Promise<number> {
    const response = await fetch(`${this.baseUrl}/askeza`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry)
    });

    if (!response.ok) {
      throw new Error(`Ошибка создания аскезы: ${response.statusText}`);
    }

    const result = await response.json();
    return result.id;
  }

  async getAskezaEntriesByTelegramId(telegramId: number): Promise<AskezaEntry[]> {
    const response = await fetch(`${this.baseUrl}/askeza/user/${telegramId}`);

    if (!response.ok) {
      throw new Error(`Ошибка получения аскез: ${response.statusText}`);
    }

    return await response.json();
  }

  async getActiveAskezasForHome(telegramId: number): Promise<AskezaEntry[]> {
    const response = await fetch(`${this.baseUrl}/askeza/user/${telegramId}/home`);

    if (!response.ok) {
      throw new Error(`Ошибка получения аскез для главной: ${response.statusText}`);
    }

    return await response.json();
  }

  async getCurrentAskeza(telegramId: number): Promise<AskezaEntry | null> {
    const askezas = await this.getAskezaEntriesByTelegramId(telegramId);
    return askezas.find(a => a.is_active) || null;
  }

  async updateAskezaEntry(id: number, updates: Partial<AskezaEntry>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/askeza/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      throw new Error(`Ошибка обновления аскезы: ${response.statusText}`);
    }
  }

  async deleteAskezaEntry(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/askeza/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Ошибка удаления аскезы: ${response.statusText}`);
    }
  }

  // Утилитарные методы
  async clearAllData(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/clear`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Ошибка очистки данных: ${response.statusText}`);
    }
  }

  async exportData(): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/export`);

    if (!response.ok) {
      throw new Error(`Ошибка экспорта данных: ${response.statusText}`);
    }

    return await response.blob();
  }

  async importData(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('database', file);

    const response = await fetch(`${this.baseUrl}/import`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Ошибка импорта данных: ${response.statusText}`);
    }
  }

  // Метод для проверки состояния базы данных
  async getDatabaseInfo(): Promise<{ userCount: number; emotionCount: number; journalCount: number; askezaCount: number; clientProfileCount: number; userResponsesCount: number }> {
    const response = await fetch(`${this.baseUrl}/info`);

    if (!response.ok) {
      throw new Error(`Ошибка получения информации о базе: ${response.statusText}`);
    }

    return await response.json();
  }
}

export const dbManager = new DatabaseManager();

// Функция для получения Telegram ID пользователя
export const getTelegramUserId = (): number => {
  // В реальном Telegram WebApp
  if (window.Telegram?.WebApp?.initDataUnsafe?.user?.id) {
    return window.Telegram.WebApp.initDataUnsafe.user.id;
  }
  
  // Для тестирования локально - используем фиксированный ID
  return 123456789;
};

// Функция для получения данных пользователя Telegram
export const getTelegramUserData = () => {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return window.Telegram.WebApp.initDataUnsafe.user;
  }
  
  // Для тестирования локально
  return {
    id: 123456789,
    first_name: 'Тестовый',
    last_name: 'Пользователь',
    username: 'testuser'
  };
};
