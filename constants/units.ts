/**
 * Unidades da empresa (matriz e filiais) exibidas na página "Nossas Unidades".
 *
 * Conteúdo institucional estático (decisão da cliente: não gerenciável pelo
 * painel). Para atualizar as unidades, edite apenas o array `COMPANY_UNITS`
 * abaixo — nada mais precisa mudar. O link "Como chegar" é gerado
 * automaticamente a partir do endereço (ver `unit-card.tsx`).
 *
 * ⚠️ O horário de funcionamento (`hours`) abaixo é um EXEMPLO — confirmar o
 * horário real de cada unidade.
 */

export type UnitType = "Matriz" | "Filial";

export interface CompanyUnit {
  /** Identificador estável (usado como key na renderização). */
  readonly id: string;
  readonly type: UnitType;
  /** Logradouro + número, ex.: "Av. das Indústrias, 1500". */
  readonly street: string;
  /** Bairro (opcional). */
  readonly district?: string;
  readonly city: string;
  /** Sigla da UF, ex.: "SP". */
  readonly state: string;
  /** CEP formatado, ex.: "01000-000" (opcional). */
  readonly zipCode?: string;
  /** Telefone formatado para exibição, ex.: "(11) 3000-0000" (opcional). */
  readonly phone?: string;
  /** WhatsApp formatado para exibição, ex.: "(11) 90000-0000" (opcional). */
  readonly whatsapp?: string;
  /** E-mail de contato da unidade (opcional). */
  readonly email?: string;
  /** Horário de funcionamento, ex.: "Seg. a sex., 8h às 18h" (opcional). */
  readonly hours?: string;
}

/**
 * Lista de unidades. A matriz aparece primeiro na página; as demais seguem a
 * ordem deste array.
 */
export const COMPANY_UNITS: readonly CompanyUnit[] = [
  {
    id: "matriz-sjbv",
    type: "Matriz",
    street: "Av. Brasília, 910",
    district: "Vila Zanetti",
    city: "São João da Boa Vista",
    state: "SP",
    zipCode: "13870-590",
    phone: "(19) 3638-2200",
    hours: "Seg. a sex., 8h às 18h",
  },
  {
    id: "filial-ribeirao",
    type: "Filial",
    street: "Rua Dr. Hugo Fortes, 940",
    district: "Parque Industrial Lagoinha",
    city: "Ribeirão Preto",
    state: "SP",
    zipCode: "14095-260",
    phone: "(16) 3628-7505",
    hours: "Seg. a sex., 8h às 18h",
  },
  {
    id: "filial-rio-preto",
    type: "Filial",
    street: "Av. Dr. Aniloel Nazareth, 5700",
    district: "Parque Residencial Comendador Mançor Daud",
    city: "São José do Rio Preto",
    state: "SP",
    zipCode: "15070-585",
    phone: "(17) 3225-6011",
    hours: "Seg. a sex., 8h às 18h",
  },
];
