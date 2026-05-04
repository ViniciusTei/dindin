# Design: HouseholdContextBar — Contexto de Rateio no Mobile

## Problema

Na versão mobile, o usuário não tem como saber qual rateio está ativo, trocar de rateio, ou navegar entre as seções de um rateio (Visão geral, Transações, Categorias etc.). Essa funcionalidade existe no desktop via sidebar, mas o `MobileBottomNav` não expõe contexto de rateio.

## Solução

Criar um componente `HouseholdContextBar` que aparece **somente no mobile** (`md:hidden`) no topo do conteúdo das páginas de rateio. Ele mostra o nome do rateio ativo (com link para `/households`) e abas de sub-navegação com scroll horizontal.

## Escopo

### In scope

- Novo componente `HouseholdContextBar`
- Integração nas 5 rotas de household existentes
- Ajuste mínimo nos loaders que não expõem `{ householdId, name, role }` ainda

### Out of scope

- Trocar o rateio ativo inline (usuário vai para `/households` e escolhe lá)
- Alterações no `MobileBottomNav`
- Alterações no `AppShell` ou no grid de layout
- Versão desktop (barra fica oculta com `md:hidden`)

## Componente: `HouseholdContextBar`

**Localização:** `app/domain/households/ui/HouseholdContextBar.tsx`

**Props:**
```ts
{
  household: {
    householdId: string;
    name: string;
    role: "admin" | "member";
  };
}
```

**Comportamento:**
- Usa `useLocation()` internamente para determinar qual aba está ativa
- Nome do rateio é um `<Link to="/households">` — navega para a lista de rateios
- Abas são `<Link>` normais — sem estado local, sem JS extra além do routing
- `md:hidden` garante invisibilidade no desktop (zero impacto)

**Abas exibidas:**

| Aba | Rota | Visibilidade |
|-----|------|-------------|
| Visão geral | `/households/:id` | Sempre |
| Transações | `/households/:id/transactions` | Sempre |
| Categorias | `/households/:id/categories` | Sempre |
| Convites | `/households/:id/invite` | Apenas admin |
| Membros e gestão | `/households/:id/manage` | Apenas admin |

**Aba ativa:** determinada por `currentPath.startsWith(tabPath)`, com exceção da aba "Visão geral" que usa match exato em `/households/:id` para não colidir com sub-rotas.

## Integração nas rotas

### Rotas que já têm dados suficientes

- `households.$householdId.tsx` — retorna `{ household }` completo
- `households.$householdId.manage.tsx` — retorna `{ household, origin }`

### Rotas que precisam de ajuste no loader

`requireHouseholdAccess()` já retorna `{ householdId, name, role }` — sem query extra.
Basta capturar o retorno e incluí-lo no return do loader:

- `households.$householdId.transactions.tsx` → adicionar `householdContext: { householdId, name, role }`
- `households.$householdId.categories.tsx` → idem
- `households.$householdId.invite.tsx` → idem

### Ajuste nas páginas de UI

Cada página de UI recebe um prop `household: { householdId, name, role }` e renderiza `<HouseholdContextBar household={...} />` no topo, antes do conteúdo existente.

- `HouseholdDetailsPage.tsx` — já tem `household` via prop
- `TransactionsPage.tsx` — recebe `householdContext` adicional
- Página de categorias — recebe `householdContext` adicional
- Página de convites — recebe `householdContext` adicional
- `HouseholdManagePage.tsx` — já tem `household` via prop

## Estrutura visual (mobile)

```
┌─────────────────────────────────────────┐
│ 🏠 Casa do João          [link → /households]│
├──────────────────────────────────────────┤
│ [Visão geral] [Transações] [Categorias] ···│  ← scroll horizontal
└──────────────────────────────────────────┘
[conteúdo da página]
```

A barra fica no topo da área de conteúdo (não sticky em relação ao viewport — rola com a página).

## Impacto em testes

- Criar testes unitários para `HouseholdContextBar` (renderização, aba ativa, visibilidade das abas admin)
- Ajustar testes existentes das páginas de UI que receberão o novo prop `household`
