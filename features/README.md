# Features

Cada subpasta encapsula uma **feature de negócio** completa, seguindo o padrão de organização por domínio (feature-based / vertical slicing).

## Estrutura de uma feature

```
features/
  <nome-da-feature>/
    components/    # componentes específicos da feature (não compartilhados)
    actions/       # Server Actions ("use server")
    services/      # camada de dados / regras de negócio (acesso a Prisma, chamadas externas)
    schemas/       # schemas Zod de validação
    types/         # tipos específicos da feature
```

## Regras

1. **Componentes reutilizáveis** entre features vão em `/components/shared` ou `/components/ui`, nunca aqui.
2. **Schemas Zod** de uma feature ficam em `schemas/`. Reutilizáveis (ex.: `email`, `cpfCnpj`) ficam em `/lib/validation`.
3. **Services** contêm a lógica de negócio e acesso ao banco. **Actions** apenas orquestram (validam com Zod → chamam service → retornam `ActionResult`).
4. **Tipos** derivados de schemas Zod ficam junto com o schema. Tipos genéricos vão em `/types`.

## Features previstas

- `auth/` — autenticação do painel administrativo
- `product/` — catálogo de produtos (listagem, filtros, detalhe)
- `quote/` — sistema de cotação (carrinho + envio de orçamento)

Novas features (categoria, marca, receita, dashboard) serão adicionadas seguindo a mesma estrutura.
