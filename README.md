# Site com Login - Azure Ready

Um site simples com sistema de login pronto para deployment em instância Linux Azure.

## 🚀 Características

- ✅ Sistema de login e registro
- ✅ Dashboard responsivo
- ✅ Interface moderna com Tailwind CSS
- ✅ API Routes para autenticação
- ✅ Pronto para Azure Linux
- ✅ Docker support
- ✅ Nginx configuration

## 🔧 Instalação Local

\`\`\`bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
\`\`\`

## 🌐 Deploy no Azure

### Opção 1: Deploy Manual

1. Conecte-se à sua VM Azure Linux
2. Execute o script de deploy:

\`\`\`bash
chmod +x scripts/deploy-azure.sh
./scripts/deploy-azure.sh
\`\`\`

### Opção 2: Docker

\`\`\`bash
# Build da imagem
docker build -t azure-site .

# Executar container
docker run -p 3000:3000 azure-site

# Ou usar docker-compose
docker-compose up -d
\`\`\`

## 👤 Credenciais de Teste

- **Email:** demo@exemplo.com
- **Senha:** 123456

ou

- **Email:** admin@sistema.com  
- **Senha:** admin123

## 📁 Estrutura do Projeto

\`\`\`
├── app/
│   ├── page.tsx              # Página inicial
│   ├── login/page.tsx        # Página de login
│   ├── register/page.tsx     # Página de registro
│   ├── dashboard/page.tsx    # Dashboard do usuário
│   └── api/auth/            # APIs de autenticação
├── scripts/
│   └── deploy-azure.sh      # Script de deploy
├── Dockerfile               # Configuração Docker
├── docker-compose.yml       # Docker Compose
└── nginx.conf              # Configuração Nginx
\`\`\`

## 🔒 Segurança

⚠️ **IMPORTANTE:** Este é um exemplo básico. Para produção:

- Use hash para senhas (bcrypt)
- Implemente JWT tokens
- Configure HTTPS
- Use banco de dados real
- Adicione validações robustas
- Configure rate limiting

## 🛠️ Configurações Azure

### Portas necessárias:
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)
- 3000 (Aplicação)

### Recursos mínimos recomendados:
- 1 vCPU
- 1GB RAM
- 10GB Storage
