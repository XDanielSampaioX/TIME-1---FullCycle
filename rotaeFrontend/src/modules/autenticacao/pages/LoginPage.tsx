import { FormularioLogin } from "../components/FormularioLogin";
import { TelaAcesso } from "../components/TelaAcesso";

export function LoginPage({ destino }: { destino: string }) {
  return (
    <TelaAcesso
      painel={{
        selo: "Bem-vindo de volta",
        titulo: (
          <>
            Sua próxima <span className="block text-(--color-accent-500)">viagem inesquecível</span> continua aqui.
          </>
        ),
        texto: "Acesse sua conta para rever suas viagens, escolher novos destinos e embarcar com tranquilidade pelo Brasil.",
      }}
      titulo="Entrar na sua conta"
      subtitulo="Bem-vindo de volta! Informe seus dados para continuar"
    >
      <FormularioLogin destino={destino} />
    </TelaAcesso>
  );
}
