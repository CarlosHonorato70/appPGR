import streamlit as st
import sqlite3
import hashlib
import os
from datetime import datetime
import uuid
import re

DB_ADMIN = "admin_auth.db"

def _init_auth_db():
    conn = sqlite3.connect(DB_ADMIN)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS admin_users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_date TIMESTAMP,
            last_login TIMESTAMP,
            active INTEGER DEFAULT 1
        )
    """)
    
    conn.commit()
    conn.close()

_init_auth_db()

def hash_password(password):
    salt = os.urandom(32)
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
    return salt.hex() + pwd_hash.hex()

def verify_password(stored_hash, password):
    try:
        salt = bytes.fromhex(stored_hash[:64])
        stored_pwd_hash = stored_hash[64:]
        pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)
        return pwd_hash.hex() == stored_pwd_hash
    except:
        return False

def is_valid_email(email):
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return re.match(pattern, email) is not None

def is_valid_password(password):
    if len(password) < 6:
        return False, "Senha deve ter no minimo 6 caracteres"
    if not any(c.isupper() for c in password):
        return False, "Senha deve conter pelo menos uma letra maiuscula"
    if not any(c.isdigit() for c in password):
        return False, "Senha deve conter pelo menos um numero"
    return True, "Valido"

def register_admin(username, email, password, confirm_password):
    if not username or len(username) < 3:
        return False, "Usuario deve ter no minimo 3 caracteres"
    
    if not is_valid_email(email):
        return False, "Email invalido"
    
    if password != confirm_password:
        return False, "As senhas nao conferem"
    
    is_valid, message = is_valid_password(password)
    if not is_valid:
        return False, message
    
    try:
        conn = sqlite3.connect(DB_ADMIN)
        cursor = conn.cursor()
        
        admin_id = str(uuid.uuid4())
        password_hash = hash_password(password)
        
        cursor.execute("""
            INSERT INTO admin_users (id, username, email, password_hash, created_date, active)
            VALUES (?, ?, ?, ?, ?, 1)
        """, (admin_id, username, email, password_hash, datetime.now()))
        
        conn.commit()
        conn.close()
        
        return True, "Cadastro realizado com sucesso! Faca login para continuar."
    
    except sqlite3.IntegrityError as e:
        if "username" in str(e):
            return False, "Este usuario ja existe"
        elif "email" in str(e):
            return False, "Este email ja esta cadastrado"
        else:
            return False, "Erro ao cadastrar"
    except Exception as e:
        return False, f"Erro: {str(e)}"

def authenticate_admin(username, password):
    try:
        conn = sqlite3.connect(DB_ADMIN)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT id, password_hash, active, email FROM admin_users 
            WHERE username = ?
        """, (username,))
        
        result = cursor.fetchone()
        
        if result:
            admin_id, stored_hash, active, email = result
            if active == 1 and verify_password(stored_hash, password):
                cursor.execute("""
                    UPDATE admin_users SET last_login = ? WHERE id = ?
                """, (datetime.now(), admin_id))
                conn.commit()
                conn.close()
                return True, admin_id, email
        
        conn.close()
        return False, None, None
    
    except Exception as e:
        return False, None, None

def is_admin_authenticated():
    return "admin_id" in st.session_state and st.session_state.admin_id is not None

def is_respondent_with_token():
    query_params = st.query_params
    token = query_params.get("token", [None])[0] if isinstance(query_params.get("token", []), list) else query_params.get("token")
    return bool(token)

def get_user_role():
    if "admin_id" in st.session_state and st.session_state.admin_id:
        return "ADMIN"
    elif is_respondent_with_token():
        return "RESPONDENT"
    return "ANONYMOUS"

def logout_admin():
    if "admin_id" in st.session_state:
        del st.session_state.admin_id
    if "admin_email" in st.session_state:
        del st.session_state.admin_email
    st.session_state.page = "login"

def require_admin():
    if not is_admin_authenticated():
        st.error("❌ Acesso negado: Autenticacao de administrador necessaria.")
        st.stop()

def require_respondent_with_token():
    if not is_respondent_with_token():
        st.error("❌ Acesso negado: Link invalido.")
        st.stop()
