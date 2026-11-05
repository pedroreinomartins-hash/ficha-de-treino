/* Biblioteca de exercícios (nov/2026): exercícios com músculos, equipamento, nível e passo a passo em português;
   mapa corporal (frente e costas), músculos trabalhados na semana, 1RM estimado e medidas corporais.
   Tudo é calculado no aparelho: nada de servidor, IA ou serviço pago. Fotos: Free Exercise DB (domínio público). */

/* ================= Músculos ================= */
const MUSC={peito:'Peito',ombros:'Ombros',biceps:'Bíceps',triceps:'Tríceps',antebraco:'Antebraço',abdomen:'Abdômen',obliquos:'Oblíquos',dorsal:'Dorsal',trapezio:'Trapézio',lombar:'Lombar',gluteos:'Glúteos',quadriceps:'Quadríceps',posterior:'Posterior de coxa',adutores:'Adutores',panturrilha:'Panturrilha'};
const MUSC_PRINC=['peito','dorsal','ombros','quadriceps','posterior','gluteos'];
const NIVEL=['','Iniciante','Intermediário','Avançado'];
const EQUIP=['Barra','Halteres','Máquina','Polia','Peso do corpo','Cardio'];

/* ================= Exercícios =================
   Ordem de reconhecimento: do mais específico para o mais genérico (o primeiro "re" que casar com o nome vence).
   Campos: n nome · eq equipamento · nv nível · p músculo principal · s secundários · tipo (c composto, i isolador, t por tempo) · re nomes reconhecidos · ps passo a passo. */
const BX=(n,eq,nv,p,s,tipo,re,ps)=>({n,eq,nv,p,s,tipo,re,ps});
const BIB=[
 BX('Bicicleta ergométrica','Cardio',1,'',[],'t','bicicleta|bike|ergometrica',['Ajuste o banco para o joelho ficar levemente flexionado embaixo.','Pedale em ritmo confortável, com carga leve no aquecimento.','Mantenha o tronco estável e a respiração regular.']),
 BX('Esteira (caminhada)','Cardio',1,'',[],'t','esteira|caminhada',['Comece em velocidade baixa e aumente aos poucos.','Caminhe com passadas naturais, sem se apoiar nas barras.','Desacelere no final antes de descer.']),
 BX('Elíptico','Cardio',1,'',[],'t','eliptico|transport',['Suba com os pés inteiros nos pedais e segure as alças.','Movimente pernas e braços em ritmo contínuo.','Ajuste a resistência para manter a respiração controlada.']),
 BX('Abdominal infra','Peso do corpo',1,'abdomen',[],'i','abdominal infra|elevacao de pernas',['Deite de barriga para cima, mãos ao lado do corpo e pernas elevadas.','Leve os joelhos em direção ao peito, tirando o quadril do chão.','Volte devagar, sem deixar as pernas caírem.']),
 BX('Abdominal na polia','Polia',2,'abdomen',['obliquos'],'i','abdominal na polia|abdominal com corda',['Ajoelhe de frente para a polia alta, segurando a corda junto à cabeça.','Flexione o tronco levando os cotovelos em direção às coxas.','Volte controlando, sem mover o quadril.']),
 BX('Abdominal supra','Peso do corpo',1,'abdomen',[],'i','abdominal|crunch',['Deite de barriga para cima, joelhos flexionados e pés apoiados.','Eleve o tronco contraindo o abdômen, sem puxar o pescoço com as mãos.','Desça devagar até as escápulas tocarem o chão.']),
 BX('Prancha lateral','Peso do corpo',2,'obliquos',['abdomen'],'t','prancha lateral',['Deite de lado e apoie o antebraço, com o cotovelo abaixo do ombro.','Eleve o quadril até o corpo ficar em linha reta.','Mantenha a posição e repita do outro lado.']),
 BX('Prancha','Peso do corpo',1,'abdomen',['obliquos','lombar'],'t','prancha',['Apoie antebraços e pontas dos pés, cotovelos abaixo dos ombros.','Mantenha o corpo alinhado, contraindo abdômen e glúteos.','Respire normalmente e não deixe o quadril cair.']),
 BX('Spanish squat (com faixa)','Peso do corpo',1,'quadriceps',[],'t','spanish',['Prenda a faixa num ponto fixo e passe-a atrás dos joelhos.','Incline o corpo para trás e flexione os joelhos, com as canelas na vertical.','Mantenha a posição no ângulo indicado, sem dor acima do combinado.']),
 BX('Agachamento no Smith','Máquina',1,'quadriceps',['gluteos'],'c','smith',['Posicione a barra do Smith sobre o trapézio, com os pés um pouco à frente.','Destrave a barra e desça até a amplitude confortável.','Suba mantendo os joelhos alinhados com os pés.']),
 BX('Agachamento sumô','Halteres',1,'quadriceps',['gluteos','adutores'],'c','agachamento sumo|sumo',['Afaste bem os pés, pontas para fora, segurando o halter entre as pernas.','Desça com o tronco ereto, joelhos abrindo na direção dos pés.','Suba contraindo glúteos e a parte interna das coxas.']),
 BX('Step-up','Peso do corpo',1,'quadriceps',['gluteos'],'c','step|subida no banco|subida na caixa',['Fique de frente para a plataforma, com um pé inteiro apoiado em cima.','Suba empurrando com a perna de cima, sem impulso da de baixo.','Desça devagar e repita.']),
 BX('Afundo','Halteres',2,'quadriceps',['gluteos'],'c','afundo|avanco|passada|bulgaro|lunge',['Dê um passo à frente segurando um halter em cada mão.','Desça até os dois joelhos ficarem perto de 90°.','Empurre com a perna da frente para voltar.']),
 BX('Agachamento livre','Barra',2,'quadriceps',['gluteos','lombar'],'c','agachamento|squat',['Apoie a barra no trapézio, com os pés na largura dos ombros.','Desça levando o quadril para trás, joelhos na direção dos pés e tronco firme.','Suba empurrando o chão até estender quadril e joelhos.']),
 BX('Hiperextensão lombar','Peso do corpo',1,'lombar',['gluteos','posterior'],'i','hiperextensao|extensao lombar',['Apoie o quadril no banco de hiperextensão, com os pés presos.','Desça o tronco mantendo a coluna neutra.','Suba até alinhar o tronco com as pernas, sem passar dessa linha.']),
 BX('Cadeira abdutora','Máquina',1,'gluteos',[],'i','abdutora|abducao',['Sente com as costas apoiadas e as pernas por dentro das almofadas.','Afaste as pernas contra a resistência.','Volte devagar, sem deixar o peso bater.']),
 BX('Cadeira adutora','Máquina',1,'adutores',[],'i','adutora|aducao',['Sente com as pernas por fora das almofadas, afastadas.','Aproxime as pernas contra a resistência.','Abra devagar, controlando o retorno.']),
 BX('Cadeira extensora','Máquina',1,'quadriceps',[],'i','extensora|extensao de joelho|extensao isometrica',['Ajuste o encosto para o joelho ficar alinhado com o eixo da máquina.','Estenda os joelhos até quase travar.','Desça devagar, respeitando a amplitude indicada.']),
 BX('Flexora sentada','Máquina',1,'posterior',[],'i','flexora sentada|cadeira flexora',['Sente com o rolo atrás dos tornozelos e trave as coxas.','Flexione os joelhos puxando o rolo para baixo.','Volte devagar até quase estender.']),
 BX('Mesa flexora','Máquina',1,'posterior',['panturrilha'],'i','flexora',['Deite de bruços com o rolo logo acima dos calcanhares.','Flexione os joelhos levando o rolo em direção aos glúteos, sem tirar o quadril da mesa.','Desça controlando o movimento.']),
 BX('Flexão de braço','Peso do corpo',1,'peito',['triceps','ombros','abdomen'],'c','flexao de braco|flexoes|flexao no solo|push up',['Mãos no chão um pouco além da largura dos ombros, corpo alinhado.','Desça o peito em direção ao chão, com os cotovelos a cerca de 45°.','Empurre de volta sem deixar o quadril cair.']),
 BX('Crossover','Polia',2,'peito',['ombros'],'i','crossover|cross over',['Fique no centro com as polias no alto, um pé à frente.','Traga as mãos para baixo e à frente, cotovelos levemente flexionados.','Volte abrindo os braços até sentir o peito alongar.']),
 BX('Crucifixo inverso','Máquina',1,'ombros',['trapezio'],'i','crucifixo inverso|voador inverso|peck deck inverso',['Sente de frente para o encosto do voador, braços estendidos à frente.','Abra os braços para trás até a linha dos ombros.','Volte devagar, sem perder a postura.']),
 BX('Crucifixo na polia','Polia',1,'peito',['ombros'],'i','crucifixo na polia',['Fique entre as polias segurando as alças.','Abra os braços em arco até a linha do peito.','Feche trazendo as mãos à frente do peito.']),
 BX('Crucifixo com halteres','Halteres',1,'peito',['ombros'],'i','crucifixo',['Deite no banco com os halteres acima do peito, palmas frente a frente.','Abra os braços em arco, cotovelos levemente flexionados.','Feche o movimento contraindo o peito.']),
 BX('Peck deck','Máquina',1,'peito',['ombros'],'i','peck deck|voador',['Sente com as costas apoiadas e os braços nas alças.','Feche os braços à frente do peito.','Abra devagar até sentir o peito alongar.']),
 BX('Desenvolvimento com barra','Barra',2,'ombros',['triceps','trapezio'],'c','desenvolvimento com barra|desenvolvimento militar',['Segure a barra na altura dos ombros, mãos um pouco além da largura deles.','Empurre a barra acima da cabeça sem arquear a lombar.','Desça controlando até a altura do queixo.']),
 BX('Desenvolvimento na máquina','Máquina',1,'ombros',['triceps'],'c','desenvolvimento na maquina|desenvolvimento maquina',['Ajuste o banco para as alças ficarem na altura dos ombros.','Empurre para cima sem travar os cotovelos.','Volte devagar.']),
 BX('Desenvolvimento com halteres (sentado)','Halteres',1,'ombros',['triceps'],'c','desenvolvimento|arnold',['Sente com as costas apoiadas e os halteres na altura das orelhas.','Empurre os halteres para cima até quase estender os cotovelos.','Desça devagar até a posição inicial.']),
 BX('Elevação frontal','Halteres',1,'ombros',[],'i','elevacao frontal',['Em pé, halteres à frente das coxas.','Eleve os braços à frente até a altura dos ombros.','Desça devagar, sem balançar o corpo.']),
 BX('Elevação lateral na polia','Polia',1,'ombros',[],'i','elevacao lateral na polia|elevacao lateral polia',['De lado para a polia baixa, segure a alça com a mão do lado oposto.','Eleve o braço para o lado até a altura do ombro.','Volte devagar e repita do outro lado.']),
 BX('Elevação lateral','Halteres',1,'ombros',['trapezio'],'i','elevacao lateral',['Em pé, halteres ao lado do corpo e cotovelos levemente flexionados.','Eleve os braços para os lados até a altura dos ombros.','Desça controlando.']),
 BX('Elevação pélvica (hip thrust)','Barra',2,'gluteos',['posterior'],'c','elevacao pelvica|hip thrust|ponte',['Apoie as costas no banco e a barra sobre o quadril, com proteção.','Eleve o quadril até o tronco ficar alinhado às coxas, contraindo os glúteos.','Desça sem encostar o quadril no chão.']),
 BX('Encolhimento com halteres','Halteres',1,'trapezio',[],'i','encolhimento',['Em pé, halteres ao lado do corpo.','Eleve os ombros em direção às orelhas, sem dobrar os cotovelos.','Segure um instante e desça devagar.']),
 BX('Face pull','Polia',1,'ombros',['trapezio'],'i','face pull',['Com a polia na altura do rosto, segure a corda com as palmas para baixo.','Puxe a corda em direção ao rosto, abrindo os cotovelos.','Volte devagar.']),
 BX('Glúteo na polia','Polia',1,'gluteos',['posterior'],'i','gluteo na polia|coice|kickback',['Prenda a tornozeleira na polia baixa e segure no apoio.','Leve a perna para trás, estendendo o quadril.','Volte devagar, sem arquear a lombar.']),
 BX('Panturrilha no leg press','Máquina',1,'panturrilha',[],'i','panturrilha no leg|panturrilha leg',['Apoie só a ponta dos pés na borda da plataforma.','Empurre estendendo os tornozelos.','Volte devagar, sem dobrar os joelhos.']),
 BX('Panturrilha sentada','Máquina',1,'panturrilha',[],'i','panturrilha sentad',['Sente com o apoio sobre os joelhos e a ponta dos pés na plataforma.','Eleve os calcanhares o máximo possível.','Desça devagar.']),
 BX('Panturrilha em pé','Máquina',1,'panturrilha',[],'i','panturrilha',['Apoie a ponta dos pés na plataforma, calcanhares livres.','Suba na ponta dos pés o máximo possível.','Desça devagar até alongar a panturrilha.']),
 BX('Leg press horizontal','Máquina',1,'quadriceps',['gluteos'],'c','leg press horizontal',['Sente com as costas apoiadas e os pés na plataforma.','Flexione os joelhos até a amplitude indicada.','Empurre até quase estender as pernas.']),
 BX('Leg press 45°','Máquina',1,'quadriceps',['gluteos'],'c','leg press|legpress',['Apoie as costas e posicione os pés na largura dos ombros na plataforma.','Destrave e desça flexionando os joelhos até a amplitude indicada.','Empurre a plataforma sem travar os joelhos no fim.']),
 BX('Stiff com halteres','Halteres',2,'posterior',['gluteos','lombar'],'c','stiff|romeno',['Em pé, halteres à frente das coxas e joelhos levemente flexionados.','Incline o tronco levando o quadril para trás, com a coluna neutra.','Volte contraindo glúteos e posteriores.']),
 BX('Levantamento terra','Barra',3,'lombar',['gluteos','posterior','trapezio'],'c','levantamento terra|terra|deadlift',['Pés sob a barra; segure-a com as mãos por fora das pernas.','Com a coluna neutra, empurre o chão e estenda quadril e joelhos juntos.','Desça a barra rente às pernas, controlando.']),
 BX('Pull-through na polia','Polia',1,'gluteos',['posterior'],'c','pull-through|pull through',['De costas para a polia baixa, segure a corda entre as pernas.','Leve o quadril para trás com os joelhos quase estendidos.','Estenda o quadril contraindo os glúteos.']),
 BX('Pulldown com braços estendidos','Polia',2,'dorsal',['triceps'],'i','pulldown|pullover',['De frente para a polia alta, segure a barra com os braços estendidos.','Leve a barra até as coxas mantendo os cotovelos quase retos.','Volte devagar até a altura da cabeça.']),
 BX('Barra fixa','Peso do corpo',3,'dorsal',['biceps'],'c','barra fixa|pull up|chin up',['Segure a barra com as palmas para frente, mãos além dos ombros.','Puxe o corpo até o queixo passar da barra.','Desça devagar até estender os braços.']),
 BX('Puxada com triângulo','Polia',1,'dorsal',['biceps'],'c','puxada com triangulo|puxada triangulo|puxada fechada',['Segure o triângulo com as palmas frente a frente.','Puxe até o peito, levando os cotovelos para baixo.','Volte devagar.']),
 BX('Puxada alta pela frente','Polia',1,'dorsal',['biceps'],'c','puxada|pulley|lat pull',['Sente com as coxas travadas e segure a barra mais aberta que os ombros.','Puxe a barra até a parte alta do peito, mantendo o peito aberto.','Volte devagar até estender os braços.']),
 BX('Remada articulada','Máquina',1,'dorsal',['biceps','trapezio'],'c','remada articulada|remada maquina',['Ajuste o banco e apoie o peito no encosto.','Puxe as alças levando os cotovelos para trás.','Volte devagar até estender os braços.']),
 BX('Remada baixa','Polia',1,'dorsal',['biceps','trapezio'],'c','remada baixa|remada sentada',['Sente com os pés apoiados e os joelhos levemente flexionados.','Puxe o triângulo até o abdômen, com o peito aberto.','Volte devagar, sem curvar as costas.']),
 BX('Remada cavalinho','Barra',2,'dorsal',['biceps','lombar'],'c','remada cavalinho|t-bar|remada t',['Posicione-se sobre a barra com o tronco inclinado e a coluna neutra.','Puxe a barra até o abdômen.','Desça controlando.']),
 BX('Remada curvada','Barra',2,'dorsal',['biceps','lombar'],'c','remada curvada',['Incline o tronco à frente com a coluna neutra e a barra à frente das pernas.','Puxe a barra até o abdômen, levando os cotovelos para trás.','Desça devagar.']),
 BX('Remada unilateral','Halteres',1,'dorsal',['biceps'],'c','remada unilateral|serrote|remada',['Apoie joelho e mão no banco, com a coluna paralela ao chão.','Puxe o halter até o quadril, cotovelo junto ao corpo.','Desça devagar até estender o braço.']),
 BX('Rosca alternada','Halteres',1,'biceps',['antebraco'],'i','rosca alternada',['Em pé, halteres ao lado do corpo com as palmas para frente.','Flexione um cotovelo de cada vez, sem mover o ombro.','Desça devagar.']),
 BX('Rosca concentrada','Halteres',1,'biceps',[],'i','rosca concentrada',['Sente e apoie o cotovelo na parte interna da coxa.','Flexione o cotovelo levando o halter em direção ao ombro.','Desça até quase estender.']),
 BX('Rosca martelo','Halteres',1,'biceps',['antebraco'],'i','rosca martelo',['Segure os halteres com as palmas voltadas para o corpo.','Flexione os cotovelos mantendo essa pegada.','Desça devagar.']),
 BX('Rosca Scott','Barra',1,'biceps',[],'i','rosca scott|scott',['Apoie a parte de trás dos braços no banco Scott.','Flexione os cotovelos até o alto.','Desça devagar, sem estender bruscamente.']),
 BX('Rosca direta','Barra',1,'biceps',['antebraco'],'i','rosca',['Em pé, segure a barra com as palmas para frente.','Flexione os cotovelos sem balançar o tronco.','Desça devagar até estender.']),
 BX('Supino declinado','Barra',2,'peito',['triceps'],'c','supino declinado',['Deite no banco declinado com os pés presos.','Desça a barra até a parte baixa do peito.','Empurre até estender os braços.']),
 BX('Supino inclinado com halteres','Halteres',1,'peito',['ombros','triceps'],'c','supino inclinado com halteres|supino inclinado halteres',['Deite no banco inclinado com os halteres na linha do peito.','Empurre os halteres para cima, aproximando-os no alto.','Desça devagar até sentir o peito alongar.']),
 BX('Supino inclinado com barra','Barra',2,'peito',['ombros','triceps'],'c','supino inclinado',['Deite no banco inclinado (30° a 45°) e segure a barra um pouco além dos ombros.','Desça até a parte alta do peito.','Empurre de volta sem tirar as costas do banco.']),
 BX('Supino máquina','Máquina',1,'peito',['triceps','ombros'],'c','supino maquina|supino articulado|chest press',['Ajuste o banco para as alças ficarem na linha do meio do peito.','Empurre à frente sem travar os cotovelos.','Volte devagar.']),
 BX('Supino reto com halteres','Halteres',1,'peito',['triceps','ombros'],'c','supino reto com halteres|supino com halteres|supino halteres',['Deite no banco com os halteres na linha do peito.','Empurre para cima até quase estender os cotovelos.','Desça devagar, com os cotovelos a cerca de 45° do corpo.']),
 BX('Supino reto com barra','Barra',2,'peito',['triceps','ombros'],'c','supino',['Deite no banco com os olhos na linha da barra e os pés firmes no chão.','Segure a barra um pouco além da largura dos ombros e retire do suporte.','Desça controlando até tocar levemente o meio do peito, cotovelos a cerca de 45°.','Empurre de volta até estender os braços, sem tirar o quadril do banco.']),
 BX('Tríceps corda','Polia',1,'triceps',[],'i','triceps corda|triceps na corda',['De frente para a polia alta, segure a corda com os cotovelos junto ao corpo.','Estenda os cotovelos, abrindo a corda no final.','Volte devagar, sem mexer os ombros.']),
 BX('Tríceps francês','Halteres',1,'triceps',[],'i','triceps frances',['Segure um halter com as duas mãos acima da cabeça.','Desça o halter atrás da cabeça, flexionando os cotovelos.','Estenda os braços sem abrir os cotovelos.']),
 BX('Tríceps testa','Barra',2,'triceps',[],'i','triceps testa|testa',['Deite no banco segurando a barra acima do peito.','Flexione os cotovelos levando a barra em direção à testa.','Estenda os braços sem mexer os ombros.']),
 BX('Tríceps na polia','Polia',1,'triceps',[],'i','triceps',['Segure a barra da polia alta com os cotovelos junto ao corpo.','Estenda os cotovelos até os braços ficarem retos.','Volte devagar até a altura do peito.']),
 BX('Mergulho no banco','Peso do corpo',1,'triceps',['peito','ombros'],'c','mergulho|paralelas',['Apoie as mãos na borda do banco, com as pernas à frente.','Desça flexionando os cotovelos até cerca de 90°.','Empurre de volta até estender os braços.'])
];
BIB.forEach((e,i)=>{e.i=i;e.rx=new RegExp(e.re)});
const BIB_ORD=BIB.slice().sort((a,b)=>a.n.localeCompare(b.n,'pt'));
const classCache={};
/* Reconhece o exercício pelo nome digitado (inclui nomes antigos e variações). */
function classifica(nome){const k=nk(nome||'');if(!k)return null;if(k in classCache)return classCache[k];let r=null;for(const e of BIB)if(e.rx.test(k)){r=e;break}classCache[k]=r;return r}
const muscTxt=e=>e?(e.p?MUSC[e.p]:'Cardio')+(e.s.length?' · também '+e.s.map(m=>MUSC[m].toLowerCase()).join(', '):''):'';

/* ================= Mapa corporal (frente e costas) =================
   cor(m) devolve [cor, opacidade]; com clique, cada músculo vira um botão (data-act="bmus"). */
const CORPO_F=[['ombros','e',32,31,7,6],['ombros','e',68,31,7,6],['peito','p','M49 27 L38 28 Q33 33 35 41 Q38 46 49 45 Z'],['peito','p','M51 27 L62 28 Q67 33 65 41 Q62 46 51 45 Z'],['biceps','r',22,37,8,18],['biceps','r',70,37,8,18],['antebraco','r',19,57,8,21],['antebraco','r',73,57,8,21],['obliquos','r',36,47,6,22],['obliquos','r',58,47,6,22],['abdomen','r',43,47,14,26],['adutores','r',47,80,6,24],['quadriceps','r',37,80,11,38],['quadriceps','r',52,80,11,38],['panturrilha','r',38,126,10,26],['panturrilha','r',52,126,10,26]];
const CORPO_C=[['dorsal','p','M49 42 L38 32 Q32 45 40 60 L49 63 Z'],['dorsal','p','M51 42 L62 32 Q68 45 60 60 L51 63 Z'],['trapezio','p','M50 21 L38 29 L50 41 L62 29 Z'],['ombros','e',32,31,7,6],['ombros','e',68,31,7,6],['triceps','r',22,37,8,18],['triceps','r',70,37,8,18],['antebraco','r',19,57,8,21],['antebraco','r',73,57,8,21],['lombar','r',43,62,14,10],['gluteos','e',43,80,7,8],['gluteos','e',57,80,7,8],['posterior','r',37,89,12,31],['posterior','r',51,89,12,31],['panturrilha','r',37,123,11,29],['panturrilha','r',52,123,11,29]];
function corpo(cor,{clique=false,rotulo='Mapa corporal'}={}){
 const base=`<circle cx="50" cy="12" r="8"/><rect x="46" y="19" width="8" height="6"/><circle cx="22" cy="82" r="3.5"/><circle cx="78" cy="82" r="3.5"/><rect x="37" y="153" width="11" height="5" rx="2"/><rect x="52" y="153" width="11" height="5" rx="2"/>`;
 const parte=([m,t,a,b,c,d])=>{const [fc,op]=cor(m);const at=`fill="${fc}" fill-opacity="${op}"${clique?` data-act="bmus" data-v="${m}" class="bm-c"`:''}`;const tt=`<title>${MUSC[m]}</title>`;
  return t==='e'?`<ellipse cx="${a}" cy="${b}" rx="${c}" ry="${d}" ${at}>${tt}</ellipse>`:t==='p'?`<path d="${a}" ${at}>${tt}</path>`:`<rect x="${a}" y="${b}" width="${c}" height="${d}" rx="${Math.min(c,d)/2}" ${at}>${tt}</rect>`};
 return `<svg class="corpo" viewBox="0 0 220 172" role="img" aria-label="${esc(rotulo)}"><g fill="var(--sunk)">${base}<rect x="36" y="71" width="28" height="9" rx="4"/></g>${CORPO_F.map(parte).join('')}<text x="50" y="170">FRENTE</text>
 <g transform="translate(120,0)"><g fill="var(--sunk)">${base}</g>${CORPO_C.map(parte).join('')}<text x="50" y="170">COSTAS</text></g></svg>`}
const COR0=['var(--muted)',.28];
const HEAT=[COR0,['var(--accent)',.3],['var(--accent)',.5],['var(--accent)',.75],['var(--accent)',1]];
const nivelSeries=v=>v<=0?0:v<=5?1:v<=9?2:v<=14?3:4;
const legendaHeat=()=>`<div class="legend" style="justify-content:center"><span>séries/semana:</span>${['0','1–5','6–9','10–14','15+'].map((l,i)=>`<span><i style="background:${HEAT[i][0]};opacity:${HEAT[i][1]}"></i>${l}</span>`).join('')}</div>`;

/* ================= Tela: biblioteca (ao incluir exercício) ================= */
function bibFiltra(){const B=S.bib,q=nk(B.q||'');return BIB_ORD.filter(e=>(!B.mus||e.p===B.mus||e.s.includes(B.mus))&&(B.eq==='Todos'||e.eq===B.eq)&&(!q||nk(e.n).includes(q)||e.rx.test(q)))
 .sort((a,b)=>B.mus?((a.p===B.mus?0:1)-(b.p===B.mus?0:1))||a.n.localeCompare(b.n,'pt'):0)}
function bibThumb(e){const m=media(e.n);return m?`<img class="thumb" src="${IMG_BASE+m.img[0]}" alt="" loading="lazy">`:`<span class="thumb bt-ic" aria-hidden="true">${IC.fichas}</span>`}
function bibLista(){const B=S.bib,L=bibFiltra(),q=(B.q||'').trim();
 const tit=B.mus?MUSC[B.mus]:B.eq!=='Todos'?B.eq:q?'Resultado da busca':'Todos os exercícios';
 const itens=L.map(e=>`<div class="exrow"><button class="bt-img" data-act="bibdet" data-v="${e.i}" aria-label="Ver ${esc(e.n)}">${bibThumb(e)}</button><button class="grow bt-txt" data-act="bibdet" data-v="${e.i}"><b>${esc(e.n)}</b><div class="meta">${esc(e.eq)}${e.nv?' · '+NIVEL[e.nv]:''}${B.mus?' · '+(e.p===B.mus?'principal':'secundário'):e.p?' · '+MUSC[e.p]:''}</div></button><button class="ib bt-add" data-act="bibadd" data-v="${e.i}" aria-label="Incluir ${esc(e.n)} no treino">+</button></div>`).join('');
 const man=`<button class="btn dash" data-act="bibman">${q&&!L.some(e=>nk(e.n)===nk(q))?`Usar o nome “${esc(q)}”`:'Digitar o nome do exercício'}</button>`;
 return `<div class="row" style="align-items:baseline"><h2 class="grow">${esc(tit)}</h2><span class="small muted">${L.length} exercício${L.length===1?'':'s'}</span></div>
 <section class="panel" style="gap:0;padding-block:4px">${itens||'<div class="small muted" style="padding:12px 0">Nenhum exercício com esse filtro.</div>'}</section>${man}`}
function viewBiblio(){const B=S.bib,f=curFicha();const ti=f?f.treinos.findIndex(x=>x.id===B.t):-1;if(ti<0){S.bib=null;return viewFicha()}
 if(B.det!=null&&BIB[B.det])return viewBibDet(f,ti);
 const cor=m=>B.mus===m?['var(--accent)',1]:COR0;
 const eqs=['Todos',...EQUIP].map(l=>`<button class="fchip ${B.eq===l?'on':''}" data-act="bibeq" data-v="${esc(l)}" aria-pressed="${B.eq===l}">${esc(l)}</button>`).join('');
 const body=`<button class="btn sm ghost" data-act="bibback" style="align-self:flex-start">‹ Voltar à ficha</button>
 <div class="field"><label class="lbl" for="bibq">Buscar</label><input id="bibq" class="txt" type="search" value="${esc(B.q||'')}" placeholder="Nome do exercício" autocomplete="off"></div>
 <section class="panel bmap" style="gap:4px;padding:10px 8px 8px">${corpo(cor,{clique:true,rotulo:'Mapa corporal: toque num músculo para filtrar'})}
  <div class="row" style="gap:8px;justify-content:center"><span class="small muted">Toque no mapa ou escolha:</span><select id="bibmus" aria-label="Músculo" style="width:auto"><option value="">Todos</option>${Object.entries(MUSC).map(([k,l])=>`<option value="${k}" ${B.mus===k?'selected':''}>${l}</option>`).join('')}</select></div></section>
 <div class="fchips">${eqs}</div>
 <div id="biblist" style="display:flex;flex-direction:column;gap:12px">${bibLista()}</div>`;
 return page(`Treino ${LETRAS[ti]} · Incluir exercício`,'Biblioteca',body)}
/* Vídeo já cadastrado pelo Personal para o mesmo exercício, em alguma ficha visível. */
function videoDe(nome){const k=nk(nome),e=classifica(nome);for(const f of S.fichas)for(const t of f.treinos||[])for(const x of t.ex||[])if(x.video&&(nk(x.n)===k||(e&&classifica(x.n)===e)))return x.video;return ''}
function viewBibDet(f,ti){const e=BIB[S.bib.det],m=media(e.n),vid=videoDe(e.n);
 const cor=x=>x===e.p?['var(--accent)',1]:e.s.includes(x)?['var(--accent)',.45]:COR0;
 const fotos=m?`<div class="demo"><div class="imgs">${m.img.map((p,i)=>`<img src="${IMG_BASE+p}" alt="${esc(e.n)}, posição ${i?'final':'inicial'}" loading="lazy">`).join('')}</div><div class="small muted">Fotos: Free Exercise DB</div></div>`:'';
 const body=`<button class="btn sm ghost" data-act="bibdetx" style="align-self:flex-start">‹ Voltar à biblioteca</button>
 <div class="presc"><span class="tag">${esc(e.eq)}</span><span class="tag">${TIPOS[e.tipo]}</span>${e.nv?`<span class="tag">${NIVEL[e.nv]}</span>`:''}</div>
 ${fotos}
 ${e.p?`<section class="panel" style="gap:6px"><h3>Músculos trabalhados</h3><div class="row" style="gap:8px;align-items:center"><div style="flex:1.3;min-width:0">${corpo(cor,{rotulo:'Músculos trabalhados: '+muscTxt(e)})}</div><div class="small" style="flex:1;display:flex;flex-direction:column;gap:8px"><div><i class="sw" style="background:var(--accent)"></i><b>Principal</b><br>${MUSC[e.p]}</div>${e.s.length?`<div><i class="sw" style="background:var(--accent);opacity:.45"></i><b>Secundários</b><br>${e.s.map(x=>MUSC[x]).join(', ')}</div>`:''}</div></div></section>`:''}
 <section class="panel" style="gap:6px"><h3>Como executar</h3><ol class="small" style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px">${e.ps.map(t=>`<li>${esc(t)}</li>`).join('')}</ol><div class="small muted">Siga as orientações do seu Personal e respeite os seus limites.</div></section>
 ${vid?`<a class="btn ghost" href="${esc(vid)}" target="_blank" rel="noopener">▶ Vídeo cadastrado pelo Personal</a>`:''}
 <button class="btn primary big" data-act="bibadd" data-v="${e.i}">Incluir no Treino ${LETRAS[ti]}</button>`;
 return page('Biblioteca'+(e.p?' · '+MUSC[e.p]:''),esc(e.n),body)}
function bibAbrirForm(nome,tipo){const t=S.bib.t;S.bib=null;tipo=tipo||'c';
 S.form={t,e:null,d:{n:nome||'',tipo,s:'3',r:tipo==='t'?'30-45 s':'8-12',desc:fmtMS(REST[tipo]),hold:'0:30',knee:false,reab:false,nota:'',video:'',kg:'',tec:''}};
 render();setTimeout(()=>{$('#exform')?.scrollIntoView({block:'center'});if(!nome)$('#fx-n')?.focus()},0)}

/* ================= Músculos trabalhados na semana ================= */
function volumeSemana(aid,ws){const tot={},semClass=new Set();let ns=0,series=0;
 sessDe(aid).filter(s=>!s.corrida&&s.inicio>=ws&&s.inicio<ws+7*DAY).forEach(s=>{ns++;Object.values(s.ex||{}).forEach(r=>{const n=(r.sets||[]).length;if(!n)return;const e=classifica(r.n);
  if(!e){semClass.add(r.n);return}if(!e.p)return;series+=n;tot[e.p]=(tot[e.p]||0)+n;e.s.forEach(m=>tot[m]=(tot[m]||0)+n/2)})});
 return {tot,ns,series,semClass:[...semClass]}}
function musculos(aid){const off=Math.min(0,S.mwk||0),ws=weekStart(Date.now())+off*7*DAY,V=volumeSemana(aid,ws),T=V.tot;
 const cor=m=>HEAT[nivelSeries(T[m]||0)];
 const nav=`<div class="row" style="gap:8px"><button class="ib" data-act="mwk" data-v="-1" aria-label="Semana anterior">‹</button><div class="grow" style="text-align:center"><b class="num" style="font-size:20px">${off===0?'Esta semana':'Semana de '+ddmm(ws)+' a '+ddmm(ws+6*DAY)}</b><div class="small muted">${V.ns} treino${V.ns===1?'':'s'} · ${V.series} séries</div></div><button class="ib" data-act="mwk" data-v="1" ${off>=0?'disabled':''} aria-label="Próxima semana">›</button></div>`;
 const faltam=V.ns?MUSC_PRINC.filter(m=>!T[m]):[];
 const lista=Object.keys(MUSC).filter(m=>T[m]>0).sort((a,b)=>T[b]-T[a]).concat(faltam);
 const linhas=lista.map(m=>{const v=T[m]||0;return `<div class="mbar"><span>${MUSC[m]}</span><span class="tr"><span style="width:${Math.max(v?3:0,Math.min(100,v/20*100))}%;background:var(--accent);opacity:${v?Math.max(.45,HEAT[nivelSeries(v)][1]):0}"></span></span><b class="num">${fmtKg(Math.round(v*2)/2)}</b></div>`}).join('');
 return `<section class="panel" style="gap:8px">${nav}${corpo(cor,{rotulo:'Mapa de músculos trabalhados na semana'})}${legendaHeat()}</section>
 ${!V.ns?`<div class="empty">Nenhum treino de musculação ${off===0?'nesta semana ainda':'nesta semana'}.</div>`:`${faltam.length?`<div class="note warn">Sem estímulo ${off===0?'até agora':'nesta semana'}: ${faltam.map(m=>MUSC[m].toLowerCase()).join(', ')}.</div>`:''}
 <section class="panel" style="gap:8px"><div class="eyebrow">Séries por músculo</div>${linhas}
 <div class="small muted">Músculo secundário conta meia série. Corrida e aquecimento não entram na conta.${V.semClass.length?` Sem classificação (nome livre): ${esc(V.semClass.join(', '))}.`:''}</div></section>`}`}

/* ================= 1RM estimado (fórmula de Epley) ================= */
const e1rm=(kg,reps)=>kg>0&&reps>=1&&reps<=12?kg*(1+reps/30):0;
function melhor1rm(sets){let b=null;(sets||[]).forEach(x=>{const v=e1rm(+x.kg||0,+x.reps||0);if(v&&(!b||v>b.v))b={v,kg:+x.kg,reps:+x.reps}});return b}
function cargaPara(rm,reps){return Math.round(rm/(1+reps/30)*2)/2}
function bloco1rm(best){if(!best)return '';const rm=best.v;
 return `<div class="rmbox"><div class="row" style="align-items:baseline"><div class="grow"><div class="eyebrow">1RM estimado</div><b class="num" style="font-size:30px;color:var(--t1)">${fmtKg(Math.round(rm*2)/2)} kg</b></div><div class="small muted" style="text-align:right">melhor série<br><b style="color:var(--ink)">${fmtKg(best.kg)} kg × ${best.reps}</b> em ${ddmm(best.t)}</div></div>
 <div class="eyebrow">Cargas sugeridas</div><div class="kpis">${[[4,'força'],[8,''],[12,'']].map(([r,l])=>`<div class="kpi"><b>${fmtKg(cargaPara(rm,r))}</b><span>kg · ~${r} rep${l?' · '+l:''}</span></div>`).join('')}</div>
 <div class="small muted">Estimativa pela fórmula de Epley, só com séries de até 12 repetições. É uma referência: ajuste com o seu Personal.</div></div>`}

/* ================= Medidas corporais (ficam no perfil do aluno) ================= */
const MED=[['peso','Peso','kg',20,400],['gord','Gordura corporal','%',2,70],['peito','Peito','cm',40,250],['bracoD','Braço direito','cm',10,80],['bracoE','Braço esquerdo','cm',10,80],['cintura','Cintura','cm',30,250],['abd','Abdômen','cm',30,250],['quadril','Quadril','cm',40,250],['coxaD','Coxa direita','cm',20,120],['coxaE','Coxa esquerda','cm',20,120],['pant','Panturrilha','cm',15,80]];
const medK=k=>MED.find(x=>x[0]===k);
const medsDe=p=>(p?.medidas||[]).slice().sort((a,b)=>(a.d||'').localeCompare(b.d||'')||(a.em||0)-(b.em||0));
const ddmmISO=d=>{const m=String(d||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'/'+m[2]:''};
const hojeISO=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())};
function medVar(L,k){const c=L.filter(r=>r[k]!=null);if(!c.length)return null;const u=c[c.length-1],a=c[c.length-2];return {v:u[k],d:a?u[k]-a[k]:null,desde:a?ddmmISO(a.d):''}}
const fmtDif=(d,un)=>d==null?'':(d>0?'+':d<0?'−':'')+fmtKg(Math.abs(Math.round(d*10)/10))+(un==='%'?' p.p.':' '+un);
function medForm(){const M=S.med;return `<section class="form" id="medform"><h3>Registrar medidas</h3>
 <div class="field"><label class="lbl" for="md-data">Data</label><input id="md-data" class="txt" type="date" data-md="data" value="${esc(M.d.data)}" max="${hojeISO()}"></div>
 <div class="grid2">${MED.map(([k,l,u])=>`<div class="field"><label class="lbl" for="md-${k}">${l} (${u})</label><input id="md-${k}" class="txt" data-md="${k}" inputmode="decimal" value="${esc(M.d[k]||'')}" placeholder="—"></div>`).join('')}</div>
 <div class="small muted">Preencha só o que mediu. Use sempre o mesmo horário e as mesmas condições para comparar.</div>
 ${M.err?`<div class="note bad">${esc(M.err)}</div>`:''}
 <div class="nav2"><button class="btn ghost" data-act="medno">Cancelar</button><button class="btn primary" data-act="medok">Salvar</button></div></section>`}
function medidas(aid){const p=perfil(aid),L=medsDe(p),abre=S.med&&S.med.aid===aid;
 const btn=abre?medForm():`<button class="btn primary" data-act="medopen" data-v="${aid}">+ Registrar medidas</button>`;
 const nota=`<div class="small muted" style="text-align:center">${aid===S.me?'Compartilhadas com o seu Personal, quando houver vínculo.':'Registradas pelo aluno ou por você.'}</div>`;
 if(!L.length)return `${btn}<div class="empty">Nenhuma medida registrada. Registre peso, % de gordura e circunferências para acompanhar a evolução.</div>${nota}`;
 const kp=['peso','gord','cintura'].map(k=>{const r=medVar(L,k),[,l,u]=medK(k);return `<div class="kpi"><b>${r?fmtKg(r.v):'—'}</b><span>${k==='gord'?'% gordura':l.toLowerCase()+' ('+u+')'}</span>${r&&r.d!=null?`<div class="small muted" style="font-weight:600">${fmtDif(r.d,u)}</div>`:''}</div>`}).join('');
 const comDados=MED.filter(([k])=>L.some(r=>r[k]!=null));const ck=comDados.some(x=>x[0]===S.medK)?S.medK:comDados[0][0];const [,cl,cu]=medK(ck);
 const pts=L.filter(r=>r[ck]!=null).map(r=>({l:ddmmISO(r.d),v:r[ck]}));
 const graf=`<section class="panel"><div class="row"><div class="eyebrow grow">Evolução</div><select id="medSel" aria-label="Medida" style="width:auto;max-width:60%">${comDados.map(([k,l])=>`<option value="${k}" ${k===ck?'selected':''}>${l}</option>`).join('')}</select></div>${line(pts,{unit:cu==='%'?'%':' '+cu})}</section>`;
 const circ=MED.slice(2).map(([k,l,u])=>{const r=medVar(L,k);return r?`<div class="item"><span class="grow">${l}</span><b class="num" style="font-size:19px">${fmtKg(r.v)} ${u}</b><span class="small muted" style="width:76px;text-align:right">${r.d==null?'':r.d===0?'—':fmtDif(r.d,u)}</span></div>`:''}).join('');
 const hist=L.slice().reverse().map(r=>{const vals=MED.filter(([k])=>r[k]!=null).map(([k,l,u])=>`${l.split(' ')[0]==='Gordura'?'gordura':l.toLowerCase()} ${fmtKg(r[k])}${u==='%'?'%':' '+u}`).join(' · ');
  const cf=S.medDel===r.id;return `<div class="item" style="align-items:flex-start"><div class="grow"><b>${ddmmISO(r.d)}/${String(r.d).slice(0,4)}</b>${r.por?`<span class="small muted"> · por ${esc(r.por)}</span>`:''}<div class="small muted">${esc(vals)}</div>${cf?`<div class="row" style="gap:6px;margin-top:6px"><button class="btn sm danger" data-act="meddel" data-v="${r.id}">Excluir registro</button><button class="btn sm ghost" data-act="medconf" data-v="">Manter</button></div>`:''}</div>${cf?'':`<button class="ib del" data-act="medconf" data-v="${r.id}" aria-label="Excluir registro de ${ddmmISO(r.d)}">✕</button>`}</div>`}).join('');
 return `<div class="kpis">${kp}</div>${graf}${circ?`<section class="panel" style="gap:0"><div class="eyebrow" style="padding-bottom:6px">Circunferências · último registro</div>${circ}</section>`:''}${btn}
 <details class="panel"><summary><b>Registros (${L.length})</b></summary><div class="list">${hist}</div></details>${nota}`}
async function medSalvar(){const M=S.med,p=perfil(M.aid);if(!p)return;M.err='';
 if(!dataLocal(M.d.data)){M.err='Informe a data.';render();return}
 const rec={id:uid('m'),d:M.d.data,em:Date.now()};
 for(const [k,l,u,mn,mx] of MED){const t=String(M.d[k]||'').trim();if(!t)continue;const v=parseFloat(t.replace(',','.'));if(isNaN(v)||v<mn||v>mx){M.err=`${l}: valor fora do esperado (${mn} a ${mx} ${u}).`;render();return}rec[k]=Math.round(v*10)/10}
 if(MED.every(([k])=>rec[k]==null)){M.err='Preencha pelo menos uma medida.';render();return}
 if(M.aid!==S.me)rec.por=ME()?.nome||'Personal';
 p.medidas=[...(p.medidas||[]),rec];S.med=null;render();toast('Medidas salvas.');
 try{await fdb.collection('perfis').doc(p.id).update({medidas:firebase.firestore.FieldValue.arrayUnion(rec)})}catch(e){console.warn(e);toast('Não foi possível salvar as medidas. Verifique a conexão.')}}
async function medExcluir(aid,id){const p=perfil(aid),r=(p?.medidas||[]).find(x=>x.id===id);if(!r)return;p.medidas=p.medidas.filter(x=>x.id!==id);S.medDel=null;render();
 try{await fdb.collection('perfis').doc(p.id).update({medidas:firebase.firestore.FieldValue.arrayRemove(r)})}catch(e){console.warn(e);toast('Não foi possível excluir. Verifique a conexão.')}}

/* ================= Eventos ================= */
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const v=b.dataset.v;
 switch(b.dataset.act){
  case 'bmus':if(!S.bib)return;S.bib.mus=S.bib.mus===v?'':v;render();break;
  case 'bibeq':S.bib.eq=v;render();break;
  case 'bibdet':S.bib.det=+v;render();window.scrollTo(0,0);break;
  case 'bibdetx':S.bib.det=null;render();window.scrollTo(0,0);break;
  case 'bibback':{const t=S.bib?.t;S.bib=null;render();setTimeout(()=>{const el=t&&document.getElementById('tn-'+t);el?el.closest('.panel').scrollIntoView({block:'start'}):window.scrollTo(0,0)},0);break}
  case 'bibadd':{const x=BIB[+v];if(x)bibAbrirForm(x.n,x.tipo);break}
  case 'bibman':bibAbrirForm((S.bib.q||'').trim(),'c');break;
  case 'mwk':S.mwk=Math.min(0,(S.mwk||0)+ +v);render();break;
  case 'esub':S.esub=v;S.med=null;S.medDel=null;render();break;
  case 'medopen':S.med={aid:v,d:{data:hojeISO()},err:''};S.medDel=null;render();setTimeout(()=>$('#medform')?.scrollIntoView({block:'start'}),0);break;
  case 'medno':S.med=null;render();break;
  case 'medok':medSalvar();break;
  case 'medconf':S.medDel=v||null;render();break;
  case 'meddel':medExcluir(S.view==='aluno'?S.sel:S.me,v);break;
 }});
document.addEventListener('input',e=>{const el=e.target;
 if(el.id==='bibq'&&S.bib){S.bib.q=el.value;const L=$('#biblist');if(L)L.innerHTML=bibLista()}
 if(el.dataset.md&&S.med)S.med.d[el.dataset.md]=el.value});
document.addEventListener('change',e=>{const el=e.target;
 if(el.id==='bibmus'&&S.bib){S.bib.mus=el.value;render()}
 if(el.id==='medSel'){S.medK=el.value;render()}});
