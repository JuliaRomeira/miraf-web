import { Resend } from "resend";

import { env } from "@/lib/env";
import { getSiteSettings } from "@/features/settings/services/site-settings";
import { SITE_CONFIG } from "@/constants/site";
import { formatCpfCnpj, formatPhone } from "@/utils/format";
import type { CreateQuoteResult } from "@/features/quote/services/quote-service";

/**
 * Envio de e-mails da cotação — DEGRADAÇÃO GRACIOSA.
 *
 * O banco é a fonte da verdade; o e-mail é notificação best-effort. Se o Resend
 * não estiver configurado (ex.: dev) ou o envio falhar, a cotação continua
 * salva e o painel já a mostra — a solicitação nunca se perde. Por isso nada
 * aqui lança: retornamos um relatório e logamos.
 *
 * Destinatário do comercial: prioriza as Settings editáveis pela cliente
 * (`quote_email_recipient` + `quote_email_cc`), com fallback para o env
 * `QUOTE_RECIPIENT_EMAIL`.
 */

export interface QuoteEmailReport {
  readonly configured: boolean;
  readonly teamEmailSent: boolean;
  readonly customerEmailSent: boolean;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderItemsTable(items: CreateQuoteResult["items"]): string {
  const rows = items
    .map((item) => {
      const name = item.flavor
        ? `${escapeHtml(item.name)} <span style="color:#666;">— ${escapeHtml(item.flavor)}</span>`
        : escapeHtml(item.name);
      const code = item.sku ? escapeHtml(item.sku) : "—";
      const qty = item.unit ? `${item.quantity} ${escapeHtml(item.unit)}` : String(item.quantity);
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;white-space:nowrap;color:#666;font-family:monospace;">${code}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap;">${qty}</td>
        </tr>`;
    })
    .join("");

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:8px;">
      <thead>
        <tr>
          <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #ddd;">Código</th>
          <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #ddd;">Produto</th>
          <th style="padding:8px 12px;text-align:right;border-bottom:2px solid #ddd;">Qtd.</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderTeamEmail(quote: CreateQuoteResult): string {
  const documentLabel = quote.documentType;
  const fields: Array<[string, string]> = [
    ["Protocolo", quote.protocol],
    ["Nome", quote.name],
    [documentLabel, formatCpfCnpj(quote.document)],
    ["E-mail", quote.email],
    ["Telefone", formatPhone(quote.phone)],
  ];
  if (quote.company) fields.push(["Empresa", quote.company]);
  if (quote.notes) fields.push(["Observações", quote.notes]);

  const fieldRows = fields
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:4px 12px 4px 0;color:#666;white-space:nowrap;vertical-align:top;">${label}</td>
          <td style="padding:4px 0;font-weight:600;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join("");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:640px;margin:0 auto;">
      <h2 style="margin:0 0 4px;">Nova solicitação de cotação</h2>
      <p style="color:#666;margin:0 0 16px;">Protocolo <strong>${quote.protocol}</strong></p>
      <table style="font-size:14px;border-collapse:collapse;">${fieldRows}</table>
      <h3 style="margin:24px 0 0;">Itens</h3>
      ${renderItemsTable(quote.items)}
    </div>`;
}

function renderCustomerEmail(quote: CreateQuoteResult): string {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:640px;margin:0 auto;">
      <h2 style="margin:0 0 8px;">Recebemos sua solicitação de cotação</h2>
      <p style="margin:0 0 16px;">
        Olá, ${escapeHtml(quote.name)}! Sua solicitação foi recebida e nossa equipe
        comercial entrará em contato em breve.
      </p>
      <p style="margin:0 0 16px;">
        Protocolo: <strong>${quote.protocol}</strong>
      </p>
      <h3 style="margin:24px 0 0;">Produtos solicitados</h3>
      ${renderItemsTable(quote.items)}
      <p style="color:#666;font-size:13px;margin-top:24px;">
        ${escapeHtml(SITE_CONFIG.fullName)} — este é um e-mail automático de confirmação.
      </p>
    </div>`;
}

function splitEmails(value: string): string[] {
  return value
    .split(/[,;]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * Dispara os dois e-mails (comercial + confirmação ao cliente). Nunca lança:
 * qualquer falha é logada e reportada no retorno.
 */
export async function sendQuoteEmails(quote: CreateQuoteResult): Promise<QuoteEmailReport> {
  const report: QuoteEmailReport = {
    configured: false,
    teamEmailSent: false,
    customerEmailSent: false,
  };

  const from = env.RESEND_FROM_EMAIL?.trim();
  if (!env.RESEND_API_KEY || !from) {
    console.warn(
      `[cotação] Resend não configurado — e-mail não enviado (cotação ${quote.protocol} salva no banco).`,
    );
    return report;
  }

  const settings = await getSiteSettings();
  const recipient = settings.quoteEmailRecipient.trim() || env.QUOTE_RECIPIENT_EMAIL?.trim() || "";
  if (!recipient) {
    console.warn(
      `[cotação] Sem destinatário do comercial (Settings/env vazios) — e-mail não enviado (cotação ${quote.protocol} salva).`,
    );
    return report;
  }

  const cc = settings.quoteEmailCc ? splitEmails(settings.quoteEmailCc) : undefined;
  const mutableReport = { ...report, configured: true };
  const resend = new Resend(env.RESEND_API_KEY);

  // E-mail para o comercial.
  try {
    const { error } = await resend.emails.send({
      from,
      to: [recipient],
      ...(cc && cc.length > 0 ? { cc } : {}),
      replyTo: quote.email,
      subject: `Nova cotação ${quote.protocol} — ${quote.name}`,
      html: renderTeamEmail(quote),
    });
    if (error) {
      console.error(`[cotação] Falha ao enviar e-mail ao comercial (${quote.protocol}):`, error);
    } else {
      mutableReport.teamEmailSent = true;
    }
  } catch (error) {
    console.error(`[cotação] Erro inesperado no e-mail ao comercial (${quote.protocol}):`, error);
  }

  // E-mail de confirmação ao cliente (best-effort, independente do anterior).
  try {
    const { error } = await resend.emails.send({
      from,
      to: [quote.email],
      subject: `Recebemos sua cotação — ${quote.protocol}`,
      html: renderCustomerEmail(quote),
    });
    if (error) {
      console.error(`[cotação] Falha ao enviar confirmação ao cliente (${quote.protocol}):`, error);
    } else {
      mutableReport.customerEmailSent = true;
    }
  } catch (error) {
    console.error(
      `[cotação] Erro inesperado na confirmação ao cliente (${quote.protocol}):`,
      error,
    );
  }

  return mutableReport;
}
