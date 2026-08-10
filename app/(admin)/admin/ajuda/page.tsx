import {
  AlertTriangle,
  Building2,
  ClipboardList,
  FolderTree,
  HelpCircle,
  ImageIcon,
  KeyRound,
  type LucideIcon,
  Package,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { getCurrentUser } from "@/features/auth/services/current-user";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StartTourButton } from "@/components/admin/help/start-tour-button";

export const metadata = {
  title: "Ajuda",
};

interface ManualSection {
  readonly id: string;
  readonly title: string;
  readonly icon: LucideIcon;
  readonly adminOnly?: boolean;
  readonly node: React.ReactNode;
}

/**
 * Central de ajuda / manual completo do painel. Conteúdo em linguagem simples,
 * para uma pessoa sem conhecimento técnico. A seção "Dados de acesso" só
 * aparece para administradores.
 */
export default async function AdminHelpPage(): Promise<React.ReactElement> {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "ADMIN";

  const sections: ManualSection[] = [
    {
      id: "acesso",
      title: "Como acessar o painel",
      icon: KeyRound,
      node: (
        <Steps
          items={[
            "Abra o endereço do site e adicione /login ao final (por exemplo: site-da-mira.com.br/login).",
            "Digite o seu e-mail e a sua senha de acesso.",
            'Clique em "Entrar". Você será levado(a) para o painel.',
            'Para sair com segurança ao terminar, clique em "Sair" no canto superior direito.',
          ]}
        />
      ),
    },
    {
      id: "produtos",
      title: "Produtos",
      icon: Package,
      node: (
        <>
          <P>
            É o coração do site. Aqui ficam todos os produtos que aparecem no catálogo. Para
            cadastrar ou alterar um produto:
          </P>
          <Steps
            items={[
              'No menu à esquerda, clique em "Produtos".',
              'Para criar um novo, clique em "Novo produto" (canto superior direito). Para alterar, clique no lápis ao lado do produto na lista.',
              "Na aba Geral, preencha o nome, uma descrição e adicione as fotos do produto (uma delas será a capa).",
              "Na aba Especificações, escolha a categoria, a subcategoria (se houver), o fornecedor, a unidade de venda, o peso e o código, e defina o status.",
              "Na aba Conteúdo, você pode incluir composição, modo de preparo, conservação e a ficha técnica (arquivo em PDF ou imagem).",
              "Se o produto tem sabores/variações, use a aba Variações. Cada variação pode ter foto, código e até tabela nutricional própria.",
              "Na aba Nutrição, preencha a tabela nutricional do produto, quando houver.",
              'Ao terminar, clique em "Salvar". Confira o resultado no site clicando em "Ver site".',
            ]}
          />
          <Tip>
            O <b>status</b> controla o que o cliente vê: <b>Ativo</b> aparece no site,{" "}
            <b>Inativo</b> fica escondido e <b>Rascunho</b> é um cadastro ainda em preparação. Para
            tirar um produto do ar sem apagá-lo, deixe-o Inativo.
          </Tip>
          <P>
            Para <b>excluir</b> um produto, clique na lixeira vermelha e confirme. Se o produto já
            estiver em alguma cotação, o sistema não deixa excluir (para preservar o histórico) —
            nesse caso, deixe-o Inativo.
          </P>
        </>
      ),
    },
    {
      id: "categorias",
      title: "Categorias",
      icon: FolderTree,
      node: (
        <>
          <P>
            As categorias organizam o catálogo e ajudam o cliente a navegar (por exemplo:
            Panificação, Confeitaria). Cada categoria pode ter subcategorias.
          </P>
          <Steps
            items={[
              'No menu, clique em "Categorias".',
              'Clique em "Nova categoria" para criar, ou no lápis para editar uma existente.',
              "Preencha o nome, uma descrição, a imagem (aparece nos destaques da página inicial) e a ordem de exibição.",
              "Ao editar uma categoria, você verá a área de subcategorias: adicione, renomeie, ative/desative ou remova subcategorias ali mesmo.",
              'Clique em "Salvar".',
            ]}
          />
          <P>
            Não é possível excluir uma categoria que ainda tenha produtos ou subcategorias ligados a
            ela. Primeiro mova ou remova esses itens.
          </P>
        </>
      ),
    },
    {
      id: "fornecedores",
      title: "Fornecedores",
      icon: Building2,
      node: (
        <>
          <P>
            São as marcas parceiras exibidas no site (na vitrine de fornecedores e nos filtros do
            catálogo).
          </P>
          <Steps
            items={[
              'No menu, clique em "Fornecedores".',
              'Clique em "Novo fornecedor" para cadastrar, ou no lápis para editar.',
              "Informe o nome, envie o logo, escreva uma breve descrição e defina a ordem de exibição.",
              'Clique em "Salvar".',
            ]}
          />
        </>
      ),
    },
    {
      id: "imagens",
      title: "Imagens e banners",
      icon: ImageIcon,
      node: (
        <>
          <P>As imagens do site são gerenciadas dentro de cada área. Veja onde alterar cada uma:</P>
          <List
            items={[
              <>
                <b>Fotos dos produtos:</b> na aba Geral do produto (e, para variações, dentro de
                cada variação).
              </>,
              <>
                <b>Imagem da categoria:</b> ao editar a categoria — é a imagem que aparece nos
                destaques da página inicial. Cada categoria também tem um campo de banner.
              </>,
              <>
                <b>Logo do fornecedor:</b> ao editar o fornecedor.
              </>,
            ]}
          />
          <Tip>
            Use imagens nítidas e leves (formatos JPG, PNG ou WEBP). Fotos de produto ficam melhores
            recortadas e centralizadas no item.
          </Tip>
          <P>
            O <b>banner principal da página inicial</b> (aquele grande, no topo do site) é fixo e
            faz parte do desenvolvimento do site — para alterá-lo, fale com o suporte técnico. Ele
            não é editado pelo painel.
          </P>
        </>
      ),
    },
    {
      id: "cotacoes",
      title: "Cotações",
      icon: ClipboardList,
      node: (
        <>
          <P>
            São os pedidos de orçamento que os clientes enviam pelo site. O site não vende direto —
            o objetivo é receber essas solicitações.
          </P>
          <Steps
            items={[
              'No menu, clique em "Cotações".',
              "Use os filtros por status (Pendente, Em atendimento, Concluída, Cancelada) para encontrar o que precisa.",
              "Clique no olho para abrir os detalhes: dados de quem pediu (nome, contato, documento) e a lista de itens solicitados.",
              "No painel de atendimento, mude o status conforme o andamento e defina o responsável pela cotação.",
              'As alterações são gravadas ao clicar em "Salvar".',
            ]}
          />
          <Tip>
            O número da cotação (por exemplo, ORC-000123) é o protocolo — use-o para se referir a um
            pedido específico ao falar com o cliente.
          </Tip>
        </>
      ),
    },
    {
      id: "usuarios",
      title: "Usuários",
      icon: Users,
      adminOnly: true,
      node: (
        <>
          <P>
            Controla quem pode entrar no painel. Disponível apenas para administradores.
          </P>
          <Steps
            items={[
              'No menu, clique em "Usuários".',
              'Clique em "Novo usuário" para dar acesso a alguém, ou no lápis para editar.',
              "Preencha nome, e-mail, defina a senha e escolha o papel: Administrador (acesso total) ou Editor (gerencia catálogo e cotações, sem usuários e configurações).",
              "Para bloquear o acesso de alguém sem apagar o cadastro, desmarque a opção Ativo.",
            ]}
          />
          <P>
            Por segurança, o sistema não deixa você excluir a própria conta nem remover o último
            administrador ativo.
          </P>
        </>
      ),
    },
    {
      id: "configuracoes",
      title: "Configurações",
      icon: Settings,
      adminOnly: true,
      node: (
        <>
          <P>
            Informações de contato do site. Disponível apenas para administradores. Ao salvar, as
            mudanças aparecem no site na hora (rodapé, contato, etc.).
          </P>
          <List
            items={[
              "Contato: e-mail, telefone, WhatsApp e endereço.",
              "Redes sociais: links do Instagram e Facebook.",
              "E-mails de cotação: para quais endereços as solicitações recebidas são enviadas.",
            ]}
          />
        </>
      ),
    },
    {
      id: "faq",
      title: "Dúvidas frequentes",
      icon: HelpCircle,
      node: (
        <div className="space-y-4">
          <Faq
            q="Cadastrei/alterei um produto e não vejo no site. E agora?"
            a='Confira se o status do produto está como "Ativo". Depois, atualize a página do site (o navegador pode estar mostrando uma versão antiga).'
          />
          <Faq
            q="Não consigo excluir uma categoria ou um produto."
            a="Isso é uma proteção: categorias com produtos/subcategorias e produtos que já estão em cotações não podem ser excluídos. Remova os vínculos ou, no caso de produtos, deixe-os Inativos."
          />
          <Faq
            q="A imagem não sobe / dá erro ao enviar."
            a="Use imagens em JPG, PNG ou WEBP e evite arquivos muito grandes. Se persistir, tente uma imagem menor."
          />
          <Faq
            q="Esqueci minha senha."
            a="Peça a um administrador para criar uma nova senha para você na área de Usuários."
          />
        </div>
      ),
    },
    {
      id: "credenciais",
      title: "Dados de acesso",
      icon: ShieldCheck,
      adminOnly: true,
      node: (
        <>
          <P>Dados para entrar no painel (visível apenas para administradores):</P>
          <div className="border-border bg-muted/40 space-y-2 rounded-lg border p-4 text-sm">
            <p>
              <span className="text-muted-foreground">Endereço:</span>{" "}
              <span className="font-medium">endereço do site + /login</span>
            </p>
            <p>
              <span className="text-muted-foreground">Login (e-mail):</span>{" "}
              <span className="font-mono font-medium">admin@miraf.com.br</span>
            </p>
            <p>
              <span className="text-muted-foreground">Senha inicial:</span>{" "}
              <span className="font-mono font-medium">Miraf@2026</span>
            </p>
          </div>
          <Tip>
            Essa é a senha padrão criada na instalação. Se ela já foi trocada, use a senha atual. Por
            segurança, recomendamos alterar a senha padrão após o primeiro acesso e nunca
            compartilhá-la.
          </Tip>
        </>
      ),
    },
    {
      id: "cuidados",
      title: "Cuidados importantes",
      icon: AlertTriangle,
      node: (
        <List
          items={[
            "Confira as informações antes de salvar.",
            "Não exclua produtos ou informações sem ter certeza.",
            "Use imagens adequadas e otimizadas (nítidas e leves).",
            'Depois de mudanças importantes, confira o site público (botão "Ver site").',
            "Não compartilhe suas credenciais de administrador.",
            "Evite alterar informações que você não conhece.",
            "Em caso de dúvida sobre alguma função, volte a esta central de ajuda.",
          ]}
        />
      ),
    },
  ];

  const visibleSections = sections.filter((s) => !s.adminOnly || isAdmin);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Central de ajuda"
        description="Aprenda a usar o painel passo a passo. Escrito de forma simples, sem termos técnicos."
      >
        <StartTourButton />
      </AdminPageHeader>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Índice */}
        <nav aria-label="Índice do manual" className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Conteúdo
          </p>
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {visibleSections.map(({ id, title, icon: Icon }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="text-muted-foreground hover:bg-accent hover:text-primary flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors"
                >
                  <Icon className="size-4 shrink-0" />
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Seções */}
        <div className="min-w-0 space-y-6">
          {visibleSections.map(({ id, title, icon: Icon, node }) => (
            <section
              key={id}
              id={id}
              className="bg-card shadow-soft scroll-mt-24 rounded-xl border p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="bg-accent text-primary flex size-9 items-center justify-center rounded-lg">
                  <Icon className="size-5" />
                </span>
                <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
              </div>
              <div className="text-sm leading-relaxed">{node}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -- Blocos auxiliares de conteúdo (apresentacionais) -- */

function P({ children }: { children: React.ReactNode }): React.ReactElement {
  return <p className="text-muted-foreground mb-3 last:mb-0">{children}</p>;
}

function Steps({ items }: { items: readonly React.ReactNode[] }): React.ReactElement {
  return (
    <ol className="mb-3 list-decimal space-y-1.5 pl-5 last:mb-0 marker:font-semibold marker:text-primary/70">
      {items.map((item, i) => (
        <li key={i} className="text-muted-foreground pl-1">
          {item}
        </li>
      ))}
    </ol>
  );
}

function List({ items }: { items: readonly React.ReactNode[] }): React.ReactElement {
  return (
    <ul className="mb-3 list-disc space-y-1.5 pl-5 last:mb-0 marker:text-primary/50">
      {items.map((item, i) => (
        <li key={i} className="text-muted-foreground pl-1">
          {item}
        </li>
      ))}
    </ul>
  );
}

function Tip({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="border-primary/20 bg-accent/50 text-foreground/80 my-3 rounded-lg border p-3 text-sm">
      <span className="text-primary font-semibold">Dica: </span>
      {children}
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }): React.ReactElement {
  return (
    <div>
      <p className="text-foreground font-medium">{q}</p>
      <p className="text-muted-foreground mt-0.5">{a}</p>
    </div>
  );
}
