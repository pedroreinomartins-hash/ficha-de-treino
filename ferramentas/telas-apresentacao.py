"""Gera as telas da página /apresentacao a partir do próprio app, com dados de exemplo.
Uso: na raiz do repositório, rode  python3 -m http.server 8765  e, em outro terminal,  python3 ferramentas/telas-apresentacao.py
Depois converta os PNG para WebP 780x1688 em apresentacao/telas/. Requer Playwright e as fontes Barlow e Barlow Condensed (.ttf) na pasta ./fontes."""
import os, sys, json
from playwright.sync_api import sync_playwright

REPO = '.'
FONTS = os.environ.get('FONTES', 'fontes')
OUT = sys.argv[1] if len(sys.argv) > 1 else 'telas-png'
os.makedirs(OUT, exist_ok=True)

FONT_CSS = ''.join(
    f"@font-face{{font-family:'{fam}';font-weight:{w};src:url(https://fonts.gstatic.com/local/{f}.ttf)}}"
    for fam, w, f in [
        ('Barlow', 400, 'Barlow-Regular'), ('Barlow', 500, 'Barlow-Medium'), ('Barlow', 600, 'Barlow-SemiBold'), ('Barlow', 700, 'Barlow-Bold'),
        ('Barlow Condensed', 500, 'BarlowCondensed-Medium'), ('Barlow Condensed', 600, 'BarlowCondensed-SemiBold'), ('Barlow Condensed', 700, 'BarlowCondensed-Bold'),
    ])

STUB = r"""
(()=>{
 const noop=()=>{};
 const snap={docs:[],exists:false,metadata:{fromCache:false},data:()=>({})};
 const chain=()=>new Proxy(function(){}, {get:(t,k)=>{
   if(k==='onSnapshot')return ()=>noop;
   if(k==='get')return ()=>Promise.resolve(snap);
   if(k==='set'||k==='update'||k==='delete'||k==='add')return ()=>Promise.resolve();
   if(k==='then')return undefined;
   return ()=>chain();}, apply:()=>chain()});
 window.firebase={initializeApp:noop,
  auth:Object.assign(()=>({languageCode:'',onAuthStateChanged:noop,signOut:noop,currentUser:null}),{GoogleAuthProvider:function(){}}),
  firestore:Object.assign(()=>{const c=chain();c.enablePersistence=()=>Promise.resolve();return c},{FieldValue:{serverTimestamp:noop,delete:noop,increment:noop,arrayUnion:noop,arrayRemove:noop}})};
 window.FIREBASE_CONFIG={apiKey:'demo',projectId:'demo'};
 try{localStorage.clear()}catch(e){}
})();
"""

SETUP = r"""
(()=>{
const DAYMS=864e5, now=Date.now(), ws=weekStart(now);
const AP={aluno:{tema:'escuro',cor:'amarelo'},personal:{tema:'escuro',cor:'amarelo'}};
const ex=(id,n,s,r,kg,desc=60,extra={})=>({id,n,s,r,kg,desc,tipo:'r',...extra});
const TA=[ex('a1','Agachamento livre',4,'8-10',60,90),ex('a2','Supino reto com barra',4,'8-10',45,90),ex('a3','Remada curvada',4,'10',40),ex('a4','Desenvolvimento com halteres',3,'12',14),ex('a5','Cadeira flexora',3,'12',35),ex('a6','Prancha',3,'30 s',0,45,{tipo:'t',hold:30})];
const TB=[ex('b1','Levantamento terra',4,'6-8',70,120),ex('b2','Supino inclinado com halteres',4,'10',18),ex('b3','Puxada frontal',4,'10-12',50),ex('b4','Afundo',3,'10',12),ex('b5','Elevação lateral',3,'15',8),ex('b6','Abdominal',3,'15',0,45)];
const TC=[ex('c1','Leg press',4,'10-12',160,90),ex('c2','Crucifixo com halteres',3,'12',12),ex('c3','Remada baixa',4,'10',45),ex('c4','Desenvolvimento na máquina',3,'10',30),ex('c5','Cadeira extensora',3,'12',40),ex('c6','Panturrilha em pé',4,'15',40,45)];
const F1={id:'F1',nome:'Full Body · Hipertrofia',alunoId:'A1',personalId:'P1',semanas:8,meta:3,criada:now-40*DAYMS,autor:'Carlos',
 treinos:[{id:'TA',nome:'Full Body A',dia:'Segunda',ex:TA},{id:'TB',nome:'Full Body B',dia:'Quarta',ex:TB},{id:'TC',nome:'Full Body C',dia:'Sexta',ex:TC}]};
// sessões: 6 semanas, 3 por semana (uma semana com 2), carga subindo; nesta semana seg e qua
const sess=[];let k=0;
for(let w=5;w>=0;w--){const base=ws-w*7*DAYMS;const dias=w===0?[0,2]:w===3?[0,4]:[0,2,4];
 dias.forEach((d,j)=>{const ti=(1+k++)%3,t=F1.treinos[ti],ini=base+d*DAYMS+7*3600e3+(j*7)%20*60e3,dur=(52+((w*7+d)%11))*60;
  const exs={};t.ex.forEach(e=>{const kg=e.kg?Math.max(2,e.kg-w*(e.kg>=40?2.5:1)):0;exs[e.id]={n:e.n,sets:Array.from({length:e.s},()=>e.tipo==='t'?{sec:30+(5-w)*3}:{kg,reps:10}),dor:null}});
  sess.push({id:'s'+k,alunoId:'A1',personalId:'P1',fichaId:'F1',treinoId:t.id,letra:'ABC'[ti],treinoNome:t.nome,inicio:ini,fim:ini+dur*1000,dur,ex:exs,dor24:'igual',feedback:{pse:6+((w+d)%3),txt:''}})})}
sess.sort((a,b)=>b.inicio-a.inicio);
S.me='A1';S.g=false;S.p=false;S.ready=true;S.cloud=true;S.needVerify=false;
S.perfis=[{id:'A1',nome:'Marina',email:'marina@exemplo.com',papel:'aluno',personalId:'P1',ativo:true,ativa:'F1',aceite:1,aparencia:AP,comunidades:['C1']},
 {id:'P1',nome:'Carlos',papel:'personal',personalId:'',ativo:true,aceite:1,aparencia:AP}];
S.pubs=[{id:'P1',nome:'Carlos Andrade',cref:'123456-G/SP',crefVerificado:false,publico:true}];
S.personais=S.pubs;
S.fichas=[F1];S.sessions=sess;S.vinculos=[];S.academias=[];
S.coms={};
window.__now=now;window.__ws=ws;window.__F1=F1;
})();
"""

COMS = r"""
(()=>{const now=Date.now(),ws=weekStart(now),DAYMS=864e5;
 const pl=(semN,mesN,seq)=>({sem:ws,semN,mes:mesKey(now),mesN,kmSem:0,kmMes:0,seq});
 S.coms={C1:{c:{id:'C1',nome:'Turma das 7h',desc:'Quem treina cedo na academia',cor:'amarelo',criadorId:'P1',criadorNome:'Carlos',codigo:'K7M2QX',aviso:'Desafio de novembro valendo! Bora fechar 12 treinos no mês 💪'},m:{id:'A1',status:'ativo',nome:'Marina',placar:pl(2,4,5)}}};
 COM.membros=[{id:'P1',nome:'Carlos',status:'ativo',placar:pl(3,5,9)},{id:'A1',nome:'Marina',status:'ativo',placar:pl(2,4,5)},{id:'U3',nome:'Rafael',status:'ativo',placar:pl(3,5,7)},{id:'U4',nome:'Júlia',status:'ativo',placar:pl(2,3,3)},{id:'U5',nome:'Tiago',status:'ativo',placar:pl(1,3,2)},{id:'U6',nome:'Bia',status:'ativo',placar:pl(3,4,4)}];
 COM.posts=[{id:'p1',autorId:'U3',autorNome:'Rafael',tipo:'checkin',texto:'Concluiu o treino B · 58 min',criado:now-25*60e3,reacoes:{A1:'🔥',U4:'💪',P1:'👏'}},
  {id:'p2',autorId:'U4',autorNome:'Júlia',tipo:'texto',texto:'Alguém vai amanhã às 7h? Quero companhia no leg day 😅',criado:now-2*3600e3,reacoes:{U5:'💪'}},
  {id:'p3',autorId:'A1',autorNome:'Marina',tipo:'checkin',texto:'Concluiu o treino A · 61 min',criado:now-26*3600e3,reacoes:{U3:'👏',U6:'🔥'}},
  {id:'p4',autorId:'P1',autorNome:'Carlos',tipo:'texto',texto:'Lembrando: aquecimento de 10 min antes do treino. Sem pular!',criado:now-2*DAYMS,reacoes:{}}];
 const ini=new Date(new Date(now).getFullYear(),new Date(now).getMonth(),1).getTime(),fim=new Date(new Date(now).getFullYear(),new Date(now).getMonth()+1,0).getTime();
 COM.desafios=[{id:'d1',titulo:'12 treinos em novembro',tipo:'treinos',meta:12,inicio:ini,fim},{id:'d2',titulo:'4 semanas cumprindo a meta',tipo:'semanas',meta:4,inicio:ini,fim:fim}];
 COM.prog={d1:{P1:{n:5},A1:{n:4},U3:{n:5},U4:{n:3},U5:{n:3},U6:{n:4}},d2:{P1:{n:1},A1:{n:1},U3:{n:1},U4:{n:0},U5:{n:0},U6:{n:1}}};
 COM.cur.key='C1|m';S.com='C1';
})();
"""

def run():
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, color_scheme='dark', service_workers='block')
        ctx.add_init_script(STUB)
        def fonts(route):
            u = route.request.url
            if 'fonts.googleapis.com' in u:
                return route.fulfill(status=200, content_type='text/css', body=FONT_CSS)
            if '/local/' in u:
                return route.fulfill(status=200, content_type='font/ttf', body=open(f"{FONTS}/{u.rsplit('/',1)[1]}", 'rb').read())
            return route.abort()
        ctx.route('**/fonts.googleapis.com/**', fonts)
        ctx.route('**/fonts.gstatic.com/**', fonts)
        ctx.route('**/www.gstatic.com/**', lambda r: r.abort())
        pg = ctx.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://127.0.0.1:8765/index.html')
        pg.wait_for_timeout(600)
        pg.evaluate(SETUP)

        def shot(name, js, wait=500, scroll=0):
            pg.evaluate(js)
            pg.evaluate(f'window.scrollTo(0,{scroll})')
            pg.wait_for_timeout(wait)
            pg.screenshot(path=f'{OUT}/{name}.png')

        shot('inicio', "()=>{S.view='inicio';render()}", 1500)
        shot('treinos', "()=>{S.view='fichas';S.tOpen='TC';render()}")
        # treino em execução: treino C, exercício 3 com duas séries feitas
        shot('treino', """()=>{const F=window.__F1,t=F.treinos[2],now=Date.now();
          S.active={id:'sX',alunoId:'A1',fichaId:'F1',treinoId:'TC',letra:'C',treinoNome:t.nome,exList:JSON.parse(JSON.stringify(t.ex)),inicio:now-23*60e3,idx:2,
           ex:{c1:{n:'Leg press',sets:[{kg:160,reps:12},{kg:160,reps:12},{kg:170,reps:10},{kg:170,reps:10}],dor:null},c2:{n:'Crucifixo com halteres',sets:[{kg:12,reps:12},{kg:12,reps:12},{kg:12,reps:11}],dor:null},c3:{n:'Remada baixa',sets:[{kg:45,reps:10},{kg:45,reps:10}],dor:null}},draft:{},skip:{},restEnd:null,holdEnd:null};
          S.view='treino';render()}""", 2500)
        shot('descanso', "()=>{const a=S.active;a.restEnd=Date.now()+38000;a.restTotal=60;a.restEx='c3';render()}", 1200)
        shot('progresso', "()=>{S.active=null;S.view='progresso';S.psub='graficos';render()}", 900)
        pg.evaluate(COMS)
        shot('com-mural', "()=>{S.view='comunidade';S.csub='mural';render()}", 900)
        shot('com-ranking', "()=>{S.csub='ranking';S.crk='mes';render()}")
        shot('com-desafios', "()=>{S.csub='desafios';render()}")
        # Personal
        shot('personal-alunos', """()=>{S.active=null;S.com=null;S.me='P1';S.p=true;S.modo='personal';
          const DAYMS=864e5,now=Date.now();
          const mk=(id,nome,fn)=>({id,nome,papel:'aluno',personalId:'P1',ativo:true,ativa:'F'+id,aceite:1,aparencia:ME&&S.perfis[0].aparencia});
          S.perfis=[{...S.perfis[1],id:'P1'},{...S.perfis[0]},mk('U3','Rafael'),mk('U4','Júlia'),mk('U5','Tiago')];
          ['U3','U4','U5'].forEach((u,i)=>{const f=JSON.parse(JSON.stringify(window.__F1));f.id='F'+u;f.alunoId=u;f.nome=['Hipertrofia 4x','Força e postura','Recomeço leve'][i];S.fichas.push(f)});
          const base=S.sessions.filter(s=>s.alunoId==='A1');
          [['U3',[0,1,3]],['U4',[0,2]],['U5',[]]].forEach(([u,ds])=>ds.forEach((d,j)=>{const s=JSON.parse(JSON.stringify(base[j]));s.id=u+d;s.alunoId=u;s.fichaId='F'+u;s.inicio=weekStart(now)+d*DAYMS+8*3600e3;s.fim=s.inicio+3500e3;S.sessions.push(s)}));
          S.sessions.forEach(s=>{if(s.alunoId==='U5'){}});sortS();
          const t=window.__F1.treinos[1];
          const est={id:'sY',alunoId:'U3',fichaId:'FU3',treinoId:'TB',letra:'B',treinoNome:t.nome,exList:t.ex,inicio:now-18*60e3,idx:2,ex:{b1:{n:'Levantamento terra',sets:[{kg:80,reps:8},{kg:80,reps:8},{kg:85,reps:6},{kg:85,reps:6}]},b2:{n:'Supino inclinado',sets:[{kg:20,reps:10},{kg:20,reps:10},{kg:20,reps:9},{kg:20,reps:9}]},b3:{n:'Puxada frontal',sets:[{kg:55,reps:12}]}},draft:{},skip:{},restEnd:now+41000,restTotal:60};
          S.and={U3:{alunoId:'U3',personalId:'P1',sessId:'sY',controle:'U3',controleNome:'Rafael',letra:'B',feitos:2,total:6,atualizado:now,inicio:est.inicio,estado:JSON.stringify(est)}};
          S.view='alunos';render()}""", 1200, 700)
        shot('ia', """()=>{S.me='A1';S.p=false;S.modo='aluno';iaNovo('A1','fichas');S.ia.etapa='colar';
          S.ia.texto=`FICHA: Hipertrofia 3x por semana
TREINO A: Inferiores e empurrar
- Agachamento livre | 4x8-10 | descanso 90s |
- Supino reto com barra | 4x8-10 | descanso 90s |
- Leg press | 3x12 | descanso 60s |
- Desenvolvimento com halteres | 3x12 | descanso 60s |
- Prancha | 3x40s | descanso 45s |
TREINO B: Superiores e puxar
- Levantamento terra | 4x6 | descanso 120s |
- Puxada frontal | 4x10-12 | descanso 60s |`;
          S.view='ia';render()}""", 900)
        shot('personal-junto', "()=>{S.me='P1';S.p=true;S.modo='personal';S.ia=null;S.view='aluno';S.sel='U3';S.sub='fichas';render()}", 900)
        print('erros:', errs[:8])
        b.close()

run()
