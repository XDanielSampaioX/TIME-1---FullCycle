import { Pool } from "pg";

export const runtime = "nodejs";

const banco = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

export async function GET() {
  try {
    const resultado = await banco.query(`
      SELECT
        viagem.id,
        origem.nome AS origem,
        destino.nome AS destino,
        empresa.nome AS empresa,
        viagem.partida_em,
        viagem.chegada_em,
        viagem.preco_centavos
      FROM viagens AS viagem
      JOIN rotas AS rota ON rota.id = viagem.rota_id
      JOIN cidades AS origem ON origem.id = rota.origem_id
      JOIN cidades AS destino ON destino.id = rota.destino_id
      JOIN empresas AS empresa ON empresa.id = rota.empresa_id
      WHERE viagem.status = 'aberta'
      ORDER BY viagem.partida_em
    `);

    return Response.json(resultado.rows);
  } catch {
    return Response.json(
      { erro: "Não foi possível consultar as viagens." },
      { status: 500 }
    );
  }
}