SymptomTrack - Monitor de Saúde Pessoal

Sistema completo de monitoramento de sintomas e ciclo menstrual, com back-end persistente em SQLite e autenticação segura.

🚀 Funcionalidades

Autenticação Segura: Registro e login de usuários com senhas criptografadas (Bcrypt) e sessões via JWT.

Monitoramento de Sintomas: Cadastro de intensidade e notas, com gráficos de evolução em tempo real.

Calendário de Ciclo: Registro persistente de dias de ciclo menstrual.

Dashboard Analítico: Médias de intensidade e alertas para sintomas agudos.

Modo Escuro: Interface adaptável às preferências do sistema.

Exportação: Geração de relatórios em texto para consulta médica.

🛠️ Tecnologias Utilizadas

Front-end: HTML5, Tailwind CSS, Lucide Icons, Chart.js.

Back-end: Node.js, Express.

Banco de Dados: SQLite (via better-sqlite3).

Segurança: JSON Web Tokens (JWT) e Bcrypt.js.

📋 Pré-requisitos

Node.js (v18 ou superior)

NPM ou Yarn

🔧 Instalação e Execução

No terminal, instale as dependências:

npm install


Inicie o servidor:

npm start


Acesse a aplicação em:
http://localhost:3000

📂 Estrutura de Arquivos

server.js: Arquivo principal do servidor Express e definições de rotas da API.

database.js: Configuração e inicialização automática do banco de dados SQLite.

middleware/auth.js: Middleware para proteção de rotas privadas via JWT.

public/index.html: Interface do usuário atualizada para comunicação com o back-end.

🔐 Endpoints da API

POST /api/auth/register: Cria um novo usuário.

POST /api/auth/login: Autentica o usuário e retorna o token.

GET /api/symptoms: Retorna todos os sintomas do usuário logado.

POST /api/symptoms: Registra um novo sintoma.

DELETE /api/symptoms/:id: Remove um registro de sintoma.

GET /api/cycle: Retorna os dias de ciclo do usuário.

POST /api/cycle/toggle: Adiciona ou remove um dia do calendário de ciclo.