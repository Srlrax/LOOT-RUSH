import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
export function createEnemies(scene){
 const enemies=[],spots=[[-10,10],[11,12],[-24,-5],[25,4],[7,32],[-34,25],[34,-32],[-38,-29]];
 spots.forEach((pos,i)=>{
  const g=new THREE.Group();g.position.set(pos[0],0,pos[1]);
  const skin=new THREE.MeshStandardMaterial({color:[0x788c59,0x87906b,0x697d50][i%3],roughness:1});
  const shadow=new THREE.MeshStandardMaterial({color:0x3d4938,roughness:1});
  const cloth=new THREE.MeshStandardMaterial({color:i%2?0x4b5549:0x57443c,roughness:1});
  const eye=new THREE.MeshStandardMaterial({color:0xffb34c,emissive:0xff6b19,emissiveIntensity:1.8});
  const add=(p,geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;};
  const torso=add(g,new THREE.CapsuleGeometry(.32,.66,5,12),cloth,0,1.13,0);torso.rotation.x=-.12;
  const chest=add(g,new THREE.SphereGeometry(.34,16,12),skin,0,1.48,.015);chest.scale.set(1,.85,.8);
  const head=add(g,new THREE.SphereGeometry(.27,18,14),skin,0,1.94,.04);head.scale.set(1.05,1.1,.95);
  add(g,new THREE.BoxGeometry(.18,.07,.08),shadow,0,1.78,.27);
  for(const s of [-1,1]){
   add(g,new THREE.SphereGeometry(.052,10,8),eye,s*.11,1.98,.285);
   const ear=add(g,new THREE.ConeGeometry(.075,.2,6),shadow,s*.25,2.12,.01);ear.rotation.z=s*.7;
  }
  const arms=[],legs=[];
  for(const s of [-1,1]){
   const arm=new THREE.Group();arm.position.set(s*.39,1.55,0);g.add(arm);arms.push(arm);
   add(arm,new THREE.CapsuleGeometry(.105,.36,4,9),skin,0,-.2,0);
   add(arm,new THREE.SphereGeometry(.105,10,8),shadow,0,-.42,.02);
   add(arm,new THREE.CapsuleGeometry(.085,.3,4,9),skin,0,-.58,.02);
   add(arm,new THREE.SphereGeometry(.105,10,8),shadow,0,-.78,.05);
   const leg=new THREE.Group();leg.position.set(s*.17,.77,0);g.add(leg);legs.push(leg);
   add(leg,new THREE.CapsuleGeometry(.12,.36,4,9),cloth,0,-.2,0);
   add(leg,new THREE.CapsuleGeometry(.09,.31,4,9),skin,0,-.57,.02);
   add(leg,new THREE.BoxGeometry(.23,.13,.34),shadow,0,-.78,.1);
  }
  // torn shoulder scraps and uneven silhouette
  const rag=add(g,new THREE.ConeGeometry(.2,.48,5),cloth,-.43,1.15,-.02);rag.rotation.z=.5;
  scene.add(g);enemies.push({group:g,health:65,maxHealth:65,alive:true,attack:0,respawn:0,phase:i,arms,legs,walk:0});
 });
 return enemies;
}
export function updateEnemies(enemies,player,dt){
 for(const e of enemies){
  if(!e.alive){e.respawn-=dt;if(e.respawn<=0){e.alive=true;e.health=e.maxHealth;e.group.visible=true;}continue;}
  const dx=player.root.position.x-e.group.position.x,dz=player.root.position.z-e.group.position.z,dist=Math.hypot(dx,dz),chasing=dist<22&&dist>1.55;
  if(chasing){e.group.position.x+=dx/dist*2.35*dt;e.group.position.z+=dz/dist*2.35*dt;e.group.rotation.y=Math.atan2(dx,dz);e.walk+=dt*8;}
  const stride=chasing?Math.sin(e.walk)*.56:Math.sin(performance.now()*.001+e.phase)*.035;
  e.legs[0].rotation.x=stride;e.legs[1].rotation.x=-stride;e.arms[0].rotation.x=-stride*.7-.24;e.arms[1].rotation.x=stride*.7-.24;
  e.group.position.y=Math.sin(performance.now()*.002+e.phase)*.025;e.attack=Math.max(0,e.attack-dt);
  if(dist<1.85&&e.attack<=0&&player.hitCooldown<=0){player.health=Math.max(0,player.health-9);player.hitCooldown=1;e.attack=1.35;}
 }
}
export function hitEnemy(enemy,damage){if(!enemy||!enemy.alive)return false;enemy.health-=damage;if(enemy.health<=0){enemy.alive=false;enemy.group.visible=false;enemy.respawn=14;return true;}return false;}
