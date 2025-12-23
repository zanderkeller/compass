
import { useState, useEffect } from 'react';
import { dbManager, getTelegramUserId } from '../../utils/database';

interface Widget {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  isPro?: boolean;
  isEnabled: boolean;
}

interface WidgetMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentWidgets: string[];
}

const availableWidgets: Widget[] = [
  {
    id: 'askeza',
    title: 'Аскеза',
    description: 'Духовные практики и самодисциплина',
    icon: 'ri-heart-pulse-line',
    color: 'from-purple-400 to-indigo-500',
    isEnabled: true
  },
  {
    id: 'emotion-chart',
    title: 'График эмоций',
    description: 'Отслеживание настроения',
    icon: 'ri-line-chart-line',
    color: 'from-cyan-400 to-blue-500',
    isEnabled: true
  },
  {
    id: 'meditation',
    title: 'Медитация',
    description: 'Практики осознанности',
    icon: 'ri-leaf-line',
    color: 'from-green-400 to-emerald-500',
    isEnabled: true
  },
  {
    id: 'gratitude',
    title: 'Благодарности',
    description: 'Запишите 3 вещи за которые благодарны',
    icon: 'ri-gift-line',
    color: 'from-yellow-400 to-orange-500',
    isEnabled: true
  },
  {
    id: 'daily-forecast',
    title: 'Прогноз на день',
    description: 'Персональные рекомендации',
    icon: 'ri-crystal-ball-line',
    color: 'from-violet-400 to-purple-500',
    isPro: true,
    isEnabled: true
  },
  {
    id: 'jung-archetypes',
    title: 'Архетипы Юнга',
    description: 'Психологический анализ личности',
    icon: 'ri-user-heart-line',
    color: 'from-indigo-400 to-blue-600',
    isPro: true,
    isEnabled: true
  }
];

export default function WidgetMenu({ isOpen, onClose, currentWidgets }: WidgetMenuProps) {
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [widgetOrder, setWidgetOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCurrentSettings();
    } else {
      setSelectedWidgets([]);
      setWidgetOrder([]);
    }
  }, [isOpen, currentWidgets]);

  const loadCurrentSettings = async () => {
    try {
      setLoading(true);
      await dbManager.init();
      const telegramId = getTelegramUserId();
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

        setSelectedWidgets(widgets);
        setWidgetOrder(order.length > 0 ? order : widgets);
      } else {
        setSelectedWidgets(currentWidgets);
        setWidgetOrder(currentWidgets);
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек виджетов:', error);
      setSelectedWidgets(currentWidgets);
      setWidgetOrder(currentWidgets);
    } finally {
      setLoading(false);
    }
  };

  const handleWidgetToggle = (widgetId: string) => {
    if (selectedWidgets.includes(widgetId)) {
      const newSelected = selectedWidgets.filter(id => id !== widgetId);
      const newOrder = widgetOrder.filter(id => id !== widgetId);
      setSelectedWidgets(newSelected);
      setWidgetOrder(newOrder);
    } else {
      const newSelected = [...selectedWidgets, widgetId];
      const newOrder = [...widgetOrder, widgetId];
      setSelectedWidgets(newSelected);
      setWidgetOrder(newOrder);
    }
  };

  const handleRemoveWidget = (widgetId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const newSelected = selectedWidgets.filter(id => id !== widgetId);
    const newOrder = widgetOrder.filter(id => id !== widgetId);
    setSelectedWidgets(newSelected);
    setWidgetOrder(newOrder);
  };

  const moveWidgetUp = (widgetId: string) => {
    const currentIndex = widgetOrder.indexOf(widgetId);
    if (currentIndex > 0) {
      const newOrder = [...widgetOrder];
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
      setWidgetOrder(newOrder);
    }
  };

  const moveWidgetDown = (widgetId: string) => {
    const currentIndex = widgetOrder.indexOf(widgetId);
    if (currentIndex < widgetOrder.length - 1) {
      const newOrder = [...widgetOrder];
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
      setWidgetOrder(newOrder);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await dbManager.init();
      const telegramId = getTelegramUserId();
      
      await dbManager.updateClientProfile(telegramId, {
        selected_widgets: selectedWidgets,
        widget_order: widgetOrder,
        updated_at: new Date().toISOString()
      });

      // Отправляем событие об обновлении виджетов
      const event = new CustomEvent('widgetsUpdated', {
        detail: { widgets: selectedWidgets, order: widgetOrder }
      });
      try {
        localStorage.setItem('selected_widgets', JSON.stringify(selectedWidgets));
        localStorage.setItem('widget_order', JSON.stringify(widgetOrder));
      } catch (e) {}
      window.dispatchEvent(event);

      onClose();
    } catch (error) {
      console.error('Ошибка сохранения виджетов:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWidgetInfo = (widgetId: string) => {
    return availableWidgets.find(w => w.id === widgetId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[90vh] backdrop-blur-xl bg-white/8 border border-white/20 rounded-2xl overflow-hidden"
           style={{
             boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 20px rgba(6, 182, 212, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
             backdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
             WebkitBackdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
           }}>
        
        {/* Стеклянный эффект преломления */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `
              linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%),
              radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)
            `,
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          {/* Заголовок */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Настройка виджетов</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <i className="ri-close-line text-white text-lg"></i>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 mx-auto mb-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
              <p className="text-white/60 text-sm">Загрузка...</p>
            </div>
          ) : (
            <>
              {/* Скроллируемый контент */}
              <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                <div className="p-4 space-y-4">
                  
                  {/* Активные виджеты */}
                  {selectedWidgets.length > 0 && (
                    <div>
                      <h4 className="text-white/80 text-sm font-medium mb-3">
                        Активные ({selectedWidgets.length})
                      </h4>
                      
                      <div className="space-y-2">
                        {widgetOrder.filter(id => selectedWidgets.includes(id)).map((widgetId, index) => {
                          const widget = getWidgetInfo(widgetId);
                          if (!widget) return null;

                          return (
                            <div
                              key={widgetId}
                              className="relative flex items-center p-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl transition-all overflow-hidden hover:bg-white/10"
                              style={{
                                backdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                                WebkitBackdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                              }}
                            >
                              {/* Стеклянный эффект */}
                              <div 
                                className="absolute inset-0 rounded-xl pointer-events-none"
                                style={{
                                  background: `
                                    linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, transparent 50%, rgba(255, 255, 255, 0.03) 100%),
                                    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
                                  `,
                                }}
                              />
                              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                              
                              <div className="relative z-10 flex items-center w-full">
                                {/* Стрелки управления порядком */}
                                <div className="flex flex-col mr-3">
                                  <button
                                    onClick={() => moveWidgetUp(widgetId)}
                                    disabled={index === 0}
                                    className={`w-6 h-6 flex items-center justify-center rounded transition-all ${
                                      index === 0 
                                        ? 'text-white/20 cursor-not-allowed' 
                                        : 'text-cyan-400 hover:bg-cyan-400/20 hover:text-cyan-300'
                                    }`}
                                    style={index !== 0 ? {
                                      textShadow: '0 0 8px rgba(6, 182, 212, 0.8)',
                                      boxShadow: '0 0 10px rgba(6, 182, 212, 0.3)'
                                    } : undefined}
                                  >
                                    <i className="ri-arrow-up-s-line text-sm"></i>
                                  </button>
                                  <button
                                    onClick={() => moveWidgetDown(widgetId)}
                                    disabled={index === widgetOrder.filter(id => selectedWidgets.includes(id)).length - 1}
                                    className={`w-6 h-6 flex items-center justify-center rounded transition-all ${
                                      index === widgetOrder.filter(id => selectedWidgets.includes(id)).length - 1
                                        ? 'text-white/20 cursor-not-allowed' 
                                        : 'text-cyan-400 hover:bg-cyan-400/20 hover:text-cyan-300'
                                    }`}
                                    style={index !== widgetOrder.filter(id => selectedWidgets.includes(id)).length - 1 ? {
                                      textShadow: '0 0 8px rgba(6, 182, 212, 0.8)',
                                      boxShadow: '0 0 10px rgba(6, 182, 212, 0.3)'
                                    } : undefined}
                                  >
                                    <i className="ri-arrow-down-s-line text-sm"></i>
                                  </button>
                                </div>

                                <i className={`${widget.icon} text-cyan-400 mr-3`}></i>
                                <div className="flex-1">
                                  <div className="text-white text-sm font-medium">{widget.title}</div>
                                  <div className="text-white/50 text-xs">#{index + 1}</div>
                                </div>
                                {widget.isPro && (
                                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full mr-2">PRO</span>
                                )}
                                <button
                                  onClick={(e) => handleRemoveWidget(widgetId, e)}
                                  className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center justify-center"
                                >
                                  <i className="ri-close-line text-lg"></i>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Доступные виджеты */}
                  <div>
                    <h4 className="text-white/80 text-sm font-medium mb-3">Доступные виджеты</h4>
                    
                    <div className="space-y-2">
                      {availableWidgets.map((widget) => {
                        const isSelected = selectedWidgets.includes(widget.id);
                        
                        if (isSelected) return null;
                        
                        return (
                          <button
                            key={widget.id}
                            onClick={() => handleWidgetToggle(widget.id)}
                            className="relative w-full flex items-center p-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all overflow-hidden"
                            style={{
                              backdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                              WebkitBackdropFilter: 'blur(20px) saturate(180%) contrast(120%)',
                            }}
                          >
                            {/* Стеклянный эффект */}
                            <div 
                              className="absolute inset-0 rounded-xl pointer-events-none"
                              style={{
                                background: `
                                  linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, transparent 50%, rgba(255, 255, 255, 0.03) 100%),
                                  radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
                                `,
                              }}
                            />
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                            
                            <div className="relative z-10 flex items-center w-full">
                              <i className={`${widget.icon} text-cyan-400 mr-3`}></i>
                              <div className="flex-1 text-left">
                                <div className="text-white text-sm font-medium">{widget.title}</div>
                                <div className="text-white/60 text-xs">{widget.description}</div>
                              </div>
                              {widget.isPro && (
                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full mr-2">PRO</span>
                              )}
                              <div className="w-5 h-5 border-2 border-white/40 rounded-full flex items-center justify-center">
                                <i className="ri-add-line text-white/60 text-sm"></i>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Кнопки действий - всегда видны внизу */}
              <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="flex-1 py-3 px-4 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <i className="ri-save-line mr-2"></i>
                        Сохранить
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
