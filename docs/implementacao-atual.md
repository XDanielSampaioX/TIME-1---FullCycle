# Mudanças do frontend — `refactor/viagens-26`

Esta branch reúne, por merge, as entregas #61 (viagens e assentos) e #62 (usuários e autenticação). Este registro descreve as mudanças efetivamente feitas no frontend.

## Página inicial

- Foi montada a home do Rotaê com cabeçalho, navegação, rodapé, seção principal de busca, explicação de como funciona e conteúdo de segurança.
- O cabeçalho também apresenta um menu com links de navegação para Minhas viagens, Entrar e Criar conta.
- O formulário inicial coleta origem, destino, data e quantidade de passageiros e encaminha a busca para `/viagens`.
- A seção “Destinos populares” agora usa as viagens retornadas pela API, em vez de destinos e preços estáticos. Agrupa os resultados por cidade de destino, mostra a menor tarifa encontrada e apresenta até quatro destinos.

## Busca e resultados de viagens

- A rota `/viagens` lê os parâmetros da URL e carrega cidades e viagens paginadas.
- Os nomes digitados para origem e destino são associados às cidades carregadas; a lista de cidades é mantida em cache por cinco minutos.
- Foram adicionados filtros de horário de partida, classe e faixa de preço, além de ordenação por menor preço, menor duração e saída mais cedo.
- Os cards apresentam trajeto, horários, duração, classe, assentos livres e preço por passageiro. A opção “Selecionar” preserva os dados da busca ao abrir a seleção de assentos.
- A tela inclui resumo e paginação dos resultados, estados de carregamento, erro com opção de tentar novamente e estado vazio com opção para limpar os filtros.

## Seleção de assentos

- Foi criada a rota `/viagens/{id}/assentos`, com resumo da viagem, etapas visuais do checkout e retorno aos resultados preservando a busca.
- O mapa organiza os assentos, diferencia os disponíveis dos ocupados e permite selecionar ou remover assentos disponíveis.
- O resumo apresenta números selecionados, preço por passageiro e total. Antes de aceitar a seleção, a interface consulta novamente a disponibilidade; também permite atualizar o mapa e tentar novamente após falha.
- O fluxo implementado termina na seleção local e na verificação de disponibilidade. Não inclui telas de dados dos passageiros, criação de reserva, pagamento ou confirmação final.

## Componentes e suporte compartilhados

- Foram criados componentes reutilizáveis para botão, container, navegação, paginação e etapas do checkout.
- Foram adicionados serviços e tipos do frontend para consultas paginadas, cidades, viagens e assentos, além de funções compartilhadas para exibir data e valores em reais.
- A identidade visual recebeu estilos responsivos, estados visuais e recursos gráficos para a home, os resultados e o mapa de assentos.
- O frontend ganhou configuração do Jest e testes unitários para interpretação dos parâmetros de busca e filtragem de viagens disponíveis.

## Revisão da implementação

O registro acompanha os contratos e componentes existentes no frontend. A ordenação mantém estratégias distintas para preço, duração e horário, pois são comportamentos diferentes; não foi necessário adicionar novas abstrações para documentá-los. As transformações específicas da busca permanecem junto aos fluxos que as utilizam, e os serviços de API reutilizam o cliente e o contrato de paginação compartilhados.
