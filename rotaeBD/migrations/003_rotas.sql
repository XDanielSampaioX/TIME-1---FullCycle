CREATE TABLE IF NOT EXISTS rotas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empresa_id bigint NOT NULL REFERENCES empresas(id),
  origem_id bigint NOT NULL REFERENCES cidades(id),
  destino_id bigint NOT NULL REFERENCES cidades(id),
  CHECK (origem_id <> destino_id),
  UNIQUE (empresa_id, origem_id, destino_id)
);

INSERT INTO rotas (empresa_id, origem_id, destino_id)
SELECT empresa.id, origem.id, destino.id
FROM empresas AS empresa
JOIN cidades AS origem
  ON origem.nome = 'Fortaleza' AND origem.uf = 'CE'
JOIN cidades AS destino
  ON destino.nome = 'Recife' AND destino.uf = 'PE'
WHERE empresa.nome = 'Via Exemplo'
ON CONFLICT (empresa_id, origem_id, destino_id) DO NOTHING;