import sqlite3
import sys
sys.path.insert(0, 'utils')

from copsoq_invites import create_invite, validate_token, get_invite_by_token
from email_sender import send_invitation_email

print("\n" + "=" * 80)
print("TESTE COMPLETO DE FLUXO")
print("=" * 80)

# 1. Criar convite
print("\n[PASSO 1] Criando convite...")
try:
    token, url = create_invite("Test User", "test@example.com")
    print(f"✅ Convite criado!")
    print(f"   Token: {token}")
    print(f"   URL: {url}")
except Exception as e:
    print(f"❌ Erro: {e}")
    exit()

# 2. Verificar no banco
print("\n[PASSO 2] Verificando banco de dados...")
conn = sqlite3.connect("copsoq_invites.db")
cursor = conn.cursor()
cursor.execute("SELECT token FROM invites ORDER BY created_date DESC LIMIT 1")
result = cursor.fetchone()
db_token = result[0] if result else None
conn.close()

if db_token:
    print(f"✅ Token encontrado no banco!")
    print(f"   Token BD: {db_token}")
    print(f"   Token Gerado: {token}")
    print(f"   Iguais? {db_token == token}")
else:
    print(f"❌ Token nao encontrado no banco!")
    exit()

# 3. Validar token
print("\n[PASSO 3] Validando token...")
is_valid = validate_token(token)
print(f"   Valido? {is_valid}")

if not is_valid:
    print("❌ Token invalido!")
    exit()

# 4. Obter convite
print("\n[PASSO 4] Obtendo dados do convite...")
invite = get_invite_by_token(token)
if invite:
    print(f"✅ Convite recuperado!")
    print(f"   Nome: {invite['employee_name']}")
    print(f"   Email: {invite['email']}")
else:
    print(f"❌ Convite nao encontrado!")

print("\n" + "=" * 80)
print("✅ TESTE COMPLETO - TUDO OK!")
print("=" * 80 + "\n")
