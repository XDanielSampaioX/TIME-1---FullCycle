DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = 'rotae_reader'
  ) THEN
    CREATE ROLE rotae_reader LOGIN;
  END IF;
END
$$;

GRANT CONNECT ON DATABASE rotae TO rotae_reader;
GRANT USAGE ON SCHEMA public TO rotae_reader;
GRANT SELECT ON TABLE cidades, empresas, rotas, viagens TO rotae_reader;