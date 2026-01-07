
<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Build-React%20%2B%20TS-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/UI-shadcn%2Fui-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/State-React%20Query-ff69b4?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Made%20by-SyntaxWeb-orange?style=for-the-badge" />
</p>

🚀 Instalação & Uso – SyntaxFin

Este guia ensina como instalar, configurar e executar o SyntaxFin, o sistema financeiro desenvolvido pela SyntaxWeb.

✅ 1. Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

Tecnologia	Versão recomendada
Node.js	≥ 18.x
npm ou yarn	Última versão
Git	Qualquer versão

Verifique rapidamente:

node -v
npm -v
git -v

📥 2. Baixar o projeto
git clone https://github.com/SyntaxWeb/syntaxfin.git
cd syntaxfin

📦 3. Instalar dependências

Usando npm:

npm install


Ou yarn:

yarn install

⚙️ 4. Configurar o ambiente (opcional)

Se o projeto possuir variáveis de ambiente:

cp .env.example .env

Se o arquivo `.env.example` não existir, crie-o manualmente na raiz do projeto e adicione as variáveis de ambiente necessárias, como por exemplo:


Edite o arquivo .env com suas configurações.

🏗️ 5. Executar em modo desenvolvimento
npm run dev


Ou:

yarn dev


Acesse o endereço informado no terminal (por padrão, http://localhost:5173, mas pode variar conforme a porta disponível).

http://localhost:5173


O Vite informará automaticamente a porta correta.

🏁 6. Gerar build de produção
npm run build


Os arquivos finais ficarão disponíveis em:

dist/

🔍 7. Visualizar o build localmente
npm run preview

🧼 8. Manter o projeto atualizado

Puxe atualizações do repositório:

git pull origin main


Reinstale dependências se houver alterações:

npm install

🛠️ 9. Scripts Disponíveis
Script	Função
npm run dev	Inicia o servidor em modo desenvolvimento
npm run build	Gera o pacote de produção
npm run preview	Serve o build localmente
npm run lint (opcional)	Roda o linter (se configurado)

> Caso não tenha lint configurado, você pode adicionar o ESLint executando:
> 
> ```bash
> npm install --save-dev eslint
> npx eslint --init
> ```
🎉 Pronto!

O SyntaxFin está instalado e funcionando.
Agora você pode:

Registrar rendas

Registrar despesas

Cadastrar cartões

Importar faturas automáticas

Exportar dados financeiros

Gerenciar parcelamentos e faturas futuras

Criado com ❤️ pela SyntaxWeb.
### Login com Google

1. No Google Cloud Console crie um OAuth Client ID para aplica??es web e copie o CLIENT_ID.
2. Na API Laravel, defina GOOGLE_CLIENT_ID no arquivo .env e execute composer install para garantir a depend?ncia google/apiclient.
3. No front-end defina VITE_GOOGLE_CLIENT_ID no .env (o mesmo client ID) e reinicie o 
pm run dev.
