import sqlite3
import uuid
from datetime import datetime
import os

APP_BASE_URL = os.getenv("APP_BASE_URL", "http://localhost:8501")
DB_PATH = "copsoq_invites.db"

def _init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS invites (
            id TEXT PRIMARY KEY,
            employee_name TEXT NOT NULL,
            email TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            created_date TIMESTAMP NOT NULL,
            accessed_date TIMESTAMP,
            completed INTEGER DEFAULT 0,
            response_id TEXT
        )
    """)
    conn.commit()
    conn.close()

_init_db()

def create_invite(employee_name, email):
    invite_id = str(uuid.uuid4())
    token = uuid.uuid4().hex
    created_date = datetime.now()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO invites (id, employee_name, email, token, created_date, completed)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (invite_id, employee_name, email, token, created_date, 0))
        conn.commit()
        invite_url = f"{APP_BASE_URL}/COPSOQ-II?token={token}"
        print(f"[INVITE] Token criado: {token}")
        print(f"[INVITE] URL: {invite_url}")
        return token, invite_url
    except sqlite3.IntegrityError as e:
        conn.rollback()
        print(f"[ERROR] Erro ao criar token: {e}")
        raise Exception("Falha ao criar token unico.")
    finally:
        conn.close()

def validate_token(token):
    if not token:
        print("[VALIDATE] Token vazio")
        return False
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT completed FROM invites WHERE token = ?
        """, (token,))
        result = cursor.fetchone()
        conn.close()
        
        if result:
            completed = result[0]
            is_valid = completed == 0
            print(f"[VALIDATE] Token {token[:10]}... - Valido: {is_valid}")
            return is_valid
        else:
            print(f"[VALIDATE] Token {token[:10]}... nao encontrado")
            return False
    except Exception as e:
        print(f"[ERROR] Erro ao validar token: {e}")
        return False

def mark_as_accessed(token):
    if not token:
        return False
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        accessed_date = datetime.now()
        cursor.execute("""
            UPDATE invites SET accessed_date = ? WHERE token = ?
        """, (accessed_date, token))
        conn.commit()
        rows = cursor.rowcount
        conn.close()
        
        print(f"[ACCESS] Token marcado como acessado: {rows} linhas")
        return rows > 0
    except Exception as e:
        print(f"[ERROR] Erro ao marcar acesso: {e}")
        return False

def mark_as_completed(token, response_id):
    if not token:
        return False
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE invites SET completed = 1, response_id = ? WHERE token = ?
        """, (response_id, token))
        conn.commit()
        rows = cursor.rowcount
        conn.close()
        
        print(f"[COMPLETE] Token marcado como concluido: {rows} linhas")
        return rows > 0
    except Exception as e:
        print(f"[ERROR] Erro ao marcar conclusao: {e}")
        return False

def get_invite_by_token(token):
    if not token:
        return None
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, employee_name, email, token, created_date, accessed_date, completed, response_id
            FROM invites WHERE token = ?
        """, (token,))
        result = cursor.fetchone()
        conn.close()
        
        if result:
            columns = ["id", "employee_name", "email", "token", "created_date", "accessed_date", "completed", "response_id"]
            invite = dict(zip(columns, result))
            print(f"[GET_INVITE] Convite encontrado para {invite['employee_name']}")
            return invite
        else:
            print(f"[GET_INVITE] Convite nao encontrado")
            return None
    except Exception as e:
        print(f"[ERROR] Erro ao obter convite: {e}")
        return None

def get_all_invites():
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, employee_name, email, token, created_date, accessed_date, completed, response_id
            FROM invites ORDER BY created_date DESC
        """)
        results = cursor.fetchall()
        conn.close()
        return results
    except Exception as e:
        print(f"[ERROR] Erro ao listar convites: {e}")
        return []

def delete_invite(invite_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM invites WHERE id = ?", (invite_id,))
        conn.commit()
        rows = cursor.rowcount
        conn.close()
        
        print(f"[DELETE] Convite deletado: {rows} linhas")
        return rows > 0
    except Exception as e:
        print(f"[ERROR] Erro ao deletar convite: {e}")
        return False
