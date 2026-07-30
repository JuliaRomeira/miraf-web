import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import {
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MB,
  allowedLabelForFolder,
  allowedTypesForFolder,
  isValidUploadFolder,
  uploadImage,
} from "@/lib/storage";

/**
 * Endpoint de upload do painel administrativo (imagens e, na pasta "documents",
 * também PDF da ficha técnica).
 *
 * Protegido por autenticação. Valida destino (pasta), formato (por pasta) e
 * tamanho no servidor, grava no armazenamento local (VPS) e retorna apenas o
 * caminho gerado — que é o que o formulário salva no banco.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  // Rate limit por IP: teto folgado (uploads legítimos de galeria enviam vários
  // arquivos), mas impede que uma sessão encha o disco da VPS em rajada.
  const ip = await getClientIp();
  const rate = consumeRateLimit(`upload:${ip}`, { limit: 40, windowMs: 60_000 });
  if (rate.limited) {
    return NextResponse.json(
      { error: `Muitos envios em sequência. Tente novamente em ${rate.retryAfterSeconds}s.` },
      { status: 429 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }

  const folder = formData.get("folder");
  if (!isValidUploadFolder(folder)) {
    return NextResponse.json({ error: "Destino de upload inválido." }, { status: 400 });
  }

  if (!allowedTypesForFolder(folder).includes(file.type)) {
    return NextResponse.json(
      { error: `Formato não suportado. Use ${allowedLabelForFolder(folder)}.` },
      { status: 400 },
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: `Arquivo muito grande (máximo ${MAX_IMAGE_MB} MB).` },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadImage({ buffer, mimeType: file.type, folder });
    return NextResponse.json({ url: result.path });
  } catch (error) {
    console.error("Falha no upload de imagem:", error);
    return NextResponse.json({ error: "Falha ao processar o upload." }, { status: 500 });
  }
}
