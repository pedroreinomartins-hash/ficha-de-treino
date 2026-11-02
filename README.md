# Ficha de Treino

Aplicativo web para controle de treinos de academia, com acesso para alunos e para o Personal.

**Aluno:** treino do dia com cronômetro de sessão, descanso automático com vibração e som, isometrias cronometradas, registro de carga e repetições, escala de dor no joelho, avaliação do esforço ao final, fotos de execução e vídeo de cada exercício, frequência semanal, gráficos de evolução e histórico. O aluno pode criar e editar as próprias fichas.

**Personal:** painel com todos os alunos (frequência da semana em relação à meta, último treino e alertas de dor, piora do joelho, esforço alto, ausência e recados), fichas de cada aluno, modelos reutilizáveis, evolução, histórico e cadastro de alunos.

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

### 4. Liberar o acesso do Personal

1. O Personal abre o app e usa **Criar conta** com o e-mail dele.
2. No Firebase, em **Authentication → Usuários**, copie o **UID do usuário** do Personal.
3. Em **Firestore Database → Dados**, clique em **Iniciar coleção**, com ID `admins`.
   - ID do documento: cole o UID do Personal;
   - campo: `nome`, tipo string, valor `Personal`.
4. O Personal sai do app e entra de novo. A tela passa a ser o painel de alunos.

### 5. Cadastrar os alunos

Cada aluno pode usar **Criar conta**, ou o Personal pode cadastrar pelo painel (**+ Cadastrar aluno**), informando nome, e-mail e uma senha provisória.

Na primeira vez, o Personal pode tocar em **Modelos → Carregar os 2 modelos iniciais** para ter as fichas-base de condropatia e tendinite patelar.

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
