CREATE TABLE IF NOT EXISTS viagens (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  rota_id bigint NOT NULL REFERENCES rotas(id),
  partida_em timestamptz NOT NULL,
  chegada_em timestamptz NOT NULL,
  preco_centavos integer NOT NULL CHECK (preco_centavos >= 0),
  status text NOT NULL DEFAULT 'aberta'
    CHECK (status IN ('aberta', 'cancelada', 'encerrada')),
  CHECK (chegada_em > partida_em),
  UNIQUE (rota_id, partida_em)
);

INSERT INTO viagens (
  rota_id, partida_em, chegada_em, preco_centavos
)
SELECT
  rota.id,
  '2026-10-15 08:00:00-03',
  '2026-10-15 20:00:00-03',
  8990
FROM rotas AS rota
JOIN empresas AS empresa ON empresa.id = rota.empresa_id
JOIN cidades AS origem ON origem.id = rota.origem_id
JOIN cidades AS destino ON destino.id = rota.destino_id
WHERE empresa.nome = 'Via Exemplo'
  AND origem.nome = 'Fortaleza' AND origem.uf = 'CE'
  AND destino.nome = 'Recife' AND destino.uf = 'PE'
ON CONFLICT (rota_id, partida_em) DO NOTHING;