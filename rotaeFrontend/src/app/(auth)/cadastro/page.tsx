import { destinoAposLogin } from "@/modules/autenticacao/utils/destinoAposLogin";
import { CadastroUsuarioPage } from "@/modules/usuario/pages/CadastroUsuarioPage";

export default async function Page({ searchParams }: PageProps<"/cadastro">) {
  const { voltar } = await searchParams;

  return <CadastroUsuarioPage destino={destinoAposLogin(voltar)} />;
}
