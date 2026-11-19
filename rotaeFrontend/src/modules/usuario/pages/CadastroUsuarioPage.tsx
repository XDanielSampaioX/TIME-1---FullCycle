import { TelaAcesso } from "@/modules/autenticacao/components/TelaAcesso";
import { FormularioCadastroUsuario } from "../components/FormularioCadastroUsuario";

export function CadastroUsuarioPage({ destino }: { destino: string }) {
  return (
    <TelaAcesso
      painel={{
        selo: "Cadastre-se gratuitamente",
        titulo: (
          <>
            Seu próximo <span className="block text-(--color-accent-500)">destino favorito</span> começa aqui.
          </>
        ),
        texto: "Encontre os melhores horários, garanta sua poltrona preferida em minutos e planeje novas aventuras pelo Brasil.",
      }}
      titulo="Criar conta"
      subtitulo="Preencha seus dados para começar a planejar suas viagens"
    >
      <FormularioCadastroUsuario destino={destino} />
    </TelaAcesso>
  );
}
