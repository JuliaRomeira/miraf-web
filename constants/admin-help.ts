import {
  Building2,
  ClipboardList,
  FolderTree,
  HelpCircle,
  ImageIcon,
  type LucideIcon,
  Package,
} from "lucide-react";

import { type AdminRole } from "@/constants/navigation";

/**
 * Conteúdo do sistema de ajuda do painel — escrito em linguagem simples, para
 * uma pessoa sem conhecimento técnico. Fonte única usada pela central de ajuda
 * (topbar), pelo manual completo (`/admin/ajuda`) e pelo tour interativo.
 */

/** Atalhos exibidos na central de ajuda (topbar) — levam a âncoras do manual. */
export interface HelpTopic {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
}

export const HELP_TOPICS: readonly HelpTopic[] = [
  { id: "produtos", label: "Produtos", icon: Package },
  { id: "categorias", label: "Categorias", icon: FolderTree },
  { id: "fornecedores", label: "Fornecedores", icon: Building2 },
  { id: "imagens", label: "Imagens e banners", icon: ImageIcon },
  { id: "cotacoes", label: "Cotações", icon: ClipboardList },
  { id: "faq", label: "Dúvidas frequentes", icon: HelpCircle },
];

/**
 * Um passo do tour interativo. `target` é o valor de `data-tour` do elemento a
 * destacar (quando ausente, o passo aparece centralizado, sem apontar para
 * nada — usado na abertura/encerramento e como fallback no mobile).
 */
export interface TourStep {
  readonly target?: string;
  readonly title: string;
  readonly body: string;
}

/**
 * Passos do tour, adaptados ao papel do usuário (EDITOR não vê Usuários nem
 * Configurações, então esses passos são omitidos para ele).
 */
export function buildTourSteps(role: AdminRole): readonly TourStep[] {
  const steps: TourStep[] = [
    {
      title: "Vamos dar uma volta pelo painel 👋",
      body: "Em menos de um minuto você vai conhecer as principais áreas. Use os botões abaixo para avançar ou voltar. Você pode parar quando quiser.",
    },
    {
      target: "dashboard",
      title: "Início (Dashboard)",
      body: "É a primeira tela ao entrar. Mostra um resumo rápido: quantas cotações estão esperando atendimento, quantos produtos estão no ar e atalhos para as tarefas do dia a dia.",
    },
    {
      target: "produtos",
      title: "Produtos",
      body: "O coração do catálogo. Aqui você cadastra novos produtos, edita os existentes, adiciona fotos, define a categoria e o fornecedor, e pode criar variações (sabores) e a tabela nutricional.",
    },
    {
      target: "categorias",
      title: "Categorias",
      body: "Organizam o catálogo. Cada categoria pode ter subcategorias e uma imagem que aparece na página inicial. É por elas que o cliente navega no site.",
    },
    {
      target: "fornecedores",
      title: "Fornecedores",
      body: "As marcas parceiras da Mira. Você cadastra o nome, o logo e a ordem em que aparecem na vitrine de fornecedores do site.",
    },
    {
      target: "cotacoes",
      title: "Cotações",
      body: "As solicitações de orçamento enviadas pelos clientes. Aqui você vê os dados de quem pediu, os itens solicitados, e acompanha o andamento mudando o status e definindo o responsável.",
    },
  ];

  if (role === "ADMIN") {
    steps.push(
      {
        target: "usuarios",
        title: "Usuários",
        body: "Controla quem pode entrar no painel. Você pode criar novos acessos (administrador ou editor), editar e desativar. Disponível apenas para administradores.",
      },
      {
        target: "configuracoes",
        title: "Configurações",
        body: "Dados de contato do site: telefone, e-mail, endereço, redes sociais e para quais e-mails as cotações são enviadas. Disponível apenas para administradores.",
      },
    );
  }

  steps.push({
    target: "help",
    title: "Precisou de ajuda? É aqui 📖",
    body: "Este botão de ajuda fica sempre disponível no topo. Por ele você abre este tour de novo, consulta explicações de cada área e o manual completo do painel.",
  });

  steps.push({
    title: "Pronto! Você está por dentro 🎉",
    body: "Sempre que tiver dúvida, é só clicar no botão de ajuda (?) lá em cima. Bom trabalho!",
  });

  return steps;
}
