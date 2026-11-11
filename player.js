import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function createPlayer(scene) {
  const root = new THREE.Group();
  const armor = new THREE.MeshStandardMaterial({color:0x344b59,roughness:.42,metalness:.38});
  const bright = new THREE.MeshStandardMaterial({color:0x526d7a,roughness:.38,metalness:.48});
  const gold = new THREE.MeshStandardMaterial({color:0xe0b45b,metalness:.72,roughness:.26});
  const dark = new THREE.MeshStandardMaterial({color:0x202b31,roughness:.72});
  const cloth = new THREE.MeshStandardMaterial({color:0x8b3f32,roughness:.9});
  const glow = new THREE.MeshStandardMaterial({color:0x8ce4ff,emissive:0x269aca,emissiveIntensity:1.1});
  const add=(geo,mat,x,y,z,parent=root)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
  const box=(w,h,d,mat,x,y,z,parent=root)=>add(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent);
  const capsule=(r,l,mat,x,y,z,parent=root)=>add(new THREE.CapsuleGeometry(r,l,5,12),mat,x,y,z,parent);
  const sphere=(r,mat,x,y,z,parent=root)=>add(new THREE.SphereGeometry(r,20,16),mat,x,y,z,parent);

  // Cape and torso
  const cape=box(.72,.98,.12,cloth,0,1.12,-.29);cape.rotation.x=-.08;
  capsule(.31,.48,dark,0,1.24,0);
  const chest=sphere(.43,armor,0,1.34,0);chest.scale.set(1,.98,.63);
  box(.53,.42,.075,bright,0,1.39,.235);
  box(.42,.055,.09,gold,0,1.62,.24);
  box(.48,.09,.09,gold,0,1.08,.22);
  sphere(.09,glow,0,1.39,.29);

  // Helmet and visor
  sphere(.245,armor,0,2.02,0);
  const crown=add(new THREE.SphereGeometry(.27,24,16,0,Math.PI*2,0,Math.PI*.62),bright,0,2.07,0);
  box(.48,.075,.34,gold,0,1.99,.025);
  box(.35,.105,.055,dark,0,1.94,.245);
  box(.22,.035,.025,glow,0,1.94,.28);
  for(const s of [-1,1]){const guard=box(.11,.27,.25,armor,s*.235,1.94,0);guard.rotation.z=s*.12;}

  const arms=[],legs=[];
  for(const s of [-1,1]){
    const arm=new THREE.Group();arm.position.set(s*.43,1.52,0);root.add(arm);
    const pauldron=sphere(.18,bright,s*.02,.015,.035,arm);pauldron.scale.set(1,.65,1);
    capsule(.115,.32,bright,0,-.19,0,arm);
    box(.23,.065,.22,gold,0,-.36,.015,arm);
    capsule(.105,.22,armor,0,-.48,.015,arm);
    sphere(.105,dark,0,-.65,.035,arm);
    arms.push(arm);

    const leg=new THREE.Group();leg.position.set(s*.19,.86,0);root.add(leg);
    capsule(.135,.31,dark,0,-.19,0,leg);
    sphere(.145,bright,0,-.37,.045,leg);
    capsule(.115,.22,armor,0,-.52,.015,leg);
    box(.29,.17,.4,dark,0,-.69,.09,leg);
    box(.28,.045,.36,gold,0,-.61,.09,leg);
    legs.push(leg);
  }
  box(.62,.12,.35,dark,0,.99,0);
  box(.13,.14,.08,gold,0,.99,.2);
  box(.16,.19,.18,cloth,-.37,.98,0);

  // Sword is parented to the right hand so the whole arm drives its swing.
  const sword=new THREE.Group();sword.position.set(0,-.68,.08);arms[1].add(sword);
  box(.085,.27,.09,dark,0,-.02,0,sword);
  box(.34,.075,.12,gold,0,.17,0,sword);
  const blade=box(.105,.72,.045,bright,0,.56,0,sword);blade.rotation.z=-.035;
  const tip=add(new THREE.ConeGeometry(.075,.18,4),bright,0,1.01,0,sword);tip.rotation.z=Math.PI;
  box(.14,.06,.11,gold,0,-.12,0,sword);

  scene.add(root);
  return {root,arms,legs,sword,health:100,maxHealth:100,damage:20,speed:6,attackCooldown:0,hitCooldown:0,xp:0,level:1,walkTime:0,attackAnim:0,cameraYaw:0,cameraPitch:.22};
}

export function updatePlayer(player,dt,input,camera){
  const yaw=player.cameraYaw;
  const forward=new THREE.Vector3(Math.sin(yaw),0,-Math.cos(yaw));
  const right=new THREE.Vector3(Math.cos(yaw),0,Math.sin(yaw));
  const dir=new THREE.Vector3();
  if(input.forward)dir.add(forward);
  if(input.backward)dir.sub(forward);
  if(input.right)dir.add(right);
  if(input.left)dir.sub(right);
  const moving=dir.lengthSq()>.001;
  if(moving){
    dir.normalize();
    const angle=Math.atan2(dir.x,dir.z);
    player.root.rotation.y=THREE.MathUtils.lerp(player.root.rotation.y,angle,1-Math.exp(-14*dt));
    player.root.position.addScaledVector(dir,player.speed*dt);
    player.walkTime+=dt*10;
  }
  const stride=moving?Math.sin(player.walkTime):0;
  const blend=1-Math.exp(-12*dt);
  player.legs[0].rotation.x=THREE.MathUtils.lerp(player.legs[0].rotation.x,stride*.62,blend);
  player.legs[1].rotation.x=THREE.MathUtils.lerp(player.legs[1].rotation.x,-stride*.62,blend);
  player.arms[0].rotation.x=THREE.MathUtils.lerp(player.arms[0].rotation.x,-stride*.32,blend);
  if(player.attackAnim>0){
    player.attackAnim=Math.max(0,player.attackAnim-dt);
    const t=1-player.attackAnim/.34;
    const swing=Math.sin(Math.min(1,t)*Math.PI);
    player.arms[1].rotation.x=-1.65*swing;
    player.arms[1].rotation.z=-.7*swing;
  }else{
    player.arms[1].rotation.x=THREE.MathUtils.lerp(player.arms[1].rotation.x,stride*.32,blend);
    player.arms[1].rotation.z=THREE.MathUtils.lerp(player.arms[1].rotation.z,0,blend);
  }
  player.root.position.x=THREE.MathUtils.clamp(player.root.position.x,-47,47);
  player.root.position.z=THREE.MathUtils.clamp(player.root.position.z,-47,47);

  const distance=7.4*Math.cos(player.cameraPitch);
  const height=2.0+7.4*Math.sin(player.cameraPitch);
  const target=new THREE.Vector3(
    player.root.position.x+Math.sin(yaw)*distance,
    player.root.position.y+height,
    player.root.position.z+Math.cos(yaw)*distance
  );
  camera.position.lerp(target,1-Math.exp(-10*dt));
  camera.lookAt(player.root.position.x,player.root.position.y+1.15,player.root.position.z);
  player.attackCooldown=Math.max(0,player.attackCooldown-dt);
  player.hitCooldown=Math.max(0,player.hitCooldown-dt);
}
