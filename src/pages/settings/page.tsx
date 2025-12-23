
import { useState, useEffect } from 'react';
import GlassCard from '../../components/base/GlassCard';
import BottomNavigation from '../../components/feature/BottomNavigation';
import { dbManager, getTelegramUserId } from '../../utils/database';

interface Widget {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  isPro?: boolean;
}

const allWidgets: Widget[] = [
  {
    id: 'askeza',
    title: 'Аскеза',
    description: 'Духовные практики и самодисциплина',
    icon: 'ri-meditation-line',
    color: 'from-purple-400 to-indigo-500'
  },
  {
    id: 'emotion-chart',
    title: 'График эмоций',
    description: 'Отслеживание настроения',
    icon: 'ri-line-chart-line',
    color: 'from-cyan-400 to-blue-5'
  },
  {
    id: 'meditation',
    title: 'Медитация',
    description: 'Практики осознанности',
    icon: 'ri-leaf-line',
    color: 'from-green-400 to-emerald-500'
  },
  {
    id: 'gratitude',
    title: 'Благодарности',
    description: 'Запишите 3 вещи за которые благодарны',
    icon: 'ri-gift-line',
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'daily-forecast',
    title: 'Прогноз на день',
    description: 'Персональные рекомендации',
    icon: 'ri-crystal-ball-line',
    color: 'from-violet-400 to-purple-500',
    isPro: true
  },
  {
    id: 'jung-archetypes',
    title: 'Архетипы Юнга',
    description: 'Психологический анализ личности',
    icon: 'ri-user-heart-line',
    color: 'from-indigo-400 to-blue-600',
    isPro: true
  }
];

export default function SettingsPage() {
  const [activeWidgets, setActiveWidgets] = useState<string[]>([]);
  const [widgetOrder, setWidgetOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const telegramId = getTelegramUserId();

  // Загрузка настроек пользователя
  useEffect(() => {
    const loadSettings = async () => {
      try {
        await dbManager.init();
        const clientProfile = await dbManager.getClientProfileByTelegramId(telegramId);
        
        if (clientProfile) {
          const widgets = Array.isArray(clientProfile.selected_widgets) 
            ? clientProfile.selected_widgets 
            : (typeof clientProfile.selected_widgets === 'string' 
                ? JSON.parse(clientProfile.selected_widgets || '[]') 
                : []);
          
          const order = Array.isArray(clientProfile.widget_order) 
            ? clientProfile.widget_order 
            : (typeof clientProfile.widget_order === 'string' 
                ? JSON.parse(clientProfile.widget_order || '[]') 
                : widgets);

          setActiveWidgets(widgets);
          setWidgetOrder(order.length > 0 ? order : widgets);
        } else {
          const defaultWidgets = ['askeza', 'emotion-chart'];
          setActiveWidgets(defaultWidgets);
          setWidgetOrder(defaultWidgets);
        }
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
        const defaultWidgets = ['askeza', 'emotion-chart'];
        setActiveWidgets(defaultWidgets);
        setWidgetOrder(defaultWidgets);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [telegramId]);

  // Сохранение настроек в базу данных
  const saveSettings = async (widgets: string[], order: string[]) => {
    try {
      await dbManager.init();
      
      let clientProfile = await dbManager.getClientProfileByTelegramId(telegramId);
      
      if (!clientProfile) {
        const newProfile = {
          telegram_id: telegramId,
          selected_widgets: widgets,
          widget_order: order,
          is_pro: false,
          energy: 850,
          completed_askezas: 0,
          settings: '{}',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await dbManager.createClientProfile(newProfile);
      } else {
        const updates = {
          selected_widgets: widgets,
          widget_order: order,
          updated_at: new Date().toISOString()
        };
        await dbManager.updateClientProfile(telegramId, updates);
      }
      
      window.dispatchEvent(new CustomEvent('widgetsUpdated', { 
        detail: { widgets, order } 
      }));
      
      console.log('Настройки виджетов сохранены:', { widgets, order });
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    }
  };

  // Добавление виджета
  const addWidget = async (widgetId: string) => {
    if (!activeWidgets.includes(widgetId)) {
      const newActiveWidgets = [...activeWidgets, widgetId];
      const newWidgetOrder = [...widgetOrder, widgetId];
      
      setActiveWidgets(newActiveWidgets);
      setWidgetOrder(newWidgetOrder);
      
      await saveSettings(newActiveWidgets, newWidgetOrder);
    }
  };

  // Удаление виджета
  const removeWidget = async (widgetId: string) => {
    const newActiveWidgets = activeWidgets.filter(id => id !== widgetId);
    const newWidgetOrder = widgetOrder.filter(id => id !== widgetId);
    
    setActiveWidgets(newActiveWidgets);
    setWidgetOrder(newWidgetOrder);
    setShowDeleteConfirm(null);
    
    await saveSettings(newActiveWidgets, newWidgetOrder);
  };

  // Перемещение виджета вверх
  const moveWidgetUp = async (widgetId: string) => {
    const currentIndex = widgetOrder.indexOf(widgetId);
    if (currentIndex > 0) {
      const newOrder = [...widgetOrder];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      
      setWidgetOrder(newOrder);
      await saveSettings(activeWidgets, newOrder);
    }
  };

  // Перемещение виджета вниз
  const moveWidgetDown = async (widgetId: string) => {
    const currentIndex = widgetOrder.indexOf(widgetId);
    if (currentIndex < widgetOrder.length - 1) {
      const newOrder = [...widgetOrder];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      
      setWidgetOrder(newOrder);
      await saveSettings(activeWidgets, newOrder);
    }
  };

  // Drag and Drop функции
  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedItem(widgetId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetWidgetId) {
      setDraggedItem(null);
      return;
    }

    const draggedIndex = widgetOrder.indexOf(draggedItem);
    const targetIndex = widgetOrder.indexOf(targetWidgetId);
    
    const newOrder = [...widgetOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    
    setWidgetOrder(newOrder);
    setDraggedItem(null);
    
    await saveSettings(activeWidgets, newOrder);
  };

  const getWidgetInfo = (widgetId: string) => {
    return allWidgets.find(w => w.id === widgetId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Загрузка настроек...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 pb-28">
        {/* Хедер */}
        <div className="pt-6 pb-4 px-4">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
            style={{
              boxShadow: '0 0 30px rgba(6, 182, 212, 0.5)'
            }}>
              <span 
                className="text-white text-lg font-bold"
                style={{ fontFamily: 'Pacifico, serif' }}
              >
                logo
              </span>
            </div>
            <h1 
              className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-lavender-400 bg-clip-text text-transparent animate-pulse mb-2"
              style={{ fontFamily: 'Orbitron, monospace' }}
            >
              COMPASS
            </h1>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              Настройки
            </h2>
            <p className="text-white/60 text-sm">Управление виджетами и настройками</p>
          </div>
        </div>

        {/* Основные настройки */}
        <div className="px-4 space-y-4 mb-6">
          <GlassCard className="p-4">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              <i className="ri-user-line mr-2 text-cyan-400"></i>
              Профиль
            </h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="ri-edit-line text-cyan-400"></i>
                    <span className="text-white">Редактировать профиль</span>
                  </div>
                  <i className="ri-arrow-right-s-line text-white/60"></i>
                </div>
              </button>
              
              <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="ri-notification-line text-cyan-400"></i>
                    <span className="text-white">Уведомления</span>
                  </div>
                  <i className="ri-arrow-right-s-line text-white/60"></i>
                </div>
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              <i className="ri-database-line mr-2 text-cyan-400"></i>
              Данные
            </h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="ri-download-line text-cyan-400"></i>
                    <span className="text-white">Экспорт данных</span>
                  </div>
                  <i className="ri-arrow-right-s-line text-white/60"></i>
                </div>
              </button>
              
              <button className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="ri-delete-bin-line text-red-400"></i>
                    <span className="text-white">Очистить все данные</span>
                  </div>
                  <i className="ri-arrow-right-s-line text-white/60"></i>
                </div>
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Управление виджетами */}
        <div className="px-4 mb-6">
          <GlassCard className="p-4">
            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
              <i className="ri-dashboard-line mr-2 text-cyan-400"></i>
              Виджеты на главной
            </h3>
            
            {activeWidgets.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-white/10">
                  <i className="ri-dashboard-line text-white/60 text-2xl"></i>
                </div>
                <h4 className="text-white font-medium mb-2">Нет активных виджетов</h4>
                <p className="text-white/60 text-sm mb-4">
                  Добавьте виджеты на главную страницу для быстрого доступа
                </p>
                
                {/* Кнопки добавления виджетов */}
                <div className="grid grid-cols-2 gap-3">
                  {allWidgets.slice(0, 4).map((widget) => (
                    <button
                      key={widget.id}
                      onClick={() => addWidget(widget.id)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                    >
                      <div className={`w-8 h-8 mx-auto mb-2 flex items-center justify-center rounded-lg bg-gradient-to-r ${widget.color}`}>
                        <i className={`${widget.icon} text-white text-sm`}></i>
                      </div>
                      <p className="text-white text-xs font-medium">{widget.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  {widgetOrder.map((widgetId, index) => {
                    const widget = getWidgetInfo(widgetId);
                    if (!widget) return null;

                    return (
                      <div
                        key={widgetId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, widgetId)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, widgetId)}
                        className={`relative p-4 rounded-xl border transition-all duration-300 cursor-move ${
                          draggedItem === widgetId
                            ? 'border-cyan-400/50 bg-cyan-400/10 scale-105'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {/* Pro метка */}
                        {widget.isPro && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                            <span className="text-white text-xs font-bold">PRO</span>
                          </div>
                        )}

                        <div className="flex items-center space-x-4">
                          {/* Drag handle */}
                          <div className="flex flex-col space-y-1">
                            <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                            <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                            <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                          </div>

                          {/* Иконка виджета */}
                          <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-r ${widget.color} shadow-lg`}>
                            <i className={`${widget.icon} text-white text-xl`}></i>
                          </div>

                          {/* Информация о виджете */}
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-base mb-1">
                              {widget.title}
                            </h4>
                            <p className="text-white/60 text-sm">
                              Позиция: {index + 1}
                            </p>
                          </div>

                          {/* Кнопки управления */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => moveWidgetUp(widgetId)}
                              disabled={index === 0}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                index === 0
                                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                  : 'bg-white/20 text-white hover:bg-white/30'
                              }`}
                            >
                              <i className="ri-arrow-up-s-line text-sm"></i>
                            </button>
                            
                            <button
                              onClick={() => moveWidgetDown(widgetId)}
                              disabled={index === widgetOrder.length - 1}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                index === widgetOrder.length - 1
                                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                  : 'bg-white/20 text-white hover:bg-white/30'
                              }`}
                            >
                              <i className="ri-arrow-down-s-line text-sm"></i>
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirm(widgetId);
                              }}
                              className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center"
                            >
                              <i className="ri-close-line text-xl"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Доступные виджеты для добавления */}
                {allWidgets.filter(w => !activeWidgets.includes(w.id)).length > 0 && (
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-white/80 text-sm font-medium mb-3">Доступные виджеты:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {allWidgets.filter(w => !activeWidgets.includes(w.id)).map((widget) => (
                        <button
                          key={widget.id}
                          onClick={() => addWidget(widget.id)}
                          className="relative p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                        >
                          {widget.isPro && (
                            <div className="absolute top-1 right-1 px-1 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded text-white text-xs font-bold">
                              PRO
                            </div>
                          )}
                          <div className={`w-8 h-8 mx-auto mb-2 flex items-center justify-center rounded-lg bg-gradient-to-r ${widget.color}`}>
                            <i className={`${widget.icon} text-white text-sm`}></i>
                          </div>
                          <p className="text-white text-xs font-medium">{widget.title}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Окно подтверждения удаления виджета */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-sm p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-500/20">
                <i className="ri-delete-bin-line text-red-400 text-2xl"></i>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                Удалить виджет?
              </h3>
              
              <p className="text-white/70 text-sm mb-1">
                {getWidgetInfo(showDeleteConfirm)?.title}
              </p>
              
              <p className="text-white/50 text-xs">
                Виджет будет удален с главной страницы
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => removeWidget(showDeleteConfirm)}
                className="w-full py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
              >
                <i className="ri-delete-bin-line mr-2"></i>
                Удалить
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
              >
                <i className="ri-close-line mr-2"></i>
                Отмена
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
