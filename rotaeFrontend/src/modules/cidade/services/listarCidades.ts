import { listarResultadosPaginados } from "@/lib/api";
import type { Cidade } from "@/modules/cidade/types/cidade";


// Exemplo de uso de Proxy, manter cache durante 5 minutos.
const TEMPO_CACHE_CIDADES_MS = 5 * 60 * 1000;

type ListaCidades = (ignorarCache?: boolean) => Promise<Cidade[]>;

const listarCidadesReal: ListaCidades = () =>
  listarResultadosPaginados<Cidade>("/api/v1/cidades/", "Não foi possível listar as cidades.");

function criarProxyDeCache(objetoReal: ListaCidades): ListaCidades {
  let cidadesEmCache: Cidade[] | null = null;
  let validadeCache = 0;
  let carregamento: Promise<Cidade[]> | null = null;

  return async (ignorarCache = false) => {
    if (ignorarCache) {
      cidadesEmCache = null;
      validadeCache = 0;
      carregamento = null;
    } else {
      if (cidadesEmCache && Date.now() < validadeCache) {
        return cidadesEmCache.map((cidade) => ({ ...cidade }));
      }
      if (carregamento) return carregamento.then((cidades) => cidades.map((cidade) => ({ ...cidade })));
    }

    const requisicao = objetoReal();
    carregamento = requisicao;

    try {
      const cidades = await requisicao;
      if (carregamento === requisicao) {
        cidadesEmCache = cidades;
        validadeCache = Date.now() + TEMPO_CACHE_CIDADES_MS;
      }
      return cidades.map((cidade) => ({ ...cidade }));
    } finally {
      if (carregamento === requisicao) carregamento = null;
    }
  };
}

export const listarCidades = criarProxyDeCache(listarCidadesReal);
