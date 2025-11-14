# 🚀 Guia de Instalação - PowerShell (Windows)

## Comandos para Executar no PowerShell

### Pré-requisitos

Antes de começar, você precisa ter instalado:
- **Node.js 18+**: https://nodejs.org/
- **Python 3.10+**: https://www.python.org/downloads/
- **Git**: https://git-scm.com/download/win
- **Docker Desktop** (opcional): https://www.docker.com/products/docker-desktop/

---

## Opção 1: Usando Docker (Mais Fácil)

### 1. Abra o PowerShell como Administrador

```powershell
# Clone o repositório (se ainda não clonou)
git clone https://github.com/CarlosHonorato70/appPGR.git
cd appPGR

# Inicie todos os serviços com Docker
docker-compose up -d

# Verifique se os containers estão rodando
docker-compose ps
```

### 2. Acesse as Aplicações

- **Frontend Streamlit**: http://localhost:8501
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### 3. Ver Logs (se necessário)

```powershell
# Ver logs de todos os serviços
docker-compose logs -f

# Ver logs apenas do backend
docker-compose logs -f backend

# Ver logs apenas do streamlit
docker-compose logs -f streamlit
```

### 4. Parar o Sistema

```powershell
# Parar todos os serviços
docker-compose down
```

---

## Opção 2: Instalação Local (Sem Docker)

### Terminal 1 - Backend

```powershell
# Navegar para a pasta backend
cd backend

# Instalar dependências do Node.js
npm install

# Copiar arquivo de exemplo de configuração
Copy-Item .env.example .env.local

# IMPORTANTE: Edite o arquivo .env.local com suas configurações MySQL
# Use: notepad .env.local

# Iniciar o servidor backend em modo desenvolvimento
npm run dev
```

O backend estará rodando em: http://localhost:3000

### Terminal 2 - Frontend Streamlit (Abra um NOVO PowerShell)

```powershell
# Navegar para a pasta streamlit (a partir da raiz do projeto)
cd streamlit

# Criar ambiente virtual Python (recomendado)
python -m venv venv

# Ativar o ambiente virtual
.\venv\Scripts\Activate.ps1

# Se der erro de política de execução, execute:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Instalar dependências Python
pip install -r requirements.txt

# Iniciar a aplicação Streamlit
streamlit run app.py
```

O frontend estará rodando em: http://localhost:8501

---

## Sistema PGR Original (HTML)

Se você quiser usar o sistema PGR original (HTML/JS):

```powershell
# Na raiz do projeto
npm install

# Instalar http-server globalmente (se ainda não tiver)
npm install -g http-server

# Iniciar servidor HTTP
http-server -p 8080

# Ou usar o npx sem instalar globalmente
npx http-server -p 8080
```

Acesse: http://localhost:8080
- **Login**: admin
- **Senha**: admin123

---

## 🔧 Comandos Úteis do PowerShell

### Verificar se as Portas Estão Livres

```powershell
# Verificar porta 3000 (Backend)
netstat -ano | findstr :3000

# Verificar porta 8501 (Streamlit)
netstat -ano | findstr :8501

# Matar processo por PID (se necessário)
taskkill /PID <numero_do_pid> /F
```

### Verificar Versões Instaladas

```powershell
# Node.js
node --version

# npm
npm --version

# Python
python --version

# pip
pip --version

# Docker
docker --version
```

### Limpar e Reinstalar Dependências

```powershell
# Backend - Limpar node_modules
cd backend
Remove-Item -Recurse -Force node_modules
npm install

# Streamlit - Limpar ambiente virtual
cd streamlit
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

## 🎯 Testando o Sistema

### 1. Testar Backend API

```powershell
# Verificar se o backend está rodando
Invoke-WebRequest -Uri http://localhost:3000/health | Select-Object -Expand Content

# Ou use curl (se disponível)
curl http://localhost:3000/health
```

### 2. Testar Frontend Streamlit

Abra o navegador e acesse: http://localhost:8501

- O dashboard deve carregar automaticamente
- Teste navegação entre as páginas no menu lateral

---

## ❓ Problemas Comuns no Windows

### Erro: "Não é possível carregar o arquivo .ps1"

**Solução**: Altere a política de execução do PowerShell

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro: "Python não é reconhecido"

**Solução**: Adicione Python ao PATH ou reinstale marcando a opção "Add to PATH"

### Erro: "npm não é reconhecido"

**Solução**: Adicione Node.js ao PATH ou reinstale

### Erro: Porta já em uso

```powershell
# Encontre o processo usando a porta
netstat -ano | findstr :3000

# Mate o processo
taskkill /PID <PID> /F
```

### Docker não inicia

**Solução**: 
1. Verifique se o Docker Desktop está rodando
2. Verifique se a virtualização está habilitada no BIOS
3. Reinicie o Docker Desktop

---

## 📊 Sequência Completa de Inicialização (Local)

Copie e cole os comandos abaixo em sequência:

### PowerShell 1 (Backend):

```powershell
cd backend
npm install
Copy-Item .env.example .env.local
npm run dev
```

### PowerShell 2 (Frontend):

```powershell
cd streamlit
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
streamlit run app.py
```

---

## 🎉 Pronto!

Após executar os comandos, acesse:

- **Streamlit Dashboard**: http://localhost:8501
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

---

## 📚 Próximos Passos

1. Explore o Dashboard no Streamlit
2. Teste a calculadora de precificação
3. Crie uma proposta de exemplo
4. Veja a documentação completa em `README_INTEGRATED.md`

---

## 💡 Dicas para Windows

1. Use o **Windows Terminal** para melhor experiência (disponível na Microsoft Store)
2. Mantenha múltiplas abas abertas para backend e frontend
3. Use **Ctrl+C** para parar os servidores
4. Configure um editor de texto como VS Code para editar `.env.local`

---

**Precisa de ajuda?** Abra uma issue em: https://github.com/CarlosHonorato70/appPGR/issues

**Desenvolvido com ❤️ por Carlos Honorato**
