CREATE TABLE IF NOT EXISTS cidades (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome text NOT NULL,
  uf char(2) NOT NULL,
  UNIQUE (nome, uf)
);

INSERT INTO cidades (nome, uf)
VALUES ('Fortaleza', 'CE')
ON CONFLICT (nome, uf) DO NOTHING;