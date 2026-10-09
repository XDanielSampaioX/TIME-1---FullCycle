import type { NextResponse } from "next/server";
import type { TokensSessao } from "@/modules/autenticacao/types/tokenUser";

export const COOKIE_ACCESS = "rotae_access";
export const COOKIE_REFRESH = "rotae_refresh";

const opcoes = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export function salvarTokens(resposta: NextResponse, tokens: TokensSessao) {
  resposta.cookies.set(COOKIE_ACCESS, tokens.access, { ...opcoes, maxAge: 60 * 60 });
  resposta.cookies.set(COOKIE_REFRESH, tokens.refresh, { ...opcoes, maxAge: 7 * 24 * 60 * 60 });
}

export function limparTokens(resposta: NextResponse) {
  resposta.cookies.set(COOKIE_ACCESS, "", { ...opcoes, maxAge: 0 });
  resposta.cookies.set(COOKIE_REFRESH, "", { ...opcoes, maxAge: 0 });
}
