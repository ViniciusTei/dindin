Quando um projeto começa pequeno, é comum que **rotas** acumulem responsabilidades: validação, regra de negócio, acesso a dados e UI no mesmo arquivo. Funciona — até o momento em que a duplicação aparece e o acoplamento começa a custar caro.

Este artigo descreve um modelo de organização que funciona bem para projetos como este (React Router com `loader/action`, build com Vite e persistência com Drizzle): **Domain Global + UI por feature + Infra isolada**.

A meta é simples: **rotas finas**, **domínio reutilizável**, e **infra substituível**.

---

## A proposta em uma frase

- **domain**: regras de negócio e contratos (puro TypeScript; sem React, sem Drizzle).
- **`app/features/<feature>/ui`**: componentes React (JSX, hooks, daisyUI).
- **db**: implementação de repositórios e detalhes de banco (Drizzle).
- **routes**: orquestração HTTP (auth, `loader/action`, parse de `FormData`, chamar usecases, montar UI).

---

## Por que manter o **domain global**?

Manter um domain global ajuda quando:

- várias rotas compartilham conceitos (ex.: `Household`, `Ym`, “competência”, permissões, regras de validação);
- o projeto cresce para features diferentes (despesas, categorias, contas, metas) que reutilizam o mesmo vocabulário;
- se quer testes fáceis (domínio puro = testes rápidos, sem banco, sem DOM).

O domínio vira o “núcleo” do sistema. O restante orbita em torno dele.

---

## Estrutura de pastas recomendada

Uma estrutura típica (mantendo o `domain` global) fica assim:

- app
  - `domain/`
    - `months/`
      - `types.ts` (value objects / parsing)
      - `entity.ts` (tipos do domínio)
      - `ports.ts` (interfaces: repositórios/serviços)
      - `usecases/` (regras orquestradas do domínio: criar/listar/etc.)
      - `errors.ts` (erros do domínio, se necessário)
  - `features/`
    - `months/`
      - `ui/`
        - componentes React (tabela, formulário, cards)
      - `view-model.ts` (opcional: adaptação para UI)
  - `db/`
    - `repositories/`
      - `months.repo.server.ts` (implementa `ports.ts` com Drizzle)
  - `auth/`
    - sessão, usuário, household, guards (server-side)
  - `routes/`
    - `months.tsx`
    - setup.tsx
  - `root.tsx`, `routes.ts`, `app.css`…

---

## Fronteiras claras: o que pode importar o quê?

Este é o “mapa de dependências” que mantém o projeto saudável:

### `app/domain/*` (núcleo)
**Pode importar:** apenas TypeScript/JS padrões e outros módulos do próprio domínio.  
**Não pode importar:** React, `react-router`, Drizzle, `db`, `Request`, `FormData`.

> Se tem JSX, hooks, `loader/action` ou SQL, não é domínio.

### `app/db/*` (infra)
**Pode importar:** Drizzle, schema, driver, e tipos do domínio.  
**Não deve importar:** UI.

### `app/features/*/ui/*` (apresentação)
**Pode importar:** React, componentes, CSS/daisyUI, tipos/helpers do domínio (formatadores, tipos).  
**Não deve importar:** Drizzle nem repositórios server-side diretamente.

### `app/routes/*` (orquestração HTTP)
**Pode importar:** `auth`, repositórios, usecases do domínio e componentes UI.  
Aqui é onde `loader/action` vivem.

---

## Exemplo prático: “months” como feature

Um arquivo de rota como months.tsx costuma começar “com tudo dentro”: validação de competência (`YYYY-MM`), regras de criação, e chamadas ao banco.

Na arquitetura proposta, a rota vira um “coordenador”:

1. **Autentica e resolve contexto** (ex.: household atual).
2. **Extrai input** (`FormData`, `params`, querystring).
3. **Chama um usecase** do domínio (`createMonth`, `listMonths`).
4. **Renderiza componentes** da feature (`features/months/ui/*`).

O resultado é previsibilidade:
- a regra “o que é um `Ym` válido?” fica em `domain/months/types.ts`;
- a regra “como criar um month?” fica em `domain/months/usecases/create-month.ts`;
- o “como persistir” fica em `db/repositories/months.repo.server.ts`;
- o “como mostrar” fica em `features/months/ui/MonthsTable.tsx`.

---

## E onde entra o setup.tsx?

setup.tsx é um bom exemplo de rota que **naturalmente** mistura UI e servidor:

- `loader/action` controlam o fluxo de “instalação inicial” (se já existe usuário, redireciona; senão cria admin).
- o componente React exibe o formulário.

Mesmo aqui, a separação ainda ajuda:

- validações e políticas (“setup só pode ocorrer se não houver usuários”) podem virar um **usecase** do domínio (ou um serviço de aplicação);
- `auth/*` permanece como camada server-side;
- a UI do formulário pode ir para `features/setup/ui/*` se o arquivo começar a crescer.

Ou seja: **nem toda rota precisa ser quebrada já**, mas o desenho deixa claro *para onde* mover quando aumentar.

---

## Como isso escala para as próximas rotas (despesas, categorias, contas)

Ao criar uma nova rota, o checklist mental fica estável:

1. **Existe regra de negócio?**  
   → vai para `app/domain/<feature>/usecases/*` e `types.ts`.

2. **Existe persistência?**  
   → cria `app/domain/<feature>/ports.ts` + implementação em `app/db/repositories/*`.

3. **Existe UI reutilizável?**  
   → vai para `app/features/<feature>/ui/*`.

4. **A rota só coordena** (auth + parsing + chamar usecase + render).  
   → fica em `app/routes/<feature>.tsx`.

Isso reduz duplicação e faz cada nova feature “encaixar” no mesmo trilho.

---

## Convenções práticas (que evitam dor depois)

- **Nomeie usecases por verbo**: `createExpense`, `listCategories`, `deleteAccount`.
- **Ports do domínio são pequenos**: evite repositórios “gigantes”; prefira contratos específicos.
- **Domínio deve ser testável sem ambiente**: sem `process.env`, sem relógio global (ou injete dependências quando necessário).
- **Rotas retornam dados já prontos para a UI** (ou use um `view-model.ts` na feature para adaptar).

---

## Resumo

A organização “Domain Global” é uma escolha que favorece longo prazo:

- **Rotas** ficam menores e mais legíveis.
- **Regras** ficam centralizadas e reutilizáveis.
- **Banco** vira detalhe (importante, mas contido).
- **UI** evolui por feature, sem contaminar o núcleo.
