# Ficha de Treino

Aplicativo web para controle de treinos de academia, com acesso para alunos e para o Personal.

**Gestor:** aba Gestão com todos os Personais e alunos, liberação de Personais, transferência de alunos e modelos para todos.

**Aluno:** treino do dia com cronômetro de sessão, descanso automático com vibração e som, isometrias cronometradas, registro de carga e repetições, escala de dor no joelho, avaliação do esforço ao final, fotos de execução e vídeo de cada exercício, frequência semanal, gráficos de evolução e histórico. O aluno pode criar e editar as próprias fichas.

**Personal:** painel com os alunos da sua carteira (frequência da semana em relação à meta, último treino e alertas de dor, piora do joelho, esforço alto, ausência e recados), fichas de cada aluno, modelos reutilizáveis, evolução, histórico e cadastro de alunos.

Tecnologia: HTML e JavaScript puros, publicados no **GitHub Pages**, com login e banco de dados no **Firebase** (Authentication + Cloud Firestore). As fotos dos exercícios vêm da [Free Exercise DB](https://github.com/yuhonas/free-exercise-db), de domínio público.

---

## Como colocar no ar

### 1. Criar o projeto no Firebase

1. Acesse <https://console.firebase.google.com> com sua conta Google e clique em **Criar um projeto**. Nome sugerido: `ficha-de-treino`. O Google Analytics pode ficar desativado.
2. No menu **Criação → Authentication**, clique em **Vamos começar**, escolha **E-mail/senha**, ative a primeira opção e salve.
3. No menu **Criação → Firestore Database**, clique em **Criar banco de dados**:
   - local: `southamerica-east1 (São Paulo)`;
   - modo: **produção**.
4. Ainda no Firestore, abra a aba **Regras**, apague o conteúdo, cole todo o arquivo [`firestore.rules`](firestore.rules) deste repositório e clique em **Publicar**.
5. Em **Configurações do projeto** (engrenagem) → **Geral** → **Seus apps**, clique no ícone **`</>`** (Web), dê o nome `Ficha de Treino` e clique em **Registrar app**. Copie o bloco `firebaseConfig` que aparece.

### 2. Ligar o app ao Firebase

1. Neste repositório, abra `js/config.js` e clique no lápis (**Edit this file**).
2. Substitua os valores pelos do `firebaseConfig` copiado (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).
3. Clique em **Commit changes**.

Esses dados não são secretos; quem protege as informações são as regras do Firestore.

### 3. Publicar no GitHub Pages

1. No repositório, vá em **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**, branch **main**, pasta **/ (root)**, e salve.
3. Após 1 ou 2 minutos, o app fica disponível em `https://pedroreinomartins-hash.github.io/ficha-de-treino/`.
4. No Firebase, em **Authentication → Settings → Domínios autorizados**, adicione `pedroreinomartins-hash.github.io`.

### 4. Definir o gestor (uma única vez)

O gestor vê todos os Personais e alunos, libera novos Personais e transfere alunos.

1. O gestor entra no app (com Google ou e-mail).
2. No Firebase, em **Authentication → Usuários**, copie o **UID do usuário** dele.
3. Em **Firestore Database → Dados**, clique em **Iniciar coleção**, com ID `gestores`.
   - ID do documento: cole o UID;
   - campo: `nome`, tipo string, valor do nome do gestor.
4. O gestor sai do app e entra de novo. Aparece a aba **Gestão**.

### 5. Personais, alunos e vínculo

- **Tornar-se Personal:** o próprio usuário toca em **Meu perfil → Sou Personal**, informa cidade e, se quiser, o CREF, e assina a declaração de habilitação. O app gera o código de convite (ex.: `RAFA27`). Quem é Personal alterna entre **Modo Personal** e **Modo aluno** em Meu perfil. O gestor ainda pode liberar alguém manualmente e revogar acessos em **Gestão → Personais**.
- **Denúncias:** na busca, qualquer aluno pode denunciar um perfil; as denúncias aparecem em **Gestão → Personais**.
- **Vínculo sempre com aceite:**
  - o **aluno solicita** pela busca ou pelo código do Personal, e o Personal aceita ou recusa no painel;
  - o **Personal convida** por e-mail ou cadastrando o aluno, e o aluno aceita ou recusa em **Meu perfil**, marcando a autorização de acesso aos dados (consentimento registrado com data e texto, conforme a LGPD).
- **Encerrar:** aluno (Meu perfil) ou Personal (aluno → Cadastro) encerram a qualquer momento; o Personal perde o acesso na hora.
- **Transferir:** o gestor pode mudar o Personal responsável em **Gestão → Alunos → aluno → Cadastro**, com a concordância do aluno.
- **Modelos e visibilidade:** o aluno vê as fichas que ele mesmo criou, as que o Personal montou para ele, os modelos básicos do app e os do gestor (para todos). Os modelos do Personal são privados por padrão; marcando **Disponível para meus alunos** no modelo, eles passam a aparecer para os alunos dele em *Nova ficha → Começar com*. Fichas de um aluno nunca aparecem para outros alunos.
- **Ficha vazia:** começa sem nenhum treino; os treinos A, B, C… são incluídos no editor.

### Perfil público, academias e busca

- O Personal preenche **Meu perfil → Perfil público** (apresentação, especialidades, cidade, bairros, academias, modalidade, preço, contato e CREF opcional) e marca **Aparecer na busca**.
- Com CREF informado, o perfil ganha o selo **CREF**. O gestor pode marcar o CREF como **conferido** (selo verde).
- Academias: o gestor importa do OpenStreetMap por cidade em **Gestão → Academias** (com revisão e sem duplicar as já cadastradas); o Personal também pode sugerir (com preenchimento pelo CEP) e o gestor aprova. Dados do OpenStreetMap: © contribuidores do OpenStreetMap, licença ODbL.
- O aluno usa **Encontrar um Personal**, com filtros por cidade, bairro, academia, especialidade e modalidade. **Alunos nunca aparecem em buscas.**

### Fichas, metas e modelos básicos

- **Atenção ao atualizar:** sempre que `firestore.rules` mudar, cole o arquivo novo em *Firestore Database → Regras* e clique em **Publicar**.
- **Meta semanal editável** (1 a 7 treinos por semana) em cada ficha. Os treinos se alternam em sequência (A, B, A…), sem depender do dia da semana: uma ficha A/B pode ser feita todos os dias.
- **Modelos básicos do app**, disponíveis para todos em *Nova ficha → Começar com*: Full Body básico, Full Body A/B, Superior e Inferior, ABC clássico (peito/ombros/tríceps · dorsal/bíceps · pernas) e Iniciante 2x. Descanso sugerido de 60 s nos compostos e 45 s nos isoladores.
- **Tempos em minutos:** descanso e tempo de exercício são digitados em min:seg (1:00 = 1 minuto; 0:45 = 45 segundos; 2 = 2 minutos).

### Aparência e foto

- **Aparência por modo:** em *Meu perfil → Aparência*, o modo aluno e o modo Personal têm cada um o seu tema (claro, escuro ou automático, que segue o celular) e a sua cor de destaque (laranja, azul, verde-água, roxo ou vermelho), com prévia. Padrão: aluno escuro e laranja; Personal claro e azul. A escolha fica salva na conta.
- **Foto de perfil:** em *Meu perfil*, adicionar da galeria ou câmera (JPG, PNG, WEBP ou HEIC, convertido no aparelho), ajustar o enquadramento arrastando e com zoom, e salvar reduzida (~256 px, guardada no próprio perfil, sem Firebase Storage). Também dá para usar a foto da conta Google ou remover. Conversão de HEIC: biblioteca heic2any (licença MIT, em `js/vendor`). A foto do Personal aparece na busca.

### Corrida

- **Treino de corrida na ficha** (*+ Treino de corrida* no editor), montado em blocos: aquecimento, corrida contínua, intervalado (tiros com recuperação) e desaquecimento, por tempo ou distância, com ritmo opcional.
- **Execução guiada por voz**: anúncio de cada etapa, aviso de 10 segundos, contagem dos 3 últimos segundos e avanço automático. Sem GPS, blocos por distância usam o ritmo para estimar o tempo; sem ritmo, o avanço é manual (botão ou fone).
- **Registro da corrida**: distância, tempo, ritmo calculado, FC média, esforço, dor no joelho, tênis e observação. Também há *Registrar corrida avulsa* no Início.
- **Arquivo do relógio**: GPX, TCX ou FIT exportado do Garmin, Polar, Coros, Suunto, Amazfit/Zepp, Strava etc. preenche distância, tempo, data e FC.
- **Evolução**: km por semana, ritmo por corrida, maior distância e alerta quando o volume semanal sobe mais de 10%. **Tênis**: km acumulados e aviso a partir de 600 km.

### Sons e modo segundo plano

- Estilos por modalidade em *Meu perfil → Sons e alertas*: sino suave (padrão da musculação), voz (padrão da corrida), apito ou só vibração; contagem dos 3 últimos segundos e aviso de metade do tempo.
- Durante o treino o app mantém uma sessão de áudio e aparece como player na tela de bloqueio, para continuar avisando com a tela apagada. Em economia de bateria, o sistema ainda pode pausar o navegador.

### Ficha com IA

Em **Fichas → ✦ Criar com IA** (também disponível para o Personal e nos Modelos):

1. **Pedido para a IA:** o usuário preenche objetivo, nível, frequência, duração, local, restrições e preferências, e toca em **Copiar pedido**. O texto já pede à IA a resposta no formato que o app entende.
2. **Colar resposta:** cola o que o ChatGPT, Claude ou Gemini respondeu. O app reconhece treinos, exercícios, séries, repetições, tempo, descanso e observações (também lê listas e tabelas comuns).
3. **Prévia editável:** confere, corrige, inclui ou remove exercícios e cria a ficha.

O app não envia dados a nenhuma IA. A ficha fica marcada como "sugestão de IA" e o Personal do aluno recebe um aviso no painel. A geração automática dentro do app está prevista para o plano Premium.

### Durante o treino (nov/2026)

- **Carga visível e editável:** cada exercício tem carga de referência, editável direto na ficha (campo *Carga* na lista) e mostrada no treino. Ao salvar o treino, a maior carga usada vira a nova referência.
- **Séries editáveis:** toque numa série já registrada para corrigir carga, repetições ou tempo, ou excluí-la. **✎ Ajustar** muda séries, repetições, carga, descanso e técnica no meio do treino, com opção de salvar também na ficha.
- **Fotos sempre visíveis:** as duas posições do exercício aparecem no card (toque para ampliar); o passo a passo fica em *Como executar*. Miniaturas também na ficha e na lista do treino.
- **Lista do treino (☰) com ✓ e ✕:** ✓ marca o exercício como feito e grava as séries que faltam com a carga e as repetições previstas (toque numa série para corrigir); ✕ pula o exercício. Tocar de novo desfaz. Também há o botão *Pular este exercício*. Os pulados ficam no histórico e aparecem como alerta para o Personal.
- **Técnicas avançadas** (campo *Técnica* do exercício): drop-set e rest-pause/cluster registram blocos extras na mesma série (com pausa curta cronometrada); bi-set e tri-set encadeiam os exercícios sem descanso entre eles; pirâmides, negativa e FST-7 mostram a orientação.
- **Meta semanal:** ao concluir o treino, o app mostra o progresso da semana e parabeniza quando a meta é cumprida.

### Cadastro, avisos e Personal (nov/2026)

- **Data de nascimento** em *Meu perfil* (ou no Cadastro do aluno, pelo Personal). Aviso de aniversário no painel do Personal (7 dias antes) e parabéns ao aluno no dia.
- **Vencimento da ficha** no editor (data livre ou *Usar fim do ciclo*). Aviso ao aluno e ao Personal a partir de 7 dias antes.
- **Treinos de hoje em tempo real:** o painel do Personal lista os treinos concluídos no dia, com esforço e recado; com o app aberto, chega um aviso na hora (também em segundo plano, se os avisos do navegador forem ativados).
- **Personal conduz o treino:** em *Aluno → Fichas → Conduzir treino*, o Personal roda a sessão no próprio celular; os registros vão para o histórico do aluno, marcados como conduzidos pelo Personal.

As melhorias que dependem de notificações push estão em [`ROADMAP.md`](ROADMAP.md).

### Termos e privacidade

`termos.html` e `privacidade.html` são minutas. Preencha os campos entre colchetes (responsável, CNPJ/CPF, endereço, e-mail, prazo de retenção) antes de divulgar o app. No primeiro acesso, cada usuário precisa aceitar os dois documentos.

### 6. Instalar no celular (Android)

Abra o endereço no Chrome, toque em **⋮** e depois em **Instalar app** (ou **Adicionar à tela inicial**). O app abre em tela cheia e funciona mesmo sem internet; os treinos sincronizam quando a conexão voltar.

---

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Página e estilos |
| `js/app.js` | Lógica do app |
| `js/config.js` | Configuração do Firebase |
| `js/exercicios.js` | Fotos e instruções dos exercícios (Free Exercise DB) |
| `js/recursos.js` | Técnicas avançadas, aniversário, vencimento, avisos ao Personal e condução do treino |
| `ROADMAP.md` | Atualizações futuras combinadas |
| `firestore.rules` | Regras de acesso ao banco |
| `manifest.webmanifest`, `sw.js`, `icons/` | Instalação como app e uso offline |

## Custos

No plano gratuito (Spark), o Firebase permite 50 mil leituras e 20 mil gravações de banco por dia, além de login por e-mail sem custo. É suficiente para dezenas de alunos.
