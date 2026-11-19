import { Skeleton } from "@/shared/components/Skeleton";
import { DivisorBilhete } from "@/modules/reserva/components/DivisorBilhete";
import { TrajetoDoBilhete } from "@/modules/reserva/components/TrajetoDoBilhete";

// Uma linha de texto que ainda não chegou: "1lh" é a altura da linha da tag em volta,
// então o esqueleto ocupa o mesmo espaço que o texto vai ocupar.
function Linha({ largura }: { largura: string }) {
  return <Skeleton largura={largura} altura="1lh" />;
}

// O formato do bilhete enquanto a passagem carrega, para a tela não ficar vazia ao trocar de página.
// Segue a mesma marcação do BilhetePassagem (tags, trajeto e divisores) para ter o mesmo tamanho.
export function BilhetePassagemSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Carregando bilhete…</span>
      <div className="reserva-bilhete" aria-hidden="true">
        <div className="reserva-bilhete-topo">
          <strong>BILHETE DIGITAL EMITIDO</strong>
          <span><Linha largura="7rem" /></span>
        </div>
        <div className="reserva-bilhete-corpo">
          <div className="reserva-bilhete-rota">
            <div>
              <small><Linha largura="4rem" /></small>
              <strong><Linha largura="8rem" /></strong>
              <time><Linha largura="6rem" /></time>
            </div>
            <TrajetoDoBilhete />
            <div>
              <small><Linha largura="4rem" /></small>
              <strong><Linha largura="8rem" /></strong>
              <time><Linha largura="6rem" /></time>
            </div>
          </div>
          <DivisorBilhete />
          <dl className="reserva-bilhete-dados">
            <div>
              <dt><Linha largura="5rem" /></dt>
              <dd><Linha largura="9rem" /></dd>
            </div>
            <div>
              <dt><Linha largura="4rem" /></dt>
              <dd><Linha largura="2rem" /></dd>
            </div>
          </dl>
          <DivisorBilhete />
          <div className="reserva-bilhete-embarque">
            <div>
              <Skeleton largura="108px" altura="108px" />
            </div>
            <p>
              <strong><Linha largura="14rem" /></strong>
              <span><Linha largura="18rem" /></span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
