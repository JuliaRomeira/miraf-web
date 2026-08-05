import { SupplierCarousel } from "@/features/catalog/components/supplier-carousel";
import { listActiveSuppliers } from "@/features/catalog/services/catalog-service";

/**
 * Seção "Fornecedores parceiros" da home — vitrine em carrossel infinito das
 * marcas distribuídas pela Mira. Fica logo abaixo do hero e antes de "Compre
 * por segmento": o visitante primeiro entende a proposta e então vê as marcas,
 * reforçando a credibilidade do catálogo.
 *
 * Transição com o hero: em vez de uma faixa separada (que deixava um vão), esta
 * seção é um **card flutuante** que sobe com uma pequena margem negativa
 * (`-mt-4`), criando continuidade visual (sombra + leve sobreposição) sem cobrir
 * a barra de navegação do hero (que fica no rodapé, em `bottom-8`). A invasão
 * foi reduzida de propósito: com o valor antigo (-mt-16/20) o card subia sobre a
 * área da barra de indicadores.
 *
 * Server Component: exibe TODOS os fornecedores ativos (mesmo sem produtos
 * ainda) — decisão da cliente, para um fornecedor recém-cadastrado aparecer na
 * hora. Sem nenhum fornecedor ativo, a seção não renderiza (nada de faixa vazia).
 */
export async function HomeSuppliers(): Promise<React.ReactElement | null> {
  const suppliers = await listActiveSuppliers();

  const featured = suppliers.map((supplier) => ({
    slug: supplier.slug,
    name: supplier.name,
    logoUrl: supplier.logoUrl,
  }));

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="relative z-20 -mt-4 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-[85rem]">
        <div className="border-border/60 rounded-3xl border bg-[#fcfcfc] px-6 py-7 shadow-[0_18px_50px_-28px_rgba(14,44,98,0.3)] lg:px-12 lg:py-8">
          <div className="mb-6 text-center">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-balance sm:text-3xl">
              Fornecedores parceiros
            </h2>
          </div>

          <SupplierCarousel suppliers={featured} />
        </div>
      </div>
    </section>
  );
}
