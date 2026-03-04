# Documento de Requisitos de Produto (PRD)

## PARTE 1: VISÃO DE PRODUTO

### 1. Visão Geral

**Contexto**  
Sistema de controle financeiro pessoal, modelo Progressive Web App (PWA), para que pessoas físicas registrem contas, receitas, despesas, categorizem transações, visualizem gráficos e operem com suporte offline **read-only** (consulta), mantendo operações de escrita (criar/editar/excluir) disponíveis apenas quando online.

**Problema a Resolver**  
Facilitar o planejamento financeiro individual sem dependência constante de conexão, com acesso seguro e privado, permitindo ao usuário consultar sua situação financeira mesmo sem internet (quando dados estiverem previamente cacheados).

**Solução Proposta**  
Aplicação **full stack** com **Remix** (UI + backend no mesmo app), persistindo dados em PostgreSQL. O frontend é entregue como PWA com service worker para cache de assets e dados previamente carregados (offline read-only). Upload de anexos (PDF/imagens) é suportado, com armazenamento local em volume Docker montado na VPS.

**Stakeholders Principais**  
- Usuário final (pessoa física)
- Proprietário/admin/operador solo (ViniciusTei)
- Legislação/compliance LGPD
- Infraestrutura local (VPS própria)
- Ferramentas open source integradas (conforme necessidade)

---

### 2. Objetivos de Negócio

- Entregar um MVP funcional para controle financeiro pessoal com PWA e offline read-only.
- Garantir compatibilidade com LGPD (incluindo deleção total dos dados do usuário).
- Manter baixo custo operacional (infraestrutura local).
- Criar base evolutiva para futuras funcionalidades (ex.: alertas, Open Finance, multiusuário).
- Garantir qualidade mínima via TDD e cobertura de testes ≥ 60%.

---

### 3. Público-Alvo e Personas

- **Usuário final:** pessoa física que deseja registrar e acompanhar finanças pessoais com praticidade e suporte offline (consulta).
- **Administrador/operador:** o próprio autor (ViniciusTei), responsável por deploy, backup, manutenção e recuperação.
- **Suporte técnico dedicado:** fora do escopo do MVP.
- **Stakeholders de compliance:** requisitos mínimos para LGPD.

---

### 4. User Stories

**Histórias Principais**
- Como usuário, quero cadastrar contas financeiras para organizar meu dinheiro por origem.
- Como usuário, quero registrar receitas e despesas para acompanhar meus gastos e entradas.
- Como usuário, quero categorizar transações para entender para onde vai meu dinheiro.
- Como usuário, quero ver um dashboard com gráficos e resumos para entender minha situação.
- Como usuário, quero consultar meus dados mesmo offline (read-only), desde que já tenham sido carregados anteriormente.
- Como usuário, quero anexar comprovantes (PDF/imagem) em registros (até 500MB por arquivo).

**Cenários de sucesso e erro (exemplos)**
- Offline read-only: usuário abre o app offline → assets carregam do cache → dados aparecem se já estiverem cacheados; caso contrário, exibir “dados indisponíveis offline”.
- Escrita offline: não suportada no MVP; app deve orientar “necessário estar online para registrar/editar”.

**Priorização (MoSCoW)**
- **Must have:** Auth, CRUD contas/categorias/transações, dashboard, PWA, offline read-only, LGPD (deleção total).
- **Should have:** gráficos e filtros principais.
- **Could have:** anexos por transação/conta (definido como parte do escopo atual).
- **Won’t have (MVP):** Open Finance, investimentos, compartilhamento familiar, escrita offline com sincronização.

---

## PARTE 2: REQUISITOS FUNCIONAIS

### 5. Funcionalidades Core

- Cadastro e autenticação de usuários (sessão via cookie)
- CRUD de contas
- CRUD de categorias
- CRUD de transações
- Dashboard com resumo financeiro e gráficos
- PWA com offline **read-only** (cache de dados previamente carregados)
- Upload/download de anexos (PDF/imagens) com limite de 500MB por arquivo
- Deleção total de conta e dados (LGPD)

**Regras de Negócio**
- RN01: Saldo da conta = saldo inicial + receitas - despesas
- RN02: Não permitir transações com valor <= 0
- RN03: Não permitir excluir conta com transações vinculadas
- RN04: Usuário só visualiza/edita seus próprios dados (escopo por `user_id`)
- RN05: Operações de escrita requerem conexão online e sessão válida

---

### 6. Integrações

- Full stack: Remix (SSR + rotas + backend via loaders/actions)
- PWA: service worker (cache de assets e dados)
- ORM: Drizzle
- PostgreSQL
- Nginx (reverse proxy + TLS)
- Docker/Docker Compose (ambientes separados e replicáveis)
- Gitea Pipelines (CI/CD via SSH)

---

## PARTE 3: REQUISITOS NÃO-FUNCIONAIS

### 7. Performance e Escalabilidade

- Tempo de resposta < 2s em operações típicas (CRUD e dashboard).
- **Exceção:** upload/download de anexos (até 500MB) depende de rede e não segue a meta de 2s; deve ser estável e não travar o servidor (streaming + timeouts).
- MVP sem dimensionamento para alta escala (usuários simultâneos permitidos, sem estimativas).

---

### 8. Disponibilidade e Confiabilidade

- Downtime tolerado (sem SLA formal).
- Perda de dados tolerada no MVP (RTO/RPO liberais).
- Backup do Postgres com retenção de 30 dias, restore manual.

---

### 9. Segurança

- HTTPS obrigatório.
- Autenticação baseada em **sessão com cookie httpOnly** (Remix sessions).
- Cookies devem usar flags adequadas:
  - `HttpOnly`
  - `Secure` (em produção)
  - `SameSite` (política a definir em implementação; recomendável Lax/Strict conforme UX)
- Senhas com bcrypt.
- Secrets por `.env` na VPS.
- Sem criptografia em repouso do banco no MVP.
- Sem perfis admin/suporte; apenas usuário final acessa seus próprios dados.
- LGPD:
  - deleção total de conta e dados
  - tratamento de dados pessoais conforme necessidade mínima

---

### 10. Observabilidade

- Logs em texto, armazenados localmente na VPS.
- Sem métricas/monitoramento externo no MVP.
- Sem alertas automáticos no MVP (futuro: Discord).
- Endpoint de health check mínimo.

---

### 11. Manutenibilidade e Testabilidade

- Arquitetura modular (routes/controllers-like em Remix, services, repositories, middlewares/utilitários).
- TDD obrigatório.
- Testes: unitários, integração e E2E.
- Cobertura mínima: 60%.
- Documentação mínima via README.
- Versionamento: v1, v2, etc. (sem exigência de backward compatibility).

---

## PARTE 4: ARQUITETURA E INFRAESTRUTURA

### 12. Arquitetura de Solução

#### 12.1 Componentes (alto nível) — Remix Full Stack

##### (1) Cliente — Navegador (PWA)
**Responsabilidade**
- Renderização da UI e interações do usuário.
- Execução da PWA (instalação, cache de assets).
- Exibição de dados em modo offline **read-only**, usando cache local de dados previamente carregados.

**Persistência local (offline read-only)**
- Cache local de respostas/dados para exibição offline (sem edição).
- Não há escrita offline nem fila de sincronização no MVP.

---

##### (2) Service Worker (PWA)
**Responsabilidade**
- Cache do “app shell” (assets estáticos) para permitir abrir o app offline.
- Cache de dados previamente carregados para visualização offline read-only.
- Fallback “Sem conexão / Dados indisponíveis offline” quando não houver cache.

---

##### (3) Nginx (Host VPS) — TLS + Reverse Proxy
**Responsabilidade**
- Terminação TLS por domínio.
- Reverse proxy para o container do Remix (upstream HTTP).
- Configuração de limites/timeouts para suportar upload de anexos até **500MB**.

---

##### (4) Aplicação Remix (única) — Container Docker
**Responsabilidade**
- SSR e rotas (UI).
- `loaders` (leitura) e `actions` (escrita) como camada de backend.
- Autenticação e autorização via sessão (cookie httpOnly).
- Regras de negócio (contas/categorias/transações/saldo).
- Upload/download de arquivos via endpoints internos:
  - upload passando pelo servidor Remix (multipart/stream),
  - download protegido por sessão.
- Implementar LGPD: deleção total de conta e dados.

---

##### (5) Banco de Dados (PostgreSQL) — Containers separados por ambiente
**Responsabilidade**
- Persistência fonte de verdade.
- Integridade referencial (FKs) e índices.

**Topologia**
- `postgres-prod` (volume próprio).
- `postgres-dev` (volume próprio).

---

##### (6) Storage de Arquivos — Volume Docker montado no host
**Responsabilidade**
- Persistência de anexos (PDF/imagens) em diretório do host montado no container.
- Limite por arquivo: **500MB**.
- Sem backup de anexos no MVP (explicitamente aceito).

---

##### (7) CI/CD (Gitea Pipelines)
**Responsabilidade**
- Build e testes do app Remix.
- Deploy via SSH na VPS e atualização/restart via Docker Compose (dev/prod).

---

#### 12.2 Fluxos principais (alto nível)

**(A) Leitura online**
1. Browser acessa domínio HTTPS → Nginx → Remix.
2. Remix executa loaders e consulta Postgres.
3. PWA pode cachear assets e dados para offline read-only.

**(B) Offline read-only**
1. Usuário abre o app offline (assets via cache do service worker).
2. Exibir dados se existirem no cache; caso contrário, mostrar fallback.
3. Escrita não suportada offline no MVP.

**(C) Upload de anexo (até 500MB)**
1. Usuário autenticado envia arquivo para endpoint Remix via Nginx.
2. Remix valida autenticação, autorização, tamanho e tipo.
3. Remix grava arquivo no volume montado e registra metadados no Postgres.

**(D) Download/visualização de anexo**
1. Usuário autenticado solicita anexo.
2. Remix valida sessão e autorização.
3. Remix faz stream do arquivo.

---

### 13. Infraestrutura

#### 13.1 Ambiente de Hospedagem
- VPS Linux na rede local (self-hosted), com Nginx no host.
- Recursos mínimos: 1 vCPU, 2 GB RAM, disco pequeno.

#### 13.2 Ambientes (Homologação e Produção)
- Dois ambientes isolados por serviços e bancos separados (containers e volumes independentes):
  - `remix-prod` + `postgres-prod`
  - `remix-dev` + `postgres-dev`
- Sem regras de firewall no MVP (trade-off aceito).

#### 13.3 Domínios e TLS
- Produção:
  - `financeiro.viniserver.com.br`
  - `financeiro.viniciustei.com.br`
- Homologação:
  - `dev-financeiro.viniserver.com.br`
  - `dev-financeiro.viniciustei.com.br`
- TLS obrigatório; certificados (ex.: Let’s Encrypt) com renovação via scripts agendados.

#### 13.4 Nginx (Reverse Proxy) e limites para upload
- Nginx faz reverse proxy para os containers Remix.
- Configurações necessárias (a serem implementadas):
  - `client_max_body_size` >= 500MB (recomendável margem acima de 500MB)
  - timeouts de proxy ajustados para uploads longos (ex.: `proxy_read_timeout`, `proxy_send_timeout`)
- Cache HTTP: revalidação sempre (sem caching agressivo no Nginx).

#### 13.5 Deploy e Orquestração
- CI/CD via Gitea Pipelines:
  - SSH na VPS
  - `docker compose pull` / `docker compose up -d` por ambiente
  - reinício controlado dos serviços
- Objetivo: minimizar downtime.
- Operação manual (responsável: ViniciusTei).

#### 13.6 Persistência e Volumes
- Volumes persistentes separados por ambiente:
  - banco (`postgres-prod`, `postgres-dev`)
  - arquivos (volume de anexos montado no host)

#### 13.7 Monitoramento
- Logs locais; scripts agendados (cron) para checks básicos (containers, TLS, housekeeping).

---

### 14. Estratégia de Dados

- Entidades: User, Account, Category, Transaction + anexos (PDF/imagem).
- Retenção: backup do Postgres com retenção de 30 dias.
- LGPD: deleção total de conta e dados.
- Migração: não aplicável (começa em branco).
- Observação: backup inicial cobre apenas Postgres (anexos fora do backup, por decisão do MVP).

---

## PARTE 5: OPERAÇÃO E DEPLOYMENT

### 15. CI/CD e Deployment

- Gitea Pipelines (CI/CD).
- Deploy via SSH:
  - backend/UI: atualizar container Remix via Docker Compose
  - banco: Postgres em container por ambiente
- Ambientes: homologação e produção.
- Rollback: manual no MVP.

---

### 16. Runbooks e Operação

- Operação manual (responsável: ViniciusTei).
- Runbook mínimo no README:
  - como subir ambientes (docker compose)
  - como fazer deploy/rollback
  - como rodar backup/restore do Postgres
  - como checar logs/status
  - como lidar com renovação TLS (scripts)

---

### 17. Disaster Recovery

- Restore manual do banco a partir de backup (30 dias).
- Sem testes regulares de restore definidos no MVP.
- Falhas contempladas: corrupção de dados e indisponibilidade total.
- Falhas envolvendo anexos não cobertas por backup no MVP.

---

## PARTE 6: VIABILIDADE E RISCOS

### 18. Análise de Viabilidade Técnica

- Projeto solo.
- Preferência por build do zero; uso de open source quando necessário.
- Principais riscos: corrupção de dados e dificuldade de UI.

---

### 19. Build vs Buy vs Integrate

- Build-first (do zero) como regra.
- Integrações open source conforme necessidade (gráficos, autenticação/sessão, libs PWA).
- Evitar soluções comerciais no MVP.

---

### 20. Riscos Técnicos e Mitigações

| Risco                 | Probabilidade | Impacto | Mitigação                                      | Contingência           |
|-----------------------|--------------|---------|------------------------------------------------|------------------------|
| Corrupção de dados    | Média        | Alta    | Backup + restore manual                         | Restore do banco       |
| Dificuldade de UI     | Média        | Média   | Iteração contínua / refatoração                 | Ajustes no frontend    |
| Sem alertas           | Alta         | Média   | Aceito no MVP; scripts agendados                | Futuro: Discord        |
| Sem firewall          | Média        | Alta    | TLS + hardening básico                          | Revisar segurança      |
| Upload 500MB          | Média        | Alta    | Streaming + limites/timeouts em Nginx/Remix     | Limitar/expurgar       |
| Offline read-only     | Média        | Baixa   | Fallback claro e cache incremental              | Melhorar cache         |

---

### 21. Dívida Técnica

- Alertas automáticos (Discord) para futuro.
- Backup de anexos fora do escopo inicial.
- Monitoramento/métricas fora do escopo inicial.
- Refinar estratégia de cache offline (workbox/estratégias).

---

## PARTE 7: MÉTRICAS E CUSTOS

### 22. Métricas de Sucesso

- Latência típica: < 2s (CRUD/dashboard).
- Cobertura de testes: ≥ 60%.
- Conformidade LGPD: deleção total implementada.
- Estabilidade: baixa incidência de inconsistências e falhas em upload/download.

---

### 23. TCO (Total Cost of Ownership)

**OPEX**
- VPS: R$ 50/mês
- Servidor em casa: R$ 15/mês
- Domínio: R$ 50/ano

---

## PARTE 8: APÊNDICES

### 24. Glossário
- PWA, LGPD, CRUD, Sessão/Cookie, VPS, SSR, Remix

### 25. Referências
- Remix (loaders/actions/sessions)
- PWA/service worker (estratégias de cache)
- Drizzle + PostgreSQL (migrations, índices)
- Nginx (reverse proxy, limits/timeouts)

### 26. Dúvidas em Aberto
- Estratégia exata de cache de dados (quais rotas/dados entram no cache offline read-only).
- Política de expurgo/limites de armazenamento para anexos.
- Backup de anexos (futuro).
- Alertas automáticos via Discord (futuro).