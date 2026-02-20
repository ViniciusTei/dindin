# Plan: Web App de Despesas (Remix + Postgres)

Este projeto substitui a planilha mensal por um web app simples (MVP) para registrar rendas e despesas por competência, aplicar rateio com default proporcional à renda e gerar o acerto mensal. O app roda em servidor Linux na rede interna, com Postgres local e processo Node gerenciado por PM2. Sem testes automatizados e sem ambiente de staging; validação será manual com checklist antes de cada deploy.

## Decisões já alinhadas

- Framework: Remix (TypeScript)
- Banco: Postgres
- ORM/migrações: Drizzle (drizzle-orm) + drizzle-kit
- Deploy: servidor Linux on-prem na rede interna; Node + PM2; Postgres instalado
- Rede: HTTP apenas (rede interna)
- Backup automático: não (decisão consciente)
- MVP: 2 membros no mesmo household; rendas visíveis para ambos; convite por link (sem e-mail)
- Checkbox “pago”: informativo (não influencia rateio nem acerto)
- Mês fechado: existe e bloqueia edições
- Categorias: entram no MVP
- Exportação: CSV entra no MVP

## Escopo do MVP

- Autenticação local (usuário/senha), com admin criando contas.
- Household (grupo) com 2 membros e convite via link para a segunda pessoa entrar.
- Mês (competência) com status aberto/fechado.
- Cadastro de renda por membro por mês.
- Cadastro de despesas com categoria e status simples de “pago”.
- Cálculo do total do mês e rateio proporcional à renda (default), com arredondamento consistente.
- Acerto mensal com transferências sugeridas e marcação de concluído.
- Exportação CSV (por mês).

## Fora do escopo (por agora)

- Despesas individuais separadas do rateio (somente compartilhadas no MVP).
- Parcelamento, recorrências, anexos/comprovantes.
- Relatórios avançados, gráficos, metas, orçamento.
- Integração com banco/cartão, importação automática de planilha.
- Multi-household por usuário e suporte a mais de 2 membros.
- HTTPS, staging, testes automatizados, backup automático.

## Requisitos Funcionais (RF)

### RF-01 Autenticação local

- Usuário faz login com usuário/senha.
- Sessão persistente (cookie httpOnly), logout.
- Admin consegue criar usuários.

### RF-02 Household compartilhado (2 pessoas) + convite por link

- Existe um household.
- Um membro gera um link de convite.
- Outro usuário autenticado acessa o link e entra no household.
- Link expira e/ou é de uso único (definir política no design técnico).

### RF-03 Gestão de meses (competência)

- Criar mês (ex.: 2026-02).
- Listar meses existentes.
- Abrir um mês para edição e visualização.

### RF-04 Fechamento de mês

- Mês “aberto”: permite editar renda e despesas.
- Mês “fechado”: bloqueia edições.
- Ao fechar, o sistema exibe o resumo do acerto do mês.

### RF-05 Renda por membro por mês

- Para cada mês, registrar renda de cada membro.
- Se a renda estiver faltando, permitir fechar o mês mesmo assim e exibir o valor negativo no fechamento (saldo pode ficar “estranho”, mas é esperado).

### RF-06 Despesas com categorias (CRUD)

- Criar/editar/excluir despesa no mês com: descrição, categoria, valor, data opcional, status “pago”.
- Listar despesas do mês com totalização.

### RF-07 Cálculo do rateio proporcional (default)

- Calcular participação de cada membro proporcional à renda do mês.
- Arredondamento determinístico em centavos, garantindo que a soma das partes feche exatamente o total do mês.

### RF-08 Resumo do mês

- Exibir: total de despesas do mês, total por categoria e quanto cabe a cada membro (devido).

### RF-09 Acerto mensal (transferências)

- Calcular saldo por membro e gerar transferências sugeridas.
- Permitir marcar transferência como concluída (data opcional).

### RF-10 Exportação CSV

- Exportar CSV do mês contendo rendas, despesas e transferências.
- Formato estável para reimportação futura (mesmo que não exista importação no MVP).

## Requisitos Não-Funcionais (RNF)

- Segurança mínima: sessão segura (cookie httpOnly), senha com hashing forte, autorização por household.
- Integridade: validações server-side; mês fechado bloqueia edição; arredondamento consistente.
- Responsividade: uso confortável no celular e PC.
- Performance: consultas indexadas por household+mês.
- Observabilidade mínima: logs de erros e ações críticas.

## Regras de Negócio

- Rateio proporcional à renda do mês.
- Renda faltando: fechamento permitido; resumo pode mostrar valores negativos.
- Checkbox “pago”: somente informativo.

## Design Técnico (Remix + Postgres)

- Remix (SSR) com TypeScript.
- Postgres local (servidor Linux on-prem).
- ORM/migrações: Drizzle (drizzle-orm) + drizzle-kit.
- Validação: Zod no servidor.
- Sessões: cookie session do Remix + armazenamento de sessão no Postgres (para invalidar quando necessário).

## Tarefas (título + descrição)

1. Fundar repositório e padrões
   - Criar projeto Remix com TypeScript, estrutura de rotas base e convenções.

2. Configurar Drizzle e estratégia de migração
   - Configurar drizzle-orm + drizzle-kit, conexão com Postgres e política de migrações.

3. Modelar schema do banco (MVP)
   - Implementar tabelas do modelo MVP e índices essenciais via Drizzle + migrações.

4. Implementar autenticação local
   - Login/logout, criação de usuários pelo admin e hashing de senha.

5. Implementar sessão e autorização por household
   - Guard central para bloquear acesso indevido.

6. Convite via link
   - Gerar token com expiração e uso único; aceitar convite.

7. Meses (competência)
   - Listar, criar e navegar para mês.

8. Rendas por mês
   - Registrar/editar rendas dos 2 membros; validações.

9. Categorias
   - Seed de categorias e uso nas despesas; (opcional) CRUD simples.

10. Despesas (CRUD)
   - Formulário rápido, lista, edição e exclusão; bloquear em mês fechado.

11. Motor de cálculo do rateio
   - Funções puras com arredondamento determinístico.

12. Resumo do mês
   - Total, por categoria e parcelas por membro.

13. Acerto mensal (transferências)
   - Gerar transferências e marcar como concluídas.

14. Fechamento de mês
   - Fechar mês e bloquear edições.

15. Exportação CSV
   - Exportar rendas, despesas e transferências.

16. Deploy (PM2) e documentação
   - Passo-a-passo para Linux on-prem.

17. Checklist de validação manual (pré-deploy)
   - Roteiro rápido sem testes automatizados.
