// Uma mensagem por campo com problema; objeto vazio significa dados válidos.
export type ErrosValidacao<Dados> = Partial<Record<keyof Dados, string>>;
