from fastapi import FastAPI, HTTPException, Request, File, UploadFile
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import json
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
import os
import shutil
from contextlib import contextmanager

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Compass Database API", version="1.0.0")

# CORS настройки
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_PATH = "compass.db"

@contextmanager
def get_db_connection():
    """Контекстный менеджер для безопасной работы с базой данных"""
    conn = None
    try:
        conn = sqlite3.connect(DATABASE_PATH, timeout=30.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        conn.execute("PRAGMA journal_mode = WAL")
        yield conn
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Ошибка базы данных: {e}")
        raise
    finally:
        if conn:
            conn.close()

def init_database():
    """Инициализация базы данных с созданием всех необходимых таблиц"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Таблица пользователей
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    telegram_id INTEGER UNIQUE NOT NULL,
                    telegram_username TEXT,
                    telegram_first_name TEXT,
                    telegram_last_name TEXT,
                    name TEXT NOT NULL,
                    birth_date TEXT NOT NULL,
                    birth_place TEXT NOT NULL,
                    about_me TEXT NOT NULL,
                    problem TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
            ''')
            
            # Таблица профилей клиентов
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS client_profiles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    telegram_id INTEGER UNIQUE NOT NULL,
                    selected_widgets TEXT NOT NULL DEFAULT '[]',
                    widget_order TEXT NOT NULL DEFAULT '[]',
                    is_pro BOOLEAN NOT NULL DEFAULT 0,
                    energy INTEGER NOT NULL DEFAULT 850,
                    completed_askezas INTEGER NOT NULL DEFAULT 0,
                    settings TEXT NOT NULL DEFAULT '{}',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (telegram_id) REFERENCES users (telegram_id)
                )
            ''')
            
            # Таблица ответов пользователей
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_responses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    telegram_id INTEGER NOT NULL,
                    response_type TEXT NOT NULL,
                    response_data TEXT NOT NULL,
                    date TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (telegram_id) REFERENCES users (telegram_id)
                )
            ''')
            
            # Таблица эмоциональных записей
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS emotion_entries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    telegram_id INTEGER NOT NULL,
                    type TEXT NOT NULL CHECK (type IN ('morning', 'evening')),
                    emotion TEXT NOT NULL,
                    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 10),
                    date TEXT NOT NULL,
                    feelings TEXT,
                    goals TEXT,
                    gratitude TEXT,
                    day_reflection TEXT,
                    tomorrow_goals TEXT,
                    day_rating INTEGER CHECK (day_rating >= 1 AND day_rating <= 10),
                    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
                    morning_mood TEXT,
                    today_goals TEXT,
                    intention TEXT,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (telegram_id) REFERENCES users (telegram_id),
                    UNIQUE(telegram_id, date, type)
                )
            ''')
            
            # Таблица журнальных записей
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS journal_entries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    telegram_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    mood TEXT,
                    tags TEXT,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (telegram_id) REFERENCES users (telegram_id)
                )
            ''')
            
            # Таблица аскез
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS askeza_entries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    telegram_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    icon TEXT NOT NULL,
                    color TEXT NOT NULL,
                    duration INTEGER NOT NULL,
                    current_day INTEGER NOT NULL DEFAULT 0,
                    is_active BOOLEAN NOT NULL DEFAULT 1,
                    show_on_home BOOLEAN NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (telegram_id) REFERENCES users (telegram_id)
                )
            ''')
            
            # Создаем индексы для оптимизации
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users (telegram_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_client_profiles_telegram_id ON client_profiles (telegram_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_responses_telegram_id ON user_responses (telegram_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_emotion_entries_telegram_id ON emotion_entries (telegram_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_journal_entries_telegram_id ON journal_entries (telegram_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_askeza_entries_telegram_id ON askeza_entries (telegram_id)')
            
            conn.commit()
            logger.info("База данных успешно инициализирована")
            
    except Exception as e:
        logger.error(f"Ошибка инициализации базы данных: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка инициализации базы данных: {str(e)}")

@app.post("/api/database/init")
async def initialize_database():
    """Инициализация базы данных"""
    try:
        init_database()
        return {"message": "База данных успешно инициализирована"}
    except Exception as e:
        logger.error(f"Ошибка инициализации: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Методы для работы с пользователями
@app.post("/api/database/users")
async def create_user(request: Request):
    """Создание нового пользователя"""
    try:
        user_data = await request.json()
        logger.info(f"Создание пользователя: {user_data}")
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO users (telegram_id, telegram_username, telegram_first_name, 
                                 telegram_last_name, name, birth_date, birth_place, 
                                 about_me, problem, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_data['telegram_id'],
                user_data.get('telegram_username'),
                user_data.get('telegram_first_name'),
                user_data.get('telegram_last_name'),
                user_data['name'],
                user_data['birth_date'],
                user_data['birth_place'],
                user_data['about_me'],
                user_data['problem'],
                user_data['created_at']
            ))
            conn.commit()
            user_id = cursor.lastrowid
            logger.info(f"Пользователь создан с ID: {user_id}")
            return {"id": user_id}
            
    except sqlite3.IntegrityError as e:
        logger.error(f"Пользователь уже существует: {e}")
        raise HTTPException(status_code=409, detail="Пользователь уже существует")
    except Exception as e:
        logger.error(f"Ошибка создания пользователя: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/database/users/{telegram_id}")
async def get_user(telegram_id: int):
    """Получение пользователя по Telegram ID"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM users WHERE telegram_id = ?', (telegram_id,))
            user = cursor.fetchone()
            
            if user:
                return dict(user)
            else:
                raise HTTPException(status_code=404, detail="Пользователь не найден")
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка получения пользователя: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Методы для работы с профилем клиента
@app.post("/api/database/client-profile")
async def create_client_profile_endpoint(request: Request):
    """Создание профиля клиента"""
    try:
        profile_data = await request.json()
        logger.info(f"Создание профиля клиента: {profile_data}")
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO client_profiles (telegram_id, selected_widgets, widget_order, 
                                           is_pro, energy, completed_askezas, settings, 
                                           created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                profile_data['telegram_id'],
                profile_data['selected_widgets'],
                profile_data['widget_order'],
                profile_data['is_pro'],
                profile_data['energy'],
                profile_data['completed_askezas'],
                profile_data['settings'],
                profile_data['created_at'],
                profile_data['updated_at']
            ))
            conn.commit()
            profile_id = cursor.lastrowid
            logger.info(f"Профиль клиента создан с ID: {profile_id}")
            return {"id": profile_id}
            
    except sqlite3.IntegrityError as e:
        logger.error(f"Профиль клиента уже существует: {e}")
        raise HTTPException(status_code=409, detail="Профиль клиента уже существует")
    except Exception as e:
        logger.error(f"Ошибка создания профиля клиента: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/database/client-profile/{telegram_id}")
async def get_client_profile(telegram_id: int):
    """Получение профиля клиента по Telegram ID"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM client_profiles WHERE telegram_id = ?', (telegram_id,))
            profile = cursor.fetchone()
            
            if profile:
                return dict(profile)
            else:
                raise HTTPException(status_code=404, detail="Профиль клиента не найден")
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка получения профиля клиента: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/database/client-profile/{telegram_id}")
async def update_client_profile(telegram_id: int, request: Request):
    """Обновление профиля клиента"""
    try:
        update_data = await request.json()
        logger.info(f"Обновление профиля клиента {telegram_id}: {update_data}")
        
        # Строим динамический запрос обновления
        set_clauses = []
        values = []
        
        for key, value in update_data.items():
            if key != 'telegram_id':  # Исключаем telegram_id из обновления
                set_clauses.append(f"{key} = ?")
                values.append(value)
        
        if not set_clauses:
            raise HTTPException(status_code=400, detail="Нет данных для обновления")
        
        values.append(telegram_id)  # Добавляем telegram_id для WHERE условия
        
        query = f"UPDATE client_profiles SET {', '.join(set_clauses)} WHERE telegram_id = ?"
        logger.info(f"SQL запрос: {query}")
        logger.info(f"Значения: {values}")
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, values)
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Профиль клиента не найден")
            
            conn.commit()
            logger.info(f"Профиль клиента {telegram_id} успешно обновлен")
            return {"message": "Профиль клиента обновлен"}
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка обновления профиля клиента: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Методы для работы с аскезами
@app.post("/api/database/askeza")
async def create_askeza(request: Request):
    """Создание новой аскезы"""
    try:
        askeza_data = await request.json()
        logger.info(f"Создание аскезы: {askeza_data}")
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO askeza_entries (telegram_id, title, icon, color, duration, 
                                          current_day, is_active, show_on_home, 
                                          created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                askeza_data['telegram_id'],
                askeza_data['title'],
                askeza_data['icon'],
                askeza_data['color'],
                askeza_data['duration'],
                askeza_data['current_day'],
                askeza_data['is_active'],
                askeza_data['show_on_home'],
                askeza_data['created_at'],
                askeza_data['updated_at']
            ))
            conn.commit()
            askeza_id = cursor.lastrowid
            logger.info(f"Аскеза создана с ID: {askeza_id}")
            return {"id": askeza_id}
            
    except Exception as e:
        logger.error(f"Ошибка создания аскезы: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/database/askeza/user/{telegram_id}")
async def get_askeza_entries(telegram_id: int):
    """Получение всех аскез пользователя"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM askeza_entries 
                WHERE telegram_id = ? 
                ORDER BY created_at DESC
            ''', (telegram_id,))
            askezas = cursor.fetchall()
            return [dict(askeza) for askeza in askezas]
            
    except Exception as e:
        logger.error(f"Ошибка получения аскез: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/database/askeza/user/{telegram_id}/home")
async def get_home_askezas(telegram_id: int):
    """Получение аскез для отображения на главной странице"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM askeza_entries 
                WHERE telegram_id = ? AND show_on_home = 1
                ORDER BY created_at DESC
            ''', (telegram_id,))
            askezas = cursor.fetchall()
            logger.info(f"Найдено аскез для главной страницы: {len(askezas)}")
            return [dict(askeza) for askeza in askezas]
            
    except Exception as e:
        logger.error(f"Ошибка получения аскез для главной: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/database/askeza/{askeza_id}")
async def update_askeza(askeza_id: int, request: Request):
    """Обновление аскезы"""
    try:
        update_data = await request.json()
        logger.info(f"Обновление аскезы {askeza_id}: {update_data}")
        
        # Строим динамический запрос обновления
        set_clauses = []
        values = []
        
        for key, value in update_data.items():
            set_clauses.append(f"{key} = ?")
            values.append(value)
        
        if not set_clauses:
            raise HTTPException(status_code=400, detail="Нет данных для обновления")
        
        values.append(askeza_id)
        
        query = f"UPDATE askeza_entries SET {', '.join(set_clauses)} WHERE id = ?"
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, values)
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Аскеза не найдена")
            
            conn.commit()
            logger.info(f"Аскеза {askeza_id} успешно обновлена")
            return {"message": "Аскеза обновлена"}
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка обновления аскезы: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/database/askeza/{askeza_id}")
async def delete_askeza(askeza_id: int):
    """Удаление аскезы"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DELETE FROM askeza_entries WHERE id = ?', (askeza_id,))
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Аскеза не найдена")
            
            conn.commit()
            logger.info(f"Аскеза {askeza_id} удалена")
            return {"message": "Аскеза удалена"}
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка удаления аскезы: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Методы для работы с эмоциональными записями
@app.post("/api/database/emotions")
async def create_emotion_entry(request: Request):
    """Создание эмоциональной записи"""
    try:
        emotion_data = await request.json()
        logger.info(f"Создание эмоциональной записи: {emotion_data}")
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT OR REPLACE INTO emotion_entries 
                (telegram_id, type, emotion, level, date, feelings, goals, gratitude,
                 day_reflection, tomorrow_goals, day_rating, sleep_quality, 
                 morning_mood, today_goals, intention, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                emotion_data['telegram_id'],
                emotion_data['type'],
                emotion_data['emotion'],
                emotion_data['level'],
                emotion_data['date'],
                emotion_data.get('feelings'),
                emotion_data.get('goals'),
                emotion_data.get('gratitude'),
                emotion_data.get('day_reflection'),
                emotion_data.get('tomorrow_goals'),
                emotion_data.get('day_rating'),
                emotion_data.get('sleep_quality'),
                emotion_data.get('morning_mood'),
                emotion_data.get('today_goals'),
                emotion_data.get('intention'),
                emotion_data['created_at']
            ))
            conn.commit()
            emotion_id = cursor.lastrowid
            logger.info(f"Эмоциональная запись создана с ID: {emotion_id}")
            return {"id": emotion_id}
            
    except Exception as e:
        logger.error(f"Ошибка создания эмоциональной записи: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/database/emotions/user/{telegram_id}")
async def get_emotion_entries(telegram_id: int, limit: Optional[int] = None):
    """Получение эмоциональных записей пользователя"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            query = '''
                SELECT * FROM emotion_entries 
                WHERE telegram_id = ? 
                ORDER BY date DESC, created_at DESC
            '''
            params = [telegram_id]
            
            if limit:
                query += ' LIMIT ?'
                params.append(limit)
            
            cursor.execute(query, params)
            emotions = cursor.fetchall()
            return [dict(emotion) for emotion in emotions]
            
    except Exception as e:
        logger.error(f"Ошибка получения эмоциональных записей: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/database/emotions/user/{telegram_id}/date/{date}/{type}")
async def get_emotion_entry_by_date(telegram_id: int, date: str, type: str):
    """Получение эмоциональной записи по дате и типу"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM emotion_entries 
                WHERE telegram_id = ? AND date = ? AND type = ?
            ''', (telegram_id, date, type))
            emotion = cursor.fetchone()
            
            if emotion:
                return dict(emotion)
            else:
                raise HTTPException(status_code=404, detail="Эмоциональная запись не найдена")
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка получения эмоциональной записи: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Методы для работы с журнальными записями
@app.post("/api/database/journal")
async def create_journal_entry(request: Request):
    """Создание журнальной записи"""
    try:
        journal_data = await request.json()
        logger.info(f"Создание журнальной записи: {journal_data}")
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO journal_entries (telegram_id, title, content, mood, tags, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                journal_data['telegram_id'],
                journal_data['title'],
                journal_data['content'],
                journal_data.get('mood'),
                journal_data.get('tags'),
                journal_data['created_at']
            ))
            conn.commit()
            journal_id = cursor.lastrowid
            logger.info(f"Журнальная запись создана с ID: {journal_id}")
            return {"id": journal_id}
            
    except Exception as e:
        logger.error(f"Ошибка создания журнальной записи: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/database/journal/user/{telegram_id}")
async def get_journal_entries(telegram_id: int, limit: Optional[int] = None):
    """Получение журнальных записей пользователя"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            query = '''
                SELECT * FROM journal_entries 
                WHERE telegram_id = ? 
                ORDER BY created_at DESC
            '''
            params = [telegram_id]
            
            if limit:
                query += ' LIMIT ?'
                params.append(limit)
            
            cursor.execute(query, params)
            journals = cursor.fetchall()
            return [dict(journal) for journal in journals]
            
    except Exception as e:
        logger.error(f"Ошибка получения журнальных записей: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Методы для работы с ответами пользователей
@app.post("/api/database/user-responses")
async def create_user_response(request: Request):
    """Создание ответа пользователя"""
    try:
        response_data = await request.json()
        logger.info(f"Создание ответа пользователя: {response_data}")
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO user_responses (telegram_id, response_type, response_data, date, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                response_data['telegram_id'],
                response_data['response_type'],
                response_data['response_data'],
                response_data['date'],
                response_data['created_at']
            ))
            conn.commit()
            response_id = cursor.lastrowid
            logger.info(f"Ответ пользователя создан с ID: {response_id}")
            return {"id": response_id}
            
    except Exception as e:
        logger.error(f"Ошибка создания ответа пользователя: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/database/user-responses/{telegram_id}")
async def get_user_responses(telegram_id: int, type: Optional[str] = None, limit: Optional[int] = None):
    """Получение ответов пользователя"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            query = 'SELECT * FROM user_responses WHERE telegram_id = ?'
            params = [telegram_id]
            
            if type:
                query += ' AND response_type = ?'
                params.append(type)
            
            query += ' ORDER BY created_at DESC'
            
            if limit:
                query += ' LIMIT ?'
                params.append(limit)
            
            cursor.execute(query, params)
            responses = cursor.fetchall()
            return [dict(response) for response in responses]
            
    except Exception as e:
        logger.error(f"Ошибка получения ответов пользователя: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Утилитарные методы
@app.get("/api/database/info")
async def get_database_info():
    """Получение информации о базе данных"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            info = {}
            tables = ['users', 'client_profiles', 'user_responses', 'emotion_entries', 'journal_entries', 'askeza_entries']
            
            for table in tables:
                cursor.execute(f'SELECT COUNT(*) FROM {table}')
                count = cursor.fetchone()[0]
                # Исправляем формирование ключей для соответствия ожидаемому формату
                if table == 'users':
                    info['userCount'] = count
                elif table == 'client_profiles':
                    info['clientProfileCount'] = count
                elif table == 'user_responses':
                    info['userResponsesCount'] = count
                elif table == 'emotion_entries':
                    info['emotionCount'] = count
                elif table == 'journal_entries':
                    info['journalCount'] = count
                elif table == 'askeza_entries':
                    info['askezaCount'] = count
            
            return info
            
    except Exception as e:
        logger.error(f"Ошибка получения информации о базе: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/database/clear")
async def clear_database():
    """Очистка всех данных из базы"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            tables = ['askeza_entries', 'journal_entries', 'emotion_entries', 'user_responses', 'client_profiles', 'users']
            
            for table in tables:
                cursor.execute(f'DELETE FROM {table}')
            
            conn.commit()
            logger.info("База данных очищена")
            return {"message": "База данных очищена"}
            
    except Exception as e:
        logger.error(f"Ошибка очистки базы данных: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/database/export")
async def export_database():
    """Экспорт базы данных"""
    try:
        if os.path.exists(DATABASE_PATH):
            return FileResponse(
                DATABASE_PATH,
                media_type='application/octet-stream',
                filename='compass_backup.db'
            )
        else:
            raise HTTPException(status_code=404, detail="База данных не найдена")
            
    except Exception as e:
        logger.error(f"Ошибка экспорта базы данных: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/database/import")
async def import_database(database: UploadFile = File(...)):
    """Импорт базы данных"""
    try:
        # Создаем резервную копию текущей базы
        if os.path.exists(DATABASE_PATH):
            backup_path = f"{DATABASE_PATH}.backup"
            shutil.copy2(DATABASE_PATH, backup_path)
        
        # Сохраняем загруженную базу
        with open(DATABASE_PATH, "wb") as buffer:
            shutil.copyfileobj(database.file, buffer)
        
        # Проверяем целостность загруженной базы
        init_database()
        
        logger.info("База данных успешно импортирована")
        return {"message": "База данных успешно импортирована"}
        
    except Exception as e:
        logger.error(f"Ошибка импорта базы данных: {e}")
        
        # Восстанавливаем резервную копию в случае ошибки
        backup_path = f"{DATABASE_PATH}.backup"
        if os.path.exists(backup_path):
            shutil.copy2(backup_path, DATABASE_PATH)
        
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    # Инициализируем базу данных при запуске
    init_database()
    
    # Запускаем сервер
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")