CREATE TABLE IF NOT EXISTS empresas (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome text NOT NULL UNIQUE
);

INSERT INTO cidades (nome, uf)
VALUES ('Recife', 'PE')
ON CONFLICT (nome, uf) DO NOTHING;

INSERT INTO empresas (nome)
VALUES ('Via Exemplo')
ON CONFLICT (nome) DO NOTHING;