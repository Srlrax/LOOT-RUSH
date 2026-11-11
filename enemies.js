import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function createEnemies(scene){
 const enemies=[];
 const positions=[[-10,10],[11,12],[-24,-5],[25,4],[7,32],[-34,25],[34,-32]];
 positions.forEach((p,i)=>{
  const g=new THREE.Group();
  g.position.set(p[0],0,p[1]);
  const skin=new THREE.MeshStandardMaterial({color:i%3===0?0x718b55:0x87916a,roughness:1});
  const rotten=new THREE.MeshStandardMaterial({color:0x4d5940,roughness:1});
  const cloth=new THREE.MeshStandardMaterial({color:i%2?0x55443c:0x3d5147,roughness:1});
  const eyeMat=new THREE.MeshStandardMaterial({color:0xffb34c,emissive:0xff6b19,emissiveIntensity:1.5});
  const add=(geo,mat,x,y,z,parent=g)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  // Bent, hunched humanoid silhouette with separate articulated limbs.
  const torso=add(new THREE.CapsuleGeometry(.34,.72,5,10),cloth,0,1.12,0);torso.rotation.x=-.13;
  const chest=add(new THREE.SphereGeometry(.36,14,12),skin,0,1.48,.02);chest.scale.set(1,.8,.8);
  const head=add(new THREE.SphereGeometry(.29,16,12),skin,0,1.94,.04);head.scale.set(1.05,1.12,.95);
  add(new THREE.ConeGeometry(.11,.24,6),rotten,-.19,2.17,.02);
  add(new THREE.ConeGeometry(.09,.2,6),rotten,.18,2.16,.02);
  for(const s of [-1,1]){
   add(new THREE.SphereGeometry(.055,8,8),eyeMat,s*.115,1.98,.29);
   add(new THREE.CapsuleGeometry(.105,.48,4,8),skin,s*.49,1.15,.02).rotation.z=s*.35;
  }
  const arms=[];
  for(const s of [-1,1]){
   const arm=new THREE.Group();arm.position.set(s*.38,1.53,0);g.add(arm);
   const upper=add(new THREE.CapsuleGeometry(.105,.34,4,8),skin,0,-.2,0,arm);
   const elbow=add(new THREE.SphereGeometry(.105,10,8),rotten,0,-.4,.015,arm);
   const fore=add(new THREE.CapsuleGeometry(.085,.32,4,8),skin,0,-.57,.02,arm);
   const hand=add(new THREE.SphereGeometry(.11,10,8),rotten,0,-.78,.04,arm);
   arm.rotation.z=s*.18;arms.push(arm);
  }
  const legs=[];
  for(const s of [-1,1]){
   const leg=new THREE.Group();leg.position.set(s*.17,.78,0);g.add(leg);
   add(new THREE.CapsuleGeometry(.12,.38,4,8),cloth,0,-.2,0,leg);
   add(new THREE.SphereGeometry(.12,10,8),rotten,0,-.43,.02,leg);
   add(new THREE.CapsuleGeometry(.09,.34,4,8),skin,0,-.61,.015,leg);
   add(new THREE.BoxGeometry(.22,.13,.34),rotten,0,-.82,.09,leg);
   legs.push(leg);
  }
  scene.add(g);
  enemies.push({group:g,health:50,maxHealth:50,alive:true,attack:0,respawn:0,phase:i,arms,legs,walk:0});
 });
 return enemies;
}
export function updateEnemies(enemies,player,dt){
 for(const e of enemies){
  if(!e.alive){e.respawn-=dt;if(e.respawn<=0){e.alive=true;e.health=e.maxHealth;e.group.visible=true;}continue;}
  const dx=player.root.position.x-e.group.position.x,dz=player.root.position.z-e.group.position.z,dist=Math.hypot(dx,dz);
  const chasing=dist<18&&dist>1.5;
  if(chasing){
   const vx=dx/dist,vz=dz/dist;
   e.group.position.x+=vx*2.15*dt;e.group.position.z+=vz*2.15*dt;
   e.group.rotation.y=Math.atan2(vx,vz);
   e.walk+=dt*8;
  }
  const stride=chasing?Math.sin(e.walk)*.55:Math.sin(performance.now()*.0015+e.phase)*.035;
  e.legs[0].rotation.x=stride;e.legs[1].rotation.x=-stride;
  e.arms[0].rotation.x=-stride*.7-.2;e.arms[1].rotation.x=stride*.7-.2;
  e.group.position.y=Math.sin(performance.now()*.002+e.phase)*.025;
  e.attack=Math.max(0,e.attack-dt);
  if(dist<1.9&&e.attack<=0&&player.hitCooldown<=0){player.health=Math.max(0,player.health-8);player.hitCooldown=1;e.attack=1.4;}
 }
}
export function hitEnemy(enemy,damage){
 if(!enemy||!enemy.alive)return false;
 enemy.health-=damage;
 if(enemy.health<=0){enemy.alive=false;enemy.group.visible=false;enemy.respawn=12;return true;}
 return false;
}
