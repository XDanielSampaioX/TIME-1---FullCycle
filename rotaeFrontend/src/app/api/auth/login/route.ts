import { NextResponse } from "next/server";
import { autenticarNoBackend, origemPermitida, tokensValidos } from "@/modules/autenticacao/server/backendAuth";
import { salvarTokens } from "@/modules/autenticacao/server/cookiesSessao";
import type { TokenUser } from "@/modules/autenticacao/types/tokenUser";
import type { LoginUsuarioPayload } from "@/modules/autenticacao/types/loginUsuarioPayload";

export async function POST(request: Request) {
  if (!origemPermitida(request)) return NextResponse.json({ detail: "Origem inválida." }, { status: 403 });

  const dados: unknown = await request.json().catch(() => null);
  if (!dados || typeof dados !== "object") {
    return NextResponse.json({ detail: "Informe e-mail e senha." }, { status: 400 });
  }
  const { email, senha } = dados as LoginUsuarioPayload;
  if (typeof email !== "string" || typeof senha !== "string") {
    return NextResponse.json({ detail: "Informe e-mail e senha." }, { status: 400 });
  }

  try {
    const backend = await autenticarNoBackend("/api/v1/auth/login/", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
    if (!backend.ok) {
      if (backend.status === 400 || backend.status === 401) {
        return NextResponse.json({ detail: "E-mail ou senha inválidos." }, { status: 401 });
      }
      return NextResponse.json({ detail: "O serviço de login está indisponível." }, { status: 502 });
    }
    const corpo: unknown = await backend.json();
    if (!tokensValidos(corpo) || !('user' in corpo) || !corpo.user) {
      return NextResponse.json({ detail: "Resposta inválida do servidor." }, { status: 502 });
    }
    const sessao = corpo as TokenUser;
    const resposta = NextResponse.json(sessao.user);
    salvarTokens(resposta, sessao);
    return resposta;
  } catch {
    return NextResponse.json({ detail: "O serviço de login está indisponível." }, { status: 502 });
  }
}
