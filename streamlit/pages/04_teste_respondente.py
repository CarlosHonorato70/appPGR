import streamlit as st
import sys
sys.path.insert(0, 'utils')

st.set_page_config(page_title="Teste Respondente", layout="wide")

st.title("🧪 Teste - Pagina Respondente")
st.markdown("---")

# Obter token da URL
query_params = st.query_params
token = query_params.get("token", [None])[0] if isinstance(query_params.get("token", []), list) else query_params.get("token")

st.subheader("Debug de Token")

st.write(f"**Token recebido:** {token}")
st.write(f"**Tipo:** {type(token)}")
st.write(f"**Tamanho:** {len(token) if token else 0} caracteres")

if token:
    from copsoq_invites import validate_token, get_invite_by_token
    
    st.markdown("---")
    
    # Validar
    is_valid = validate_token(token)
    st.write(f"**Token valido?** {is_valid}")
    
    if is_valid:
        st.success("✅ Token valido!")
        
        # Obter dados
        invite = get_invite_by_token(token)
        if invite:
            st.write("**Dados do convite:**")
            st.json(invite)
        else:
            st.error("Convite nao encontrado")
    else:
        st.error("❌ Token invalido ou expirado")
        
        # Debug
        import sqlite3
        conn = sqlite3.connect("copsoq_invites.db")
        cursor = conn.cursor()
        cursor.execute("SELECT token FROM invites WHERE token = ?", (token,))
        result = cursor.fetchone()
        conn.close()
        
        if result:
            st.warning("Token existe no banco mas marcado como completo")
        else:
            st.error("Token nao existe no banco de dados")
else:
    st.error("Token nao fornecido na URL")
