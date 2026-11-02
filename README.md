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

### 5. Personais e alunos

- **Liberar um Personal:** a pessoa entra no app uma vez. O gestor abre **Gestão → Personais**, escolhe o usuário e toca em **Liberar como Personal**. O app gera o código de convite do Personal (ex.: `RAFA27`).
- **Aluno entrar na carteira:** o aluno abre **Meu perfil** (toque no nome, no alto da tela), informa o código do Personal e toca em **Vincular**. Fichas, treinos e histórico passam a ser vistos pelo Personal.
- **Cadastro pelo Personal:** no painel, **+ Cadastrar aluno**, com nome, e-mail e senha provisória. O aluno já entra na carteira dele.
- **Transferir aluno:** o gestor abre **Gestão → Alunos → aluno → Cadastro** e escolhe o novo Personal responsável. O histórico vai junto.
- **Modelos:** cada Personal tem os próprios modelos. Os modelos criados pelo gestor ficam disponíveis para todos. Na primeira vez, toque em **Modelos → Carregar os 2 modelos iniciais**.

Cada Personal só enxerga os alunos da própria carteira. Isso é garantido pelas regras do Firestore, não só pelo app.

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
