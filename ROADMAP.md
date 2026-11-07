# Atualizações futuras

Lista de melhorias combinadas e ainda não implementadas. Cada item indica a origem e o que é preciso para fazê-lo.

## Rodada 3 · notificações e lembretes automáticos

Sugestões do Personal Carlos Igor (03/11/2026). Dependem de **Firebase Cloud Functions** e **Cloud Messaging**, que exigem o plano **Blaze** do Firebase (pago por uso; no volume atual o custo tende a zero, mas é preciso cadastrar cartão).

| Item | O que fazer |
|---|---|
| Notificações push | Registrar o aparelho (token FCM) de cada usuário e enviar avisos mesmo com o app fechado. No iPhone, só com o app adicionado à tela inicial (iOS 16.4+); e-mail como canal alternativo. |
| Aniversário | Rotina diária que envia parabéns ao aluno e avisa o Personal. Hoje o aviso aparece só dentro do app. |
| Vencimento da ficha | Lembrete ao aluno e ao Personal alguns dias antes do vencimento. Hoje o aviso aparece só dentro do app. |
| Treino concluído | Push ao Personal quando o aluno termina o treino, com o app fechado. Hoje o aviso chega em tempo real só com o app aberto. |
| Lembrete de ausência | Após X dias sem treinar: "Lembramos de você, estamos sentindo a sua falta!" |
| Reforço da meta semanal | Push ao fechar a semana: "Parabéns, você concluiu todos os treinos desta semana!" Hoje a mensagem aparece no app ao concluir o último treino da meta. |

## Comunidades · quando houver o plano Blaze

- Placar e progresso dos desafios recalculados no servidor (Cloud Function) a partir dos treinos salvos, em vez de informados pelo app de cada membro.
- Fotos nos recados do mural (Firebase Storage), reduzidas no celular antes do envio.
- Notificações: pedido de entrada para o criador, aprovação para o membro, reações e novo desafio.

## Outras ideias registradas

- Geração de ficha por IA dentro do app (plano Premium). Hoje a ficha é criada colando a resposta de uma IA externa.
- Cobrança no app: por aluno, por Personal ou ambos.
- Modalidades novas: Hyrox ou CrossFit.
- Gerador de ficha por regras (sem IA), como opção em *Nova ficha → Começar com*: objetivo, dias por semana, tempo, nível, local e articulação a poupar. Em espera (05/11/2026), para não criar uma terceira forma de montar ficha ao lado de *Criar com IA* e dos modelos básicos.

## Concluído

- **03/11/2026 · Rodadas 1 e 2 (sugestões do Carlos Igor):** carga visível e editável na ficha; edição das séries e ajuste do exercício durante o treino, salvando na ficha; fotos sempre visíveis; pular exercício; técnicas avançadas (drop-set, bi-set, tri-set, rest-pause, cluster, pirâmides, negativa, FST-7); mensagem de meta semanal; data de nascimento e aviso de aniversário; vencimento da ficha; treinos de hoje em tempo real no painel do Personal; Personal conduzindo o treino do aluno no próprio celular.
- **04/11/2026 · Fichas:** ficha vazia sem treinos; modelos do Personal privados por padrão, com a opção “Disponível para meus alunos” (regras do Firestore atualizadas).
- **04/11/2026 · Aparência e lista do treino:** tema (claro, escuro, automático) e cor por modo (aluno e Personal), salvos na conta; botões ✓ (feito, com valores previstos) e ✕ (pular) na lista do treino.
- **05/11/2026 · Comunidades (etapas 1 e 2):** criação por aluno ou Personal, entrada com aprovação do criador, mural de recados curtos, check-in opcional, aviso fixado, moderação e denúncias, ranking (semana, mês, constância, km) e desafios, com limites de bom senso nas regras.
- **05/11/2026 · Biblioteca e progresso (comparativo MuscleWiki):** biblioteca de exercícios com mapa corporal, filtros e passo a passo em português; músculos trabalhados na semana; 1RM estimado e cargas sugeridas; medidas corporais (aluno e Personal). Sem custo adicional e sem mudança nas regras do Firestore.
- **05/11/2026 · Alertas e dor:** botão *Ciente* nos alertas do Personal; escala de dor para qualquer exercício marcado na ficha (sem menção a joelho); pergunta das 24 h só quando o treino teve escala de dor; alertas indicam o exercício.
- **06/11/2026 · PDF:** exportação da ficha de treino e do relatório de progressão (dor opcional, desmarcada por padrão), gerados no celular.
- **06/11/2026 · Exercícios combinados:** combinar com o próximo (bi-set, tri-set, série gigante) e circuito com rodadas, descanso entre exercícios e entre rodadas; também no PDF.
- **07/11/2026 · Mapa de músculos:** seletor de fichas compartilhado com os gráficos e modo “Previsto na ficha”, com comparação feito/previsto.
