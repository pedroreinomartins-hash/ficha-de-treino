/* Modelos básicos do app: disponíveis para todos em "Nova ficha → Começar com".
   Descanso sugerido: 60 s nos compostos e 45 s nos isoladores. */
const MB=(n,s,r,tipo,o={})=>({n,s,r,tipo,desc:tipo==='c'?60:45,...o});
const PRANCHA=MB('Prancha',3,'30 s','t',{hold:30});
const BASICOS=[
 {id:'b:fullbody',nome:'Full Body básico',meta:3,desc:'1 treino de corpo inteiro, repetido 3 vezes por semana.',treinos:[
  {nome:'Corpo inteiro',ex:[MB('Agachamento livre',3,'10-12','c'),MB('Supino reto com halteres',3,'10-12','c'),MB('Puxada alta pela frente',3,'10-12','c'),MB('Leg press 45°',3,'12','c'),MB('Desenvolvimento com halteres (sentado)',3,'10-12','c'),MB('Remada baixa',3,'10-12','c'),MB('Mesa flexora',3,'12','i'),PRANCHA]}]},
 {id:'b:fullbody-ab',nome:'Full Body A/B',meta:3,desc:'2 treinos de corpo inteiro alternados (A, B, A…), 3 ou 4 vezes por semana.',treinos:[
  {nome:'Full Body A',ex:[MB('Agachamento livre',3,'8-10','c'),MB('Supino reto com barra',3,'8-10','c'),MB('Remada curvada',3,'8-10','c'),MB('Elevação lateral',3,'12-15','i'),MB('Tríceps corda',3,'12','i'),MB('Panturrilha em pé',3,'15','i'),MB('Abdominal supra',3,'15','i')]},
  {nome:'Full Body B',ex:[MB('Stiff com halteres',3,'10','c'),MB('Leg press 45°',3,'12','c'),MB('Puxada alta pela frente',3,'10-12','c'),MB('Supino inclinado com halteres',3,'10-12','c'),MB('Desenvolvimento com halteres (sentado)',3,'10','c'),MB('Rosca direta',3,'12','i'),PRANCHA]}]},
 {id:'b:sup-inf',nome:'Superior e Inferior',meta:4,desc:'A: membros superiores · B: membros inferiores, alternados 4 vezes por semana.',treinos:[
  {nome:'Superior',ex:[MB('Supino reto com barra',4,'8-10','c'),MB('Remada curvada',4,'8-10','c'),MB('Desenvolvimento com halteres (sentado)',3,'10','c'),MB('Puxada alta pela frente',3,'10-12','c'),MB('Elevação lateral',3,'12-15','i'),MB('Rosca direta',3,'12','i'),MB('Tríceps corda',3,'12','i')]},
  {nome:'Inferior',ex:[MB('Agachamento livre',4,'8-10','c'),MB('Leg press 45°',3,'12','c'),MB('Stiff com halteres',3,'10','c'),MB('Cadeira extensora',3,'12-15','i'),MB('Mesa flexora',3,'12','i'),MB('Hip thrust',3,'10-12','c'),MB('Panturrilha em pé',4,'15','i'),PRANCHA]}]},
 {id:'b:abc',nome:'ABC clássico',meta:3,desc:'A: peito, ombros e tríceps · B: dorsal (costas) e bíceps · C: pernas e glúteos. Faça 3 ou 6 vezes por semana.',treinos:[
  {nome:'Peito, ombros e tríceps',ex:[MB('Supino reto com barra',4,'8-10','c'),MB('Supino inclinado com halteres',3,'10-12','c'),MB('Crucifixo na polia',3,'12-15','i'),MB('Desenvolvimento com halteres (sentado)',3,'10','c'),MB('Elevação lateral',3,'12-15','i'),MB('Tríceps corda',3,'12','i'),MB('Tríceps francês',3,'10-12','i')]},
  {nome:'Dorsal e bíceps',ex:[MB('Puxada alta pela frente',4,'10-12','c'),MB('Remada baixa',3,'10-12','c'),MB('Remada unilateral',3,'10','c'),MB('Pulldown com braços estendidos',3,'12','i'),MB('Face pull',3,'15','i'),MB('Rosca direta',3,'10-12','i'),MB('Rosca martelo',3,'12','i')]},
  {nome:'Pernas e glúteos',ex:[MB('Agachamento livre',4,'8-10','c'),MB('Leg press 45°',3,'12','c'),MB('Cadeira extensora',3,'12-15','i'),MB('Mesa flexora',3,'12','i'),MB('Hip thrust',3,'10-12','c'),MB('Cadeira abdutora',3,'15','i'),MB('Panturrilha em pé',4,'15','i')]}]},
 {id:'b:iniciante',nome:'Iniciante 2x por semana',meta:2,desc:'2 treinos simples, com máquinas, para quem está começando.',treinos:[
  {nome:'Iniciante A',ex:[MB('Leg press 45°',3,'12','c'),MB('Supino máquina',3,'12','c'),MB('Puxada alta pela frente',3,'12','c'),MB('Cadeira extensora',3,'12','i'),MB('Elevação lateral',2,'12','i'),MB('Prancha',2,'20 s','t',{hold:20})]},
  {nome:'Iniciante B',ex:[MB('Mesa flexora',3,'12','i'),MB('Remada articulada',3,'12','c'),MB('Desenvolvimento na máquina',3,'12','c'),MB('Cadeira abdutora',3,'15','i'),MB('Rosca direta',2,'12','i'),MB('Tríceps na polia',2,'12','i'),MB('Abdominal supra',2,'15','i')]}]}
].map(b=>({...b,semanas:8,mig1:1,basico:true,treinos:b.treinos.map((t,i)=>({id:'t'+i,dia:'',...t,ex:t.ex.map((e,j)=>({id:'e'+i+'-'+j,...e}))}))}));
const basico=id=>BASICOS.find(b=>b.id===id)||null;
