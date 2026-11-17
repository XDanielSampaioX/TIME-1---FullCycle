import { LoginPage } from "@/modules/autenticacao/pages/LoginPage";
import { destinoAposLogin } from "@/modules/autenticacao/utils/destinoAposLogin";

export default async function Page({ searchParams }: PageProps<"/login">) {
  const { voltar } = await searchParams;

  return <LoginPage destino={destinoAposLogin(voltar)} />;
}
