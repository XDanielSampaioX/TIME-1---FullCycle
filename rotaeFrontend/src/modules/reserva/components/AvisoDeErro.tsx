import { Button } from "@/shared/components/Button";

// Mostra o que deu errado e um botão para tentar de novo, como as telas de viagem.
export function AvisoDeErro({ mensagem, aoTentarNovamente }: {
  mensagem: string;
  aoTentarNovamente: () => void;
}) {
  return (
    <div className="viagem-estado" role="alert">
      <p>{mensagem}</p>
      <Button onClick={aoTentarNovamente}>Tentar novamente</Button>
    </div>
  );
}
