# 🚀 Quick Start - Black Belt Sistema Integrado

## Início Rápido em 5 Minutos

### Opção 1: Usando Docker (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/CarlosHonorato70/appPGR.git
cd appPGR

# 2. Inicie todos os serviços com Docker
docker-compose up -d

# 3. Acesse as aplicações
# - Backend API: http://localhost:3000
# - Streamlit: http://localhost:8501
# - MySQL: localhost:3306
```

### Opção 2: Instalação Local

#### Backend (Terminal 1)

```bash
cd backend
npm install
cp .env.example .env.local
# Edite .env.local com suas credenciais MySQL
npm run dev
```

#### Streamlit (Terminal 2)

```bash
cd streamlit
pip install -r requirements.txt
streamlit run app.py
```

## 📱 Acessando o Sistema

### Streamlit Interface
- **URL**: http://localhost:8501
- **Usuário**: Admin (não requer login na versão demo)

### Backend API
- **URL**: http://localhost:3000
- **Health Check**: http://localhost:3000/health
- **tRPC Endpoint**: http://localhost:3000/trpc

### Sistema PGR Original
- **URL**: http://localhost:8080 (usando http-server)
- **Login**: admin / admin123

## 🎯 Primeiros Passos

### 1. Configurar Precificação

1. Acesse Streamlit: http://localhost:8501
2. Clique em "🧮 Precificação"
3. Configure:
   - Custos Fixos: R$ 5.000
   - Pró-labore: R$ 2.000
   - Horas Produtivas: 160
4. Clique em "💾 Salvar Parâmetros"

### 2. Calcular um Item

1. Vá para a aba "Calcular Item"
2. Preencha:
   - Preço Base: R$ 5.000
   - Horas Estimadas: 40
   - Regime: Simples Nacional
3. Clique em "🔢 Calcular"
4. Veja o resultado calculado automaticamente

### 3. Criar uma Proposta

1. Clique em "📄 Propostas"
2. Vá para "Criar Nova"
3. Preencha os dados do cliente
4. Adicione itens
5. Clique em "✅ Criar Proposta"

### 4. Avaliar Riscos

1. Clique em "🛡️ Avaliação de Riscos"
2. Vá para "Criar Nova Avaliação"
3. Selecione cliente e setor
4. Avalie fatores psicossociais (0-10)
5. Adicione recomendações
6. Clique em "📝 Salvar Avaliação"

## 📊 Dashboard

O dashboard mostra:
- Total de propostas
- Taxa de conversão
- Valor total gerado
- Gráficos de status

## 🔧 Comandos Úteis

### Backend

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Lint
npm run lint
```

### Streamlit

```bash
# Iniciar aplicação
streamlit run app.py

# Com porta customizada
streamlit run app.py --server.port 8502
```

### Docker

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Rebuild
docker-compose up -d --build
```

## ❓ Problemas Comuns

### Backend não inicia
```bash
# Verifique se a porta está livre
lsof -i :3000
# Mate o processo se necessário
kill -9 <PID>
```

### Streamlit não conecta
```bash
# Verifique se o backend está rodando
curl http://localhost:3000/health
```

### MySQL não conecta
```bash
# Teste conexão
mysql -u blackbelt_user -p -h localhost
```

## 📚 Documentação

- **README Completo**: [README_INTEGRATED.md](README_INTEGRATED.md)
- **Guia de Integração**: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
- **Issues**: [GitHub Issues](https://github.com/CarlosHonorato70/appPGR/issues)

## 💡 Dicas

1. Use o Docker Compose para ambiente de desenvolvimento completo
2. Configure as variáveis de ambiente antes de iniciar
3. Verifique os logs se algo não funcionar
4. O Streamlit recarrega automaticamente ao editar código
5. Use `npm run dev` no backend para hot-reload

## 🎓 Próximo Passo

Explore a documentação completa em [README_INTEGRATED.md](README_INTEGRATED.md) para entender todas as funcionalidades e APIs disponíveis.

---

**Desenvolvido com ❤️ por Carlos Honorato**
