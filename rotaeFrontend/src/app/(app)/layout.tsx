import { Footer } from "@/shared/components/Footer";
import { Header } from "@/shared/components/Header";

// Telas do site: têm o cabeçalho e o rodapé. As de acesso (login e cadastro) ficam em (auth), sem eles.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
