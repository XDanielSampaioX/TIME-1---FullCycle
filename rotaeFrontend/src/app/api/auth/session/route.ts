import { NextRequest, NextResponse } from "next/server";
import { autenticarNoBackend, tokensValidos } from "@/modules/autenticacao/server/backendAuth";
import { COOKIE_ACCESS, COOKIE_REFRESH, limparTokens, salvarTokens } from "@/modules/autenticacao/server/cookiesSessao";
import type { TokensSessao } from "@/modules/autenticacao/types/tokenUser";

async function buscarPerfil(access: string) {
  return autenticarNoBackend("/api/v1/me/", { headers: { Authorization: `Bearer ${access}` } });
}

function naoAutenticado() {
  const resposta = NextResponse.json({ detail: "Sessão expirada." }, { status: 401 });
  limparTokens(resposta);
  return resposta;
}

export async function GET(request: NextRequest) {
  const access = request.cookies.get(COOKIE_ACCESS)?.value;
  const refresh = request.cookies.get(COOKIE_REFRESH)?.value;
  if (!access && !refresh) return naoAutenticado();

  let tokensRenovados: TokensSessao | null = null;
  try {
    if (access) {
      const perfil = await buscarPerfil(access);
      if (perfil.ok) return NextResponse.json(await perfil.json());
      if (perfil.status !== 401) {
        return NextResponse.json({ detail: "Não foi possível consultar sua conta." }, { status: 502 });
      }
    }

    if (!refresh) return naoAutenticado();
    const renovacao = await autenticarNoBackend("/api/v1/auth/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh }),
    });
    if (renovacao.status === 401 || renovacao.status === 400) return naoAutenticado();
    if (!renovacao.ok) return NextResponse.json({ detail: "Não foi possível renovar a sessão." }, { status: 502 });

    const tokens: unknown = await renovacao.json();
    if (!tokensValidos(tokens)) return naoAutenticado();
    tokensRenovados = tokens;
    const perfil = await buscarPerfil(tokens.access);
    if (!perfil.ok) {
      if (perfil.status === 401) return naoAutenticado();
      const erro = NextResponse.json({ detail: "Não foi possível consultar sua conta." }, { status: 502 });
      salvarTokens(erro, tokens);
      return erro;
    }

    const resposta = NextResponse.json(await perfil.json());
    salvarTokens(resposta, tokens);
    return resposta;
  } catch {
    const erro = NextResponse.json({ detail: "O serviço de autenticação está indisponível." }, { status: 502 });
    if (tokensRenovados) salvarTokens(erro, tokensRenovados);
    return erro;
  }
}
