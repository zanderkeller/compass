import { useState, useEffect, useRef } from 'react';
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
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragItemRef = useRef<number | null>(null);
  const dragOverItemRef = useRef<number | null>(null);

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

  const handleDragStart = (index: number, widgetId: string) => {
    dragItemRef.current = index;
    setDraggingId(widgetId);
  };

  const handleDragEnter = (index: number) => {
    dragOverItemRef.current = index;
  };

  const handleDragEnd = () => {
    if (dragItemRef.current !== null && dragOverItemRef.current !== null && dragItemRef.current !== dragOverItemRef.current) {
      const activeWidgets = widgetOrder.filter(id => selectedWidgets.includes(id));
      const newOrder = [...activeWidgets];
      const [draggedItem] = newOrder.splice(dragItemRef.current, 1);
      newOrder.splice(dragOverItemRef.current, 0, draggedItem);
      setWidgetOrder(newOrder);
    }
    dragItemRef.current = null;
    dragOverItemRef.current = null;
    setDraggingId(null);
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await dbManager.init();
      const telegramId = getTelegramUserId();

      const finalOrder = widgetOrder.filter(id => selectedWidgets.includes(id));

      await dbManager.updateClientProfile(telegramId, {
        selected_widgets: selectedWidgets,
        widget_order: finalOrder,
        updated_at: new Date().toISOString()
      });

      const event = new CustomEvent('widgetsUpdated', {
        detail: { widgets: selectedWidgets, order: finalOrder }
      });
      try {
        localStorage.setItem('selected_widgets', JSON.stringify(selectedWidgets));
        localStorage.setItem('widget_order', JSON.stringify(finalOrder));
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

  const activeWidgets = widgetOrder.filter(id => selectedWidgets.includes(id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full max-w-md max-h-[85vh] rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(40px) saturate(200%)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4), 0 0 60px rgba(6,182,212,0.15), inset 0 1px 0 rgba(255,255,255,0.25)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        {/* Блик сверху */}
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

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
          <p className="text-white/50 text-xs mt-1">Перетаскивайте для изменения порядка</p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
            <p className="text-white/60 text-sm">Загрузка...</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
              <div className="p-4 space-y-4">

                {/* Активные виджеты с drag & drop */}
                {activeWidgets.length > 0 && (
                  <div>
                    <h4 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
                      <i className="ri-drag-move-2-line text-cyan-400"></i>
                      Активные ({activeWidgets.length})
                    </h4>

                    <div className="space-y-2">
                      {activeWidgets.map((widgetId, index) => {
                        const widget = getWidgetInfo(widgetId);
                        if (!widget) return null;

                        return (
                          <div
                            key={widgetId}
                            draggable
                            onDragStart={() => handleDragStart(index, widgetId)}
                            onDragEnter={() => handleDragEnter(index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                            className={`relative flex items-center p-3 rounded-2xl transition-all cursor-grab active:cursor-grabbing ${
                              draggingId === widgetId ? 'opacity-50 scale-95' : 'hover:bg-white/10'
                            }`}
                            style={{
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                              border: '1px solid rgba(255,255,255,0.1)',
                            }}
                          >
                            {/* Drag handle */}
                            <div className="mr-3 text-white/30">
                              <i className="ri-draggable text-lg"></i>
                            </div>

                            {/* Иконка */}
                            <div 
                              className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${widget.color} mr-3`}
                              style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
                            >
                              <i className={`${widget.icon} text-white text-lg`}></i>
                            </div>

                            {/* Инфо */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-white text-sm font-medium">{widget.title}</span>
                                {widget.isPro && (
                                  <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] rounded-full">PRO</span>
                                )}
                              </div>
                              <div className="text-white/40 text-xs">#{index + 1}</div>
                            </div>

                            {/* Кнопка удаления */}
                            <button
                              onClick={() => handleWidgetToggle(widgetId)}
                              className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-colors flex items-center justify-center"
                            >
                              <i className="ri-close-line text-lg"></i>
                            </button>
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
                          className="relative w-full flex items-center p-3 rounded-2xl hover:bg-white/10 transition-all"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                            border: '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          <div 
                            className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${widget.color} mr-3 opacity-60`}
                          >
                            <i className={`${widget.icon} text-white text-lg`}></i>
                          </div>

                          <div className="flex-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-white/80 text-sm font-medium">{widget.title}</span>
                              {widget.isPro && (
                                <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] rounded-full">PRO</span>
                              )}
                            </div>
                            <div className="text-white/40 text-xs">{widget.description}</div>
                          </div>

                          <div className="w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center">
                            <i className="ri-add-line text-white/40 text-sm"></i>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопка сохранения */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                  boxShadow: '0 4px 20px rgba(6,182,212,0.4)',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Сохранение...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-check-line"></i>
                    Сохранить
                  </span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
