import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
export function createEnemies(scene){
 const enemies=[];const positions=[[-10,10],[11,12],[-24,-5],[25,4],[7,32],[-34,25],[34,-32]];
 positions.forEach((p,i)=>{const g=new THREE.Group();g.position.set(p[0],0,p[1]);const bodyMat=new THREE.MeshStandardMaterial({color:i%3===0?0x668b59:0x7b6554,roughness:.9});const dark=new THREE.MeshStandardMaterial({color:0x28332c});
 const body=new THREE.Mesh(new THREE.SphereGeometry(.62,16,12),bodyMat);body.position.y=.85;body.scale.set(.85,1.1,.75);body.castShadow=true;g.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.4,16,12),bodyMat);head.position.y=1.65;head.castShadow=true;g.add(head);
 for(const s of [-1,1]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.065,8,8),new THREE.MeshStandardMaterial({color:0xffd27a,emissive:0xff8a24,emissiveIntensity:.5}));eye.position.set(s*.15,1.7,.34);g.add(eye);}
 const armGeo=new THREE.CapsuleGeometry(.12,.5,4,8);for(const s of [-1,1]){const a=new THREE.Mesh(armGeo,dark);a.position.set(s*.65,.85,0);a.rotation.z=s*.35;a.castShadow=true;g.add(a);}
 scene.add(g);enemies.push({group:g,health:50,maxHealth:50,alive:true,attack:0,respawn:0,phase:i});});return enemies;
}
export function updateEnemies(enemies,player,dt){
 for(const e of enemies){if(!e.alive){e.respawn-=dt;if(e.respawn<=0){e.alive=true;e.health=e.maxHealth;e.group.visible=true;}continue;}
 const dx=player.root.position.x-e.group.position.x,dz=player.root.position.z-e.group.position.z,dist=Math.hypot(dx,dz);
 if(dist<15&&dist>1.45){e.group.position.x+=dx/dist*2.3*dt;e.group.position.z+=dz/dist*2.3*dt;e.group.rotation.y=Math.atan2(dx,dz);}
 e.attack=Math.max(0,e.attack-dt);
 if(dist<1.8&&e.attack<=0&&player.hitCooldown<=0){player.health=Math.max(0,player.health-8);player.hitCooldown=1;e.attack=1.4;}
 e.group.position.y=Math.sin(performance.now()*.002+e.phase)*.06;
 }
}
export function hitEnemy(enemy,damage){
 if(!enemy||!enemy.alive)return false;enemy.health-=damage;
 if(enemy.health<=0){enemy.alive=false;enemy.group.visible=false;enemy.respawn=12;return true;}return false;
}
