import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function createPlayer(scene) {
  const root=new THREE.Group();
  const armor=new THREE.MeshStandardMaterial({color:0x344b59,roughness:.42,metalness:.38});
  const brightArmor=new THREE.MeshStandardMaterial({color:0x526d7a,roughness:.38,metalness:.48});
  const trim=new THREE.MeshStandardMaterial({color:0xe0b45b,metalness:.72,roughness:.26});
  const dark=new THREE.MeshStandardMaterial({color:0x202b31,roughness:.72});
  const cloth=new THREE.MeshStandardMaterial({color:0x8b3f32,roughness:.9});
  const skin=new THREE.MeshStandardMaterial({color:0xc99570,roughness:.82});
  const glow=new THREE.MeshStandardMaterial({color:0x8ce4ff,emissive:0x269aca,emissiveIntensity:1.1,metalness:.25});
  const add=(geo,mat,x,y,z,parent=root)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const box=(w,h,d,mat,x,y,z,parent=root)=>add(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent);
  const sphere=(r,mat,x,y,z,parent=root)=>add(new THREE.SphereGeometry(r,20,16),mat,x,y,z,parent);
  const capsule=(radius,length,mat,x,y,z,parent=root)=>add(new THREE.CapsuleGeometry(radius,length,5,12),mat,x,y,z,parent);

  // Cloth silhouette and layered torso armor
  const cape=box(.72,.95,.12,cloth,0,1.12,-.29);cape.rotation.x=-.08;
  capsule(.31,.48,dark,0,1.24,0);
  const chest=add(new THREE.SphereGeometry(1,24,18),armor,0,1.34,0);chest.scale.set(.43,.43,.27);
  const chestPlate=box(.53,.42,.075,brightArmor,0,1.39,.235);chestPlate.rotation.x=-.08;
  box(.42,.055,.09,trim,0,1.62,.24);
  box(.48,.09,.09,trim,0,1.08,.22);
  sphere(.09,glow,0,1.39,.29);

  // Head, closed helmet, brow and visor
  capsule(.16,.13,skin,0,1.82,0);
  sphere(.245,armor,0,2.02,0);
  const helmetTop=add(new THREE.SphereGeometry(.27,24,16,0,Math.PI*2,0,Math.PI*.62),brightArmor,0,2.07,0);
  box(.48,.075,.34,trim,0,1.99,.025);
  box(.35,.105,.055,dark,0,1.94,.245);
  box(.22,.035,.025,glow,0,1.94,.28);
  // Side helmet guards
  for(const s of [-1,1]){const guard=box(.11,.27,.25,armor,s*.235,1.94,0);guard.rotation.z=s*.12;}

  // Shoulder pauldrons, articulated arms, bracers and gloves
  const arms=[],legs=[];
  for(const s of [-1,1]){
    const arm=new THREE.Group();arm.position.set(s*.43,1.52,0);root.add(arm);
    const upper=capsule(.115,.32,brightArmor,0,-.19,0,arm);
    const shoulder=sphere(.19,armor,s*.025,-.015,0,arm);shoulder.scale.set(1,.78,1);
    const pauldron=add(new THREE.SphereGeometry(.18,16,12),brightArmor,s*.02,.015,.035,arm);pauldron.scale.set(1,.65,1);
    const band=box(.23,.065,.22,trim,0,-.36,.015,arm);
    capsule(.105,.22,armor,0,-.48,.015,arm);
    sphere(.105,dark,0,-.65,.035,arm);
    arms.push(arm);

    const leg=new THREE.Group();leg.position.set(s*.19,.86,0);root.add(leg);
    capsule(.135,.31,dark,0,-.19,0,leg);
    const knee=sphere(.145,brightArmor,0,-.37,.045,leg);
    capsule(.115,.22,armor,0,-.52,.015,leg);
    const boot=box(.29,.17,.4,dark,0,-.69,.09,leg);boot.rotation.x=-.04;
    box(.28,.045,.36,trim,0,-.61,.09,leg);
    legs.push(leg);
  }
  // Belt and small side pouch
  box(.62,.12,.35,dark,0,.99,0);
  box(.13,.14,.08,trim,0,.99,.2);
  box(.16,.19,.18,cloth,-.37,.98,0);

  // Sword sits in the right hand and swings during attacks
  const sword=new THREE.Group();sword.position.set(.52,1.08,.13);root.add(sword);
  const grip=box(.085,.27,.09,dark,0,.02,0,sword);
  const guard=box(.34,.075,.12,trim,0,.17,0,sword);
  const blade=add(new THREE.BoxGeometry(.105,.72,.045),brightArmor,0,.56,0,sword);
  blade.rotation.z=-.035;
  const tip=add(new THREE.ConeGeometry(.075,.18,4),brightArmor,0,1.01,0,sword);tip.rotation.z=Math.PI;
  box(.14,.06,.11,trim,0,-.12,0,sword);
  scene.add(root);
  return {root,arms,legs,sword,health:100,maxHealth:100,damage:20,speed:6,attackCooldown:0,hitCooldown:0,xp:0,level:1,walkTime:0};
}

export function updatePlayer(player,dt,input,camera,scene){
  const dir=new THREE.Vector3();
  if(input.forward)dir.z-=1;if(input.backward)dir.z+=1;if(input.left)dir.x-=1;if(input.right)dir.x+=1;
  const moving=dir.lengthSq()>0;
  if(moving){
    dir.normalize();
    const angle=Math.atan2(dir.x,dir.z);
    player.root.rotation.y=THREE.MathUtils.lerp(player.root.rotation.y,angle,Math.min(1,dt*12));
    player.root.position.addScaledVector(dir,player.speed*dt);
    player.walkTime+=dt*9;
    const swing=Math.sin(player.walkTime)*.48;
    player.legs[0].rotation.x=swing;player.legs[1].rotation.x=-swing;
    player.arms[0].rotation.x=-swing*.55;player.arms[1].rotation.x=swing*.55;
  }else{
    player.legs.forEach(l=>l.rotation.x=THREE.MathUtils.damp(l.rotation.x,0,10,dt));
    player.arms.forEach(a=>a.rotation.x=THREE.MathUtils.damp(a.rotation.x,0,10,dt));
  }
  player.root.position.x=THREE.MathUtils.clamp(player.root.position.x,-47,47);
  player.root.position.z=THREE.MathUtils.clamp(player.root.position.z,-47,47);
  const target=new THREE.Vector3(player.root.position.x,player.root.position.y+3.25,player.root.position.z+7.2);
  camera.position.lerp(target,1-Math.exp(-4.5*dt));
  camera.lookAt(player.root.position.x,player.root.position.y+1.05,player.root.position.z);
  player.attackCooldown=Math.max(0,player.attackCooldown-dt);
  player.hitCooldown=Math.max(0,player.hitCooldown-dt);
  player.sword.rotation.z=THREE.MathUtils.damp(player.sword.rotation.z,0,12,dt);
}
