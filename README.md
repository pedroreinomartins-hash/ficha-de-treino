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
- **Modelos:** cada Personal tem os próprios; os do gestor ficam disponíveis para todos.

### Perfil público, academias e busca

- O Personal preenche **Meu perfil → Perfil público** (apresentação, especialidades, cidade, bairros, academias, modalidade, preço, contato e CREF opcional) e marca **Aparecer na busca**.
- Com CREF informado, o perfil ganha o selo **CREF**. O gestor pode marcar o CREF como **conferido** (selo verde).
- Academias: o gestor importa do OpenStreetMap por cidade em **Gestão → Academias** (com revisão e sem duplicar as já cadastradas); o Personal também pode sugerir (com preenchimento pelo CEP) e o gestor aprova. Dados do OpenStreetMap: © contribuidores do OpenStreetMap, licença ODbL.
- O aluno usa **Encontrar um Personal**, com filtros por cidade, bairro, academia, especialidade e modalidade. **Alunos nunca aparecem em buscas.**

### Ficha com IA

Em **Fichas → ✦ Criar com IA** (também disponível para o Personal e nos Modelos):

1. **Pedido para a IA:** o usuário preenche objetivo, nível, frequência, duração, local, restrições e preferências, e toca em **Copiar pedido**. O texto já pede à IA a resposta no formato que o app entende.
2. **Colar resposta:** cola o que o ChatGPT, Claude ou Gemini respondeu. O app reconhece treinos, exercícios, séries, repetições, tempo, descanso e observações (também lê listas e tabelas comuns).
3. **Prévia editável:** confere, corrige, inclui ou remove exercícios e cria a ficha.

O app não envia dados a nenhuma IA. A ficha fica marcada como "sugestão de IA" e o Personal do aluno recebe um aviso no painel. A geração automática dentro do app está prevista para o plano Premium.

### Termos e privacidade

`termos.html` e `privacidade.html` são minutas. Preencha os campos entre colchetes (responsável, CNPJ/CPF, endereço, e-mail, prazo de retenção) antes de divulgar o app. No primeiro acesso, cada usuário precisa aceitar os dois documentos.

### 6. Trazer os dados do app de teste

1. No app de teste do Claude, entre no seu perfil, abra **Fichas** e toque em **Copiar meus dados**.
2. No app publicado, entre na sua conta, abra **Fichas → Importar dados do app de teste**, cole e toque em **Importar**.

### 7. Instalar no celular (Android)

Abra o endereço no Chrome, toque em **⋮** e depois em **Instalar app** (ou **Adicionar à tela inicial**). O app abre em tela cheia e funciona mesmo sem internet; os treinos sincronizam quando a conexão voltar.

---

## Estrutura

| Arquivo | Função |
|---|---|
| `index.html` | Página e estilos |
| `js/app.js` | Lógica do app |
| `js/config.js` | Configuração do Firebase |
| `js/exercicios.js` | Fotos e instruções dos exercícios (Free Exercise DB) |
| `firestore.rules` | Regras de acesso ao banco |
| `manifest.webmanifest`, `sw.js`, `icons/` | Instalação como app e uso offline |

## Custos

No plano gratuito (Spark), o Firebase permite 50 mil leituras e 20 mil gravações de banco por dia, além de login por e-mail sem custo. É suficiente para dezenas de alunos.
