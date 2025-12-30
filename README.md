# O Investigador Ghost - Guia Completo do Projeto

Bem-vindo à documentação oficial do projeto **O Investigador Ghost**. Este projeto é uma plataforma de notícias moderna e robusta, construída com uma arquitetura de microsserviços utilizando Docker, Ghost CMS, Node.js e React.

Este guia cobre **tudo** o que precisa de saber para configurar, rodar e manter o projeto, incluindo como obter as chaves de API necessárias.

---

## 🏗️ Arquitetura do Projeto

O sistema é composto pelos seguintes serviços, orquestrados via Docker Compose:

1.  **Ghost CMS (`ghost`)**: O coração da plataforma. Gerencia o conteúdo, posts e autores.
    *   *Porta Local*: `2368`
2.  **MySQL (`mysql`)**: Banco de dados relacional usado pelo Ghost.
    *   *Porta Local*: `3306`
3.  **API Customizada (`api`)**: Backend em Node.js para funcionalidades extras e integração com o painel administrativo customizado.
    *   *Porta Local*: `3001`
4.  **Painel Administrativo (`admin`)**: Frontend em React (Vite) para gestão avançada.
    *   *Porta Local*: `5173`
5.  **Nginx (`nginx`)**: Proxy reverso que serve como porta de entrada (Gateway) para os serviços.
    *   *Porta Local*: `80` (HTTP) / `443` (HTTPS)

---

## 💻 Pré-requisitos e Requisitos de Máquina

### Para Desenvolvimento Local (Seu Computador)
*   **Sistema Operativo**: Windows, macOS ou Linux.
*   **Software**:
    *   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (obrigatório).
    *   [Git](https://git-scm.com/downloads).
    *   (Opcional) Node.js v18+ (apenas se quiser rodar scripts fora do Docker).
*   **Hardware**: Mínimo de 4GB RAM livres.

### Para Produção (Servidor/VPS)
*   **VPS Recomendado**: Servidor com Linux (Ubuntu 20.04 ou 22.04 LTS).
*   **Hardware**:
    *   **CPU**: 2 vCPU ou mais recomendado.
    *   **RAM**: 4GB Mínimo (Ghost e MySQL consomem memória considerável).
    *   **Disco**: 40GB+ SSD/NVMe.
*   **Software**: Docker Engine e Docker Compose Plugin.

---

## 🚀 Guia de Instalação e Configuração (Passo a Passo)

Siga estes passos na ordem exata para meter o projeto a rodar.

### 1. Clonar o Repositório
Abra o terminal e clone o projeto para a sua máquina:
```bash
git clone <url-do-repositorio> o-investigador-ghost
cd o-investigador-ghost
```

### 2. Configurar o Arquivo `.env` (CRUCIAL)
O projeto precisa de variáveis de ambiente. Há um arquivo `.env` na raiz. Se não existir, crie um baseado no exemplo abaixo ou use o existente.

**Certifique-se de que o arquivo `.env` na raiz contém o seguinte (ajuste as senhas):**

```ini
# --- Geral ---
NODE_ENV=development

# --- Banco de Dados (MySQL) ---
DB_HOST=mysql
DB_PORT=3306
DB_ROOT_PASSWORD=sua_senha_root_segura
DB_NAME=o_investigador
DB_USER=ghost
DB_PASSWORD=sua_senha_ghost_segura

# --- Ghost CMS ---
GHOST_URL=http://localhost:2368
# URL interna para API (usada pelo container da API)
GHOST_API_URL=http://ghost:2368
# Mails (Configure Mailgun ou SendGrid para produção)
GHOST_MAIL_FROM=noreply@oseudominio.com

# --- API Keys do Ghost (VER SEÇÃO "OBTENDO CHAVES" ABAIXO) ---
# Você precisa rodar o projeto UMA vez para gerar essas chaves no painel do Ghost
GHOST_API_KEY=

# --- API Customizada & Segurança ---
JWT_SECRET=segredo_super_secreto_para_tokens
CORS_ORIGIN=http://localhost:2368,http://localhost:5173,http://localhost:3000

# --- Admin Panel ---
VITE_API_URL=http://localhost:3001
VITE_GHOST_URL=http://localhost:2368

# --- Serviços Externos (Opcionais Localmente) ---
SENDGRID_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=eu-west-1
AWS_BUCKET=o-investigador-media
```

### 3. Iniciar o Projeto
Com o Docker Desktop aberto, rode:

```bash
docker-compose up -d --build
```
*Isso vai baixar as imagens, construir a API e o Admin Panel, e iniciar tudo. Pode demorar alguns minutos na primeira vez.*

---

## 🔑 Como Obter e Configurar as Chaves de API

Esta é a parte mais importante para que a **API Customizada** e o **Painel Administrativo** funcionem corretamente.

### 1. Ghost Admin & Content API Keys
A `GHOST_API_KEY` é necessária para que a nossa API Node.js comunique com o Ghost.

1.  Garanta que o projeto está rodando (`docker-compose up -d`).
2.  Acesse o Painel do Ghost: [http://localhost:2368/ghost](http://localhost:2368/ghost).
3.  Crie a sua conta de administrador (passo a passo inicial do Ghost).
4.  No menu lateral esquerdo, clique no **ícone de engrenagem (Settings)**.
5.  Vá em **Advanced** -> **Integrations**.
6.  Role até o fundo e clique em **+ Add custom integration**.
7.  Dê o nome **"API Interna"** e clique em **Create**.
8.  Você verá duas chaves:
    *   **Content API Key**
    *   **Admin API Key**
9.  Copie a **Content API Key** (chave longa hexadecimal).
10. Copie a **Admin API Key** (chave muito longa que contém dois pontos `:` no meio).
11. **IMPORTANTE**: Para a variável `GHOST_API_KEY` no `.env`, nós geralmente usamos a **Content API Key** para leituras públicas. Se a API precisar fazer escritas (criar posts), você precisará configurar a Admin Key na lógica da API, mas por padrão, preencha `GHOST_API_KEY` com a **Content API Key**.
    *   *Nota: Se no código da API ele exigir especificamente a Admin Key para certas operações, use-a.*

### 2. Chave de E-mail (SendGrid ou Mailgun)
O Ghost precisa de um serviço de e-mail para enviar convites de staff, recuperação de senha e newsletters.

*   **Onde conseguir**: Crie uma conta no [SendGrid](https://sendgrid.com/) ou [Mailgun](https://www.mailgun.com/).
*   **Como configurar**: Obtenha a API Key no painel deles.
*   **No `.env`**: Preencha `SENDGRID_API_KEY` ou configure as variáveis SMTP do Ghost:
    ```ini
    mail__transport=SMTP
    mail__options__service=SendGrid
    mail__options__auth__user=apikey
    mail__options__auth__pass=SUA_CHAVE_SENDGRID_AQUI
    ```

### 3. AWS S3 (Armazenamento de Mídia)
Para armazenar imagens na nuvem (Amazon S3) e não perder arquivos se o container for deletado.

*   **Onde conseguir**: Console AWS -> IAM (Users) -> Create User -> Attach Policies (AmazonS3FullAccess) -> Create Access Key.
*   **No `.env`**:
    *   `AWS_ACCESS_KEY_ID`: Sua Access Key.
    *   `AWS_SECRET_ACCESS_KEY`: Sua Secret Key.
    *   `AWS_BUCKET`: Nome do bucket criado no S3.
    *   `AWS_REGION`: Região do bucket (ex: `eu-west-1`).

---

## 🖥️ Como Acessar o Projeto (URLs Locais)

Após rodar `docker-compose up -d`:

| Serviço | URL | Descrição |
| :--- | :--- | :--- |
| **Site Público** | [http://localhost:2368](http://localhost:2368) | O site visível para os leitores (Ghost Theme). |
| **Ghost Admin** | [http://localhost:2368/ghost](http://localhost:2368/ghost) | Painel original do Ghost para escrever posts. |
| **Painel Custom**| [http://localhost:5173](http://localhost:5173) | Novo painel administrativo React. |
| **API Backend** | [http://localhost:3001](http://localhost:3001) | Endpoints da API Node.js. |
| **Gateway** | [http://localhost](http://localhost) | Acesso via Nginx (porta 80). |

---

## 🛠️ Comandos Úteis

### Parar o projeto
Para parar todos os containers e liberar memória:
```bash
docker-compose down
```

### Ver logs (Debugging)
Se algo der errado, veja o que está acontecendo:
```bash
# Logs de tudo
docker-compose logs -f

# Logs apenas de um serviço específico (ex: api)
docker-compose logs -f api
```

### Reconstruir (Reset)
Se você editou código da API ou do Painel e as mudanças não apareceram, reconstrua:
```bash
docker-compose up -d --build
```

### Acessar o terminal do container
Para rodar comandos dentro do container (ex: dentro do banco de dados ou Ghost):
```bash
docker exec -it o-investigador-ghost /bin/bash
# ou
docker exec -it o-investigador-db mysql -u ghost -p
```

---

## 🌍 Deploy em Produção (VPS)

Para deploy em servidores reais (como ISSCLOUD), consulte o arquivo dedicado:
📄 [**DEPLOYMENT_ISSCLOUD.md**](./DEPLOYMENT_ISSCLOUD.md)

Ele contém instruções específicas para:
1.  Configuração de VPS Ubuntu.
2.  Instalação de Docker no servidor.
3.  Configuração de SSL (HTTPS) com Let's Encrypt.
4.  Proxy Reverso Nginx de produção.

---

## ❓ Troubleshooting (Problemas Comuns)

**1. Erro: "Connection Refused" no Banco de Dados**
*   **Causa**: O container `mysql` ainda não terminou de iniciar quando o Ghost tentou conectar.
*   **Solução**: Espere 30 segundos e o Ghost deve tentar reconectar automaticamente. Se não, rode `docker-compose restart ghost`.

**2. As imagens não aparecem**
*   **Locais**: Verifique se a pasta `ghost-theme` está mapeada corretamente no `docker-compose.yml`.
*   **AWS S3**: Verifique se as credenciais no `.env` estão corretas e se o bucket tem permissões públicas de leitura.

**3. Não consigo logar no Ghost**
*   Se esqueceu a senha, você precisará acessar o banco de dados para resetar ou reinstalar o banco (deletando o volume `mysql_data` via docker).
    ```bash
    docker-compose down -v  # ATENÇÃO: ISSO APAGA TODO O BANCO DE DADOS
    docker-compose up -d
    ```

---
*Documentação gerada para O Investigador Ghost - Dezembro 2025.*
