# 📋 Aura Task

> Sistema moderno de gerenciamento de tarefas com autenticação de usuários, organização por projetos e interface responsiva.


## 🎯 Sobre o Projeto

Aura Task é uma aplicação web completa para gerenciamento de tarefas desenvolvida durante minha jornada de aprendizado em desenvolvimento web na graduação de Engenharia de Software. O projeto foi criado com foco em boas práticas de programação e experiência do usuário.

### ✨ Funcionalidades

- ✅ **Autenticação completa**: Login, cadastro e recuperação de senha
- ✅ **CRUD de tarefas**: Criar, ler, atualizar e deletar tarefas
- ✅ **Organização inteligente**: 
  - Visualização por data (Hoje, Sem data)
  - Organização por projetos/categorias
  - Filtro de tarefas concluídas
  - Sistema de prioridades (Baixa, Normal, Alta)
- ✅ **Interface responsiva**: Funciona perfeitamente em desktop, tablet e mobile
- ✅ **Notificações em tempo real**: Feedback visual para todas as ações
- ✅ **Contador de tarefas**: Visualização rápida de tarefas pendentes e atrasadas
- ✅ **Busca e ordenação**: Encontre rapidamente suas tarefas

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna e responsiva
- **JavaScript (ES6+)** - Lógica da aplicação
  - Async/Await para operações assíncronas
  - Manipulação do DOM
  - Event Listeners

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL (Banco de dados)
  - Supabase Auth (Autenticação)
  - Row Level Security (Segurança)

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Navegador web moderno
- Conta no [Supabase](https://supabase.com) (gratuita)

### Passo a Passo

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/aura-task.git
cd aura-task
```

2. **Configure o Supabase**

- Crie um novo projeto no Supabase
- Execute o SQL abaixo no SQL Editor do Supabase:

```sql
-- Criar tabela de tarefas
create table tasks (
  id bigint primary key generated always as identity,
  user_id uuid references auth.users not null,
  text text not null,
  completed boolean default false,
  priority integer default 2,
  category text,
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar Row Level Security
alter table tasks enable row level security;

-- Políticas de segurança
create policy "Usuários podem ver apenas suas tarefas"
  on tasks for select
  using (auth.uid() = user_id);

create policy "Usuários podem inserir suas próprias tarefas"
  on tasks for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar suas próprias tarefas"
  on tasks for update
  using (auth.uid() = user_id);

create policy "Usuários podem deletar suas próprias tarefas"
  on tasks for delete
  using (auth.uid() = user_id);
```

3. **Configure as credenciais**

Abra o arquivo `index.js` e substitua pelas suas credenciais do Supabase:

```javascript
const SUPABASE_URL = 'sua-url-do-supabase';
const SUPABASE_KEY = 'sua-chave-anonima-do-supabase';
```

4. **Execute o projeto**

Abra o arquivo `index.html` em um navegador web ou use um servidor local:

```bash
# Usando Python
python -m http.server 8000

# Usando Node.js (http-server)
npx http-server

# Usando VS Code Live Server
# Clique com botão direito em index.html > Open with Live Server
```

5. **Acesse a aplicação**

Abra seu navegador em `http://localhost:8000` (ou a porta que você configurou)

## 📂 Estrutura do Projeto

```
aura-task/
├── index.html          # Estrutura HTML da aplicação
├── style.css           # Estilos e responsividade
├── index.js            # Lógica da aplicação
└── README.md           # Documentação
```

## 🎨 Funcionalidades em Destaque

### Sistema de Visualizações
- **Hoje**: Mostra apenas as tarefas com vencimento para o dia atual
- **Entrada**: Visualização geral de todas as tarefas
- **Sem data**: Tarefas sem data de vencimento definida
- **Concluído**: Histórico de tarefas finalizadas
- **Projetos**: Organização por categorias personalizadas

### Interface Responsiva
- Menu lateral retrátil em dispositivos móveis
- Adaptação automática de layout
- Experiência otimizada para touch screens

### Sistema de Prioridades
- 🔴 Alta: Para tarefas urgentes
- 🟡 Normal: Tarefas do dia a dia
- 🟢 Baixa: Tarefas menos prioritárias

## 💡 Aprendizados

Este projeto me permitiu consolidar conhecimentos em:

- Desenvolvimento frontend moderno
- Integração com APIs REST
- Autenticação e segurança de usuários
- Design responsivo e UX/UI
- Gerenciamento de estado no frontend
- Operações assíncronas em JavaScript
- Trabalho com banco de dados relacional

## 🔜 Próximos Passos

- [ ] Implementar modo escuro/claro
- [ ] Adicionar notificações por email
- [ ] Sistema de tags para tarefas
- [ ] Compartilhamento de projetos entre usuários
- [ ] Estatísticas e gráficos de produtividade
- [ ] Aplicativo mobile com React Native
- [ ] Integração com calendário

# 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

**👩‍💻 Autora**

**Ludmilla dos Santos Silva**

- LinkedIn:https://www.linkedin.com/in/ludmilla-santos-954650207/
- Email: santosludmilla33@gmail.com


⭐️ Se este projeto te ajudou de alguma forma, considere dar uma estrela!

**Desenvolvido com 💜 por Ludmilla Silva**
