import { Skeleton } from "@/shared/components/Skeleton";

export function CardViagemSkeleton() {
  return (
    <article className="viagem-card" aria-hidden="true">
      <div className="viagem-card-corpo">
        <div className="viagem-trajeto">
          <div>
            <Skeleton largura="3.5rem" altura="1.5rem" />
            <Skeleton largura="7rem" />
          </div>
          <Skeleton altura="6px" />
          <div>
            <Skeleton largura="3.5rem" altura="1.5rem" />
            <Skeleton largura="7rem" />
          </div>
        </div>
        <div className="viagem-classe">
          <Skeleton largura="6rem" altura="1.5rem" />
          <Skeleton largura="5rem" />
        </div>
        <div className="viagem-compra">
          <Skeleton largura="5rem" altura="2rem" />
          <Skeleton largura="6.5rem" altura="2.5rem" />
        </div>
      </div>
    </article>
  );
}
