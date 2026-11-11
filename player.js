import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function createPlayer(scene) {
  const root = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({color:0xe4b58d, roughness:.8});
  const armor = new THREE.MeshStandardMaterial({color:0x344b59, roughness:.55, metalness:.25});
  const trim = new THREE.MeshStandardMaterial({color:0xd9a94f, metalness:.65, roughness:.3});
  const dark = new THREE.MeshStandardMaterial({color:0x202b31, roughness:.8});
  const cloth = new THREE.MeshStandardMaterial({color:0x8b4e36, roughness:.9});
  const sphere = (r,mat,x,y,z, parent=root) => {const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m};
  const box = (w,h,d,mat,x,y,z,parent=root) => {const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m};
  box(.66,.72,.38,armor,0,1.25,0);
  box(.68,.13,.4,trim,0,1.62,0);
  box(.7,.16,.42,cloth,0,.83,0);
  sphere(.29,skin,0,1.95,0);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(.31,20,14,0,Math.PI*2,0,Math.PI*.62),armor);
  helmet.position.set(0,2.06,0);helmet.castShadow=true;root.add(helmet);
  box(.42,.08,.34,trim,0,1.98,.16);
  sphere(.045,new THREE.MeshStandardMaterial({color:0x79d5ff,emissive:0x2b9dcb,emissiveIntensity:.6}),-.1,1.96,.255);
  sphere(.045,new THREE.MeshStandardMaterial({color:0x79d5ff,emissive:0x2b9dcb,emissiveIntensity:.6}),.1,1.96,.255);
  const arms=[],legs=[];
  for(const side of [-1,1]){
    const arm=new THREE.Group();arm.position.set(side*.43,1.48,0);root.add(arm);
    const upper=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.42,4,8),armor);upper.position.y=-.22;upper.castShadow=true;arm.add(upper);
    const hand=sphere(.12,skin,0,-.51,0,arm);arms.push(arm);
    const leg=new THREE.Group();leg.position.set(side*.2,.78,0);root.add(leg);
    const thigh=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.42,4,8),dark);thigh.position.y=-.23;thigh.castShadow=true;leg.add(thigh);
    box(.28,.14,.43,dark,0,-.5,.07,leg);legs.push(leg);
  }
  const sword=new THREE.Group();sword.position.set(.53,1.12,.12);root.add(sword);
  const blade=box(.09,.72,.055,trim,0,.38,0,sword);blade.rotation.z=-.12;
  box(.34,.08,.12,dark,0,.03,0,sword);
  scene.add(root);
  return {root,arms,legs,sword,health:100,maxHealth:100,damage:20,speed:6,attackCooldown:0,hitCooldown:0,xp:0,level:1,walkTime:0};
}

export function updatePlayer(player, dt, input, camera, scene) {
  const dir=new THREE.Vector3();
  if(input.forward)dir.z-=1;if(input.backward)dir.z+=1;if(input.left)dir.x-=1;if(input.right)dir.x+=1;
  const moving=dir.lengthSq()>0;
  if(moving){
    dir.normalize();
    const angle=Math.atan2(dir.x,dir.z);
    player.root.rotation.y=THREE.MathUtils.lerp(player.root.rotation.y,angle,Math.min(1,dt*12));
    player.root.position.addScaledVector(dir,player.speed*dt);
    player.walkTime+=dt*10;
    const swing=Math.sin(player.walkTime)*.55;
    player.legs[0].rotation.x=swing;player.legs[1].rotation.x=-swing;
    player.arms[0].rotation.x=-swing*.65;player.arms[1].rotation.x=swing*.65;
  } else {
    player.legs.forEach(l=>l.rotation.x=THREE.MathUtils.damp(l.rotation.x,0,10,dt));
    player.arms.forEach(a=>a.rotation.x=THREE.MathUtils.damp(a.rotation.x,0,10,dt));
  }
  player.root.position.x=THREE.MathUtils.clamp(player.root.position.x,-47,47);
  player.root.position.z=THREE.MathUtils.clamp(player.root.position.z,-47,47);
  const target=new THREE.Vector3(player.root.position.x,player.root.position.y+3.3,player.root.position.z+7.5);
  camera.position.lerp(target,1-Math.exp(-4*dt));
  camera.lookAt(player.root.position.x,player.root.position.y+1,player.root.position.z);
  player.attackCooldown=Math.max(0,player.attackCooldown-dt);
  player.hitCooldown=Math.max(0,player.hitCooldown-dt);
  player.sword.rotation.z=THREE.MathUtils.damp(player.sword.rotation.z,0,12,dt);
}
