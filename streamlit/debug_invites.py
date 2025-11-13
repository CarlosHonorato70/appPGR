import sqlite3
import sys
sys.path.insert(0, 'utils')

print("=" * 80)
print("DEBUG COMPLETO: COPSOQ INVITES")
print("=" * 80)

# Verificar banco de dados
DB_PATH = "copsoq_invites.db"

try:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Ver estrutura da tabela
    print("\n[1] ESTRUTURA DA TABELA:")
    cursor.execute("PRAGMA table_info(invites)")
    columns = cursor.fetchall()
    for col in columns:
        print(f"   - {col[1]} ({col[2]})")
    
    # Ver quantos convites existem
    print("\n[2] CONVITES NO BANCO:")
    cursor.execute("SELECT COUNT(*) FROM invites")
    count = cursor.fetchone()[0]
    print(f"   Total: {count} convite(s)")
    
    # Ver todos os convites
    if count > 0:
        print("\n[3] DETALHES DOS CONVITES:")
        cursor.execute("""
            SELECT id, employee_name, email, token, created_date, completed
            FROM invites
        """)
        invites = cursor.fetchall()
        
        for idx, (inv_id, name, email, token, date, completed) in enumerate(invites, 1):
            print(f"\n   Convite #{idx}:")
            print(f"   - ID: {inv_id}")
            print(f"   - Nome: {name}")
            print(f"   - Email: {email}")
            print(f"   - Token: {token}")
            print(f"   - Token Length: {len(token)}")
            print(f"   - Data: {date}")
            print(f"   - Concluido: {completed}")
            
            # Link gerado
            link = f"http://localhost:8501/COPSOQ-II?token={token}"
            print(f"   - Link: {link}")
    
    conn.close()
    print("\n" + "=" * 80)
    print("✅ Banco de dados ok")
    print("=" * 80)

except Exception as e:
    print(f"\n❌ ERRO: {e}")
    import traceback
    traceback.print_exc()
