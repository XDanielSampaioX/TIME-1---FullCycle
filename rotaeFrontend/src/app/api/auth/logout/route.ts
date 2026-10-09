import { NextRequest, NextResponse } from "next/server";
import { autenticarNoBackend, origemPermitida } from "@/modules/autenticacao/server/backendAuth";
import { COOKIE_REFRESH, limparTokens } from "@/modules/autenticacao/server/cookiesSessao";

export async function POST(request: NextRequest) {
  if (!origemPermitida(request)) return NextResponse.json({ detail: "Origem inválida." }, { status: 403 });
  const refresh = request.cookies.get(COOKIE_REFRESH)?.value;
  if (refresh) {
    try {
      // A rota de revogação está em outro PR; 404 é tolerado até sua integração.
      await autenticarNoBackend("/api/v1/auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh }),
      });
    } catch {
      // Mesmo se o backend estiver indisponível, a sessão deste navegador termina.
    }
  }
  const resposta = new NextResponse(null, { status: 204 });
  limparTokens(resposta);
  return resposta;
}
