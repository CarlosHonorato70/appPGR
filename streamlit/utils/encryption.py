from cryptography.fernet import Fernet
import os
import base64
import hashlib

ENCRYPTION_KEY_FILE = ".encryption_key"

def _get_or_create_key():
    if not os.path.exists(ENCRYPTION_KEY_FILE):
        key = Fernet.generate_key()
        with open(ENCRYPTION_KEY_FILE, "wb") as f:
            f.write(key)
    else:
        with open(ENCRYPTION_KEY_FILE, "rb") as f:
            key = f.read()
    return key

def encrypt_data(data):
    key = _get_or_create_key()
    cipher = Fernet(key)
    if isinstance(data, str):
        data = data.encode()
    encrypted = cipher.encrypt(data)
    return encrypted.decode()

def decrypt_data(encrypted_data):
    key = _get_or_create_key()
    cipher = Fernet(key)
    if isinstance(encrypted_data, str):
        encrypted_data = encrypted_data.encode()
    decrypted = cipher.decrypt(encrypted_data)
    return decrypted.decode()

def hash_data(data):
    return hashlib.sha256(data.encode()).hexdigest()
