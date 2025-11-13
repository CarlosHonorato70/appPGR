import sqlite3
import json
from datetime import datetime
import uuid
from encryption import encrypt_data, decrypt_data, hash_data

DB_RESPONSES = "copsoq_responses_secure.db"

def _init_responses_db():
    conn = sqlite3.connect(DB_RESPONSES)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS responses_encrypted (
            id TEXT PRIMARY KEY,
            token_hash TEXT NOT NULL UNIQUE,
            employee_name TEXT,
            department TEXT,
            email TEXT,
            responses_encrypted TEXT NOT NULL,
            submission_date TIMESTAMP,
            ip_address TEXT,
            user_agent TEXT,
            completed INTEGER DEFAULT 0,
            version TEXT DEFAULT '1.0'
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS response_audit (
            id TEXT PRIMARY KEY,
            response_id TEXT NOT NULL,
            action TEXT,
            timestamp TIMESTAMP,
            admin_id TEXT,
            FOREIGN KEY(response_id) REFERENCES responses_encrypted(id)
        )
    """)
    
    conn.commit()
    conn.close()

_init_responses_db()

def save_response_encrypted(token, employee_name, department, email, responses):
    try:
        conn = sqlite3.connect(DB_RESPONSES)
        cursor = conn.cursor()
        
        response_id = str(uuid.uuid4())
        token_hash = hash_data(token)
        
        responses_json = json.dumps(responses)
        responses_encrypted = encrypt_data(responses_json)
        
        cursor.execute("""
            INSERT INTO responses_encrypted 
            (id, token_hash, employee_name, department, email, responses_encrypted, submission_date, completed)
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        """, (response_id, token_hash, employee_name, department, email, responses_encrypted, datetime.now()))
        
        log_response_audit(response_id, "RESPONSE_SUBMITTED", None)
        
        conn.commit()
        conn.close()
        
        return response_id
    except Exception as e:
        raise Exception(f"Erro ao salvar resposta: {str(e)}")

def get_response_decrypted(response_id, admin_id):
    try:
        conn = sqlite3.connect(DB_RESPONSES)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, employee_name, department, email, responses_encrypted, submission_date
            FROM responses_encrypted
            WHERE id = ?
        """, (response_id,))
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            log_response_audit(response_id, "RESPONSE_VIEWED", admin_id)
            response_id, name, dept, email, encrypted, date = result
            responses = json.loads(decrypt_data(encrypted))
            return {
                "id": response_id,
                "employee_name": name,
                "department": dept,
                "email": email,
                "responses": responses,
                "submission_date": date
            }
        return None
    except Exception as e:
        raise Exception(f"Erro ao recuperar resposta: {str(e)}")

def get_all_responses(admin_id):
    try:
        conn = sqlite3.connect(DB_RESPONSES)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, employee_name, department, email, submission_date, completed
            FROM responses_encrypted
            ORDER BY submission_date DESC
        """)
        
        results = cursor.fetchall()
        conn.close()
        
        log_response_audit(None, "RESPONSES_LIST_ACCESSED", admin_id)
        
        return results
    except Exception as e:
        raise Exception(f"Erro ao listar respostas: {str(e)}")

def log_response_audit(response_id, action, admin_id):
    try:
        conn = sqlite3.connect(DB_RESPONSES)
        cursor = conn.cursor()
        
        audit_id = str(uuid.uuid4())
        cursor.execute("""
            INSERT INTO response_audit (id, response_id, action, timestamp, admin_id)
            VALUES (?, ?, ?, ?, ?)
        """, (audit_id, response_id, action, datetime.now(), admin_id))
        
        conn.commit()
        conn.close()
    except:
        pass
