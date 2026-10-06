# Instruções do repositório

## Revisão obrigatória de princípios em mudanças de implementação

Para toda tarefa que crie ou altere código, contratos, configuração, dados ou documentação técnica neste repositório, carregue e aplique estas skills antes de editar e ao revisar a implementação:

1. `.skills/dry-principle/SKILL.md`
2. `.skills/nao-usar-normalizadores/SKILL.md`
3. `.skills/edicao-consciente/SKILL.md`
4. `.skills/solid-o-open-closed/SKILL.md`
5. `.skills/solid-d-dependency-inversion/SKILL.md`
6. `.skills/polimorfismo-classes/SKILL.md`

Trate-as como revisões obrigatórias em cada implementação, independentemente de o pedido mencionar esses princípios. Aplique cada princípio conforme sua relevância: a revisão não é motivo para introduzir abstrações, herança, interfaces ou pontos de extensão sem necessidade concreta.

Para normalização local, mantenha a operação inline no método responsável. Um normalizador compartilhado só é permitido para uma convenção transversal comprovada e reutilizada em módulos independentes (por exemplo, o formato de data padrão da aplicação); siga os critérios de `.skills/nao-usar-normalizadores/SKILL.md` quando DRY parecer recomendar centralização.

No resumo da implementação, registre concisamente o resultado dessas revisões e justifique duplicações deliberadas ou abstrações adicionadas.
