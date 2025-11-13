import streamlit as st
import sys
sys.path.insert(0, 'utils')

from auth_system import is_admin_authenticated, is_respondent_with_token, register_admin, authenticate_admin, logout_admin

st.set_page_config(
    page_title="Black Belt COPSOQ-II",
    page_icon="🏢",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Inicializar session state
if "admin_id" not in st.session_state:
    st.session_state.admin_id = None
    st.session_state.admin_email = None
    st.session_state.page = "login"

# Se respondente com token, ir direto ao formulário
if is_respondent_with_token():
    import streamlit.components.v1 as components
    query_params = st.query_params
    token = query_params.get("token", [None])[0] if isinstance(query_params.get("token", []), list) else query_params.get("token")
    components.html(f"""
    <script>
        window.location.href = "/COPSOQ-II?token={token}";
    </script>
    """, height=0)
    st.stop()

# Se admin autenticado
if is_admin_authenticated():
    st.set_page_config(initial_sidebar_state="expanded")
    
    st.title("🏢 Black Belt Consultoria - Sistema COPSOQ-II")
    
    col1, col2 = st.columns([4, 1])
    with col1:
        st.markdown(f"**[Admin]** Bem-vindo! ({st.session_state.admin_email})")
    with col2:
        if st.button("🚪 Sair", use_container_width=True):
            logout_admin()
            st.rerun()
    
    st.markdown("---")
    st.markdown("""
    ### 📋 Menu de Navegacao
    
    Use o menu lateral para acessar:
    - 📝 **Formulario COPSOQ-II** - Responder questionario
    - 📨 **Admin COPSOQ-II** - Gerenciar convites
    - 📊 **Resultados COPSOQ-II** - Ver respostas
    - 📈 **Dashboard** - Analise de dados
    """)
    
    st.markdown("---")
    st.success("✅ Sistema pronto para uso!")

else:
    # Tela de Login/Cadastro
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.title("🏢 Black Belt Consultoria")
        st.markdown("### Sistema COPSOQ-II")
        st.markdown("---")
        
        tab1, tab2 = st.tabs(["🔓 Login", "📝 Cadastro"])
        
        # ==================== TAB 1: LOGIN ====================
        with tab1:
            st.markdown("### Faça Login")
            
            with st.form("login_form"):
                username = st.text_input(
                    "Usuario:",
                    placeholder="Digite seu usuario",
                    key="login_username"
                )
                
                password = st.text_input(
                    "Senha:",
                    type="password",
                    placeholder="Digite sua senha",
                    key="login_password"
                )
                
                login_button = st.form_submit_button(
                    "🔓 Entrar",
                    use_container_width=True,
                    type="primary"
                )
                
                if login_button:
                    if not username or not password:
                        st.error("❌ Preencha usuario e senha!")
                    else:
                        success, admin_id, email = authenticate_admin(username, password)
                        
                        if success:
                            st.session_state.admin_id = admin_id
                            st.session_state.admin_email = email
                            st.success("✅ Login realizado com sucesso!")
                            st.rerun()
                        else:
                            st.error("❌ Usuario ou senha incorretos!")
            
            st.markdown("---")
            st.info("💡 Nao tem conta? Crie uma no aba **Cadastro**")
        
        # ==================== TAB 2: CADASTRO ====================
        with tab2:
            st.markdown("### Criar Nova Conta")
            
            with st.form("register_form"):
                register_username = st.text_input(
                    "Nome de Usuario:",
                    placeholder="Escolha um usuario (min. 3 caracteres)",
                    key="register_username"
                )
                
                register_email = st.text_input(
                    "E-mail:",
                    placeholder="seu@email.com",
                    key="register_email"
                )
                
                register_password = st.text_input(
                    "Senha:",
                    type="password",
                    placeholder="Min. 6 caracteres, 1 maiuscula, 1 numero",
                    key="register_password"
                )
                
                register_confirm_password = st.text_input(
                    "Confirmar Senha:",
                    type="password",
                    placeholder="Confirme sua senha",
                    key="register_confirm_password"
                )
                
                register_button = st.form_submit_button(
                    "📝 Cadastrar",
                    use_container_width=True,
                    type="primary"
                )
                
                if register_button:
                    success, message = register_admin(
                        register_username,
                        register_email,
                        register_password,
                        register_confirm_password
                    )
                    
                    if success:
                        st.success(f"✅ {message}")
                        st.info("Agora faca login na aba **Login**")
                    else:
                        st.error(f"❌ {message}")
            
            st.markdown("---")
            st.info("**Requisitos de Senha:**\n- Minimo 6 caracteres\n- 1 letra maiuscula\n- 1 numero")
        
        st.markdown("---")
        st.info("**Respondentes:** Clique no link do email para responder o questionario.")
