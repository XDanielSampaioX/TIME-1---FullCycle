import { Skeleton } from "@/shared/components/Skeleton";

// O formato do bilhete enquanto a passagem carrega, para a tela não ficar vazia ao trocar de página.
export function BilhetePassagemSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Carregando bilhete…</span>
      <div className="reserva-bilhete" aria-hidden="true">
        <div className="reserva-bilhete-topo">
          <strong>BILHETE DIGITAL EMITIDO</strong>
          <Skeleton largura="7rem" />
        </div>
        <div className="reserva-bilhete-corpo">
          <div className="reserva-bilhete-rota">
            <div>
              <Skeleton largura="4rem" altura=".75rem" />
              <Skeleton largura="8rem" altura="1.25rem" />
              <Skeleton largura="6rem" altura=".875rem" />
            </div>
            <div>
              <Skeleton largura="4rem" altura=".75rem" />
              <Skeleton largura="8rem" altura="1.25rem" />
              <Skeleton largura="6rem" altura=".875rem" />
            </div>
          </div>
          <div className="reserva-bilhete-dados">
            <div>
              <Skeleton largura="5rem" altura=".75rem" />
              <Skeleton largura="9rem" altura="1.25rem" />
            </div>
            <div>
              <Skeleton largura="4rem" altura=".75rem" />
              <Skeleton largura="2rem" altura="1.25rem" />
            </div>
          </div>
          <div className="reserva-bilhete-embarque">
            <div>
              <Skeleton largura="108px" altura="108px" />
            </div>
            <p>
              <Skeleton largura="14rem" />
              <Skeleton largura="18rem" altura=".875rem" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
