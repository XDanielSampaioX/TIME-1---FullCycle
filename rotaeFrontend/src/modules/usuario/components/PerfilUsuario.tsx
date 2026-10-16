import { formatarDataNascimento } from "../utils/formatarDataNascimento";
import type { Usuario } from "../types/usuario";

export function PerfilUsuario({ usuario }: { usuario: Usuario }) {
  const dados = [
    { titulo: "Nome", valor: usuario.nome },
    { titulo: "E-mail", valor: usuario.email },
    { titulo: "CPF", valor: usuario.cpf },
    { titulo: "Celular", valor: usuario.celular || "Não informado" },
    { titulo: "Data de nascimento", valor: formatarDataNascimento(usuario.dataNasc) },
  ];

  return (
    <dl className="m-0 grid gap-3">
      {dados.map((dado) => (
        <div className="grid gap-1" key={dado.titulo}>
          <dt className="text-xs font-extrabold tracking-widest text-(--color-text-secondary) uppercase">
            {dado.titulo}
          </dt>
          <dd className="m-0">{dado.valor}</dd>
        </div>
      ))}
    </dl>
  );
}
