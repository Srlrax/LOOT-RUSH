import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function createPlayer(scene){
 const root=new THREE.Group();
 const mat=(color,metalness=.1,roughness=.7)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const steel=mat(0x344e60,.62,.34),edge=mat(0x91a9b4,.72,.28),gold=mat(0xd9a64f,.72,.25),dark=mat(0x202b32,.2,.8),leather=mat(0x713d2e),glow=mat(0x77dcff,.3,.2);
 const add=(parent,geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
 const box=(p,w,h,d,m,x,y,z)=>add(p,new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const ball=(p,r,m,x,y,z)=>add(p,new THREE.SphereGeometry(r,18,14),m,x,y,z);
 const capsule=(p,r,l,m,x,y,z)=>add(p,new THREE.CapsuleGeometry(r,l,5,12),m,x,y,z);
 // boots, legs and belt
 box(root,.62,.15,.34,dark,0,.91,0);box(root,.55,.13,.34,gold,0,.99,.02);
 const legs=[],arms=[];
 for(const s of [-1,1]){
  const leg=new THREE.Group();leg.position.set(s*.19,.88,0);root.add(leg);legs.push(leg);
  capsule(leg,.135,.35,steel,0,-.2,0);ball(leg,.145,edge,0,-.39,.02);
  capsule(leg,.105,.22,dark,0,-.53,.02);box(leg,.29,.16,.4,dark,0,-.68,.1);
  box(leg,.29,.045,.35,gold,0,-.59,.12);
 }
 // torso and layered breastplate
 const torso=capsule(root,.32,.55,dark,0,1.34,0);torso.scale.set(1.18,1, .8);
 const chest=add(root,new THREE.SphereGeometry(.38,22,16),steel,0,1.45,.02);chest.scale.set(1,.92,.72);
 box(root,.54,.38,.09,edge,0,1.43,.245);
 box(root,.44,.07,.1,gold,0,1.65,.27);box(root,.48,.09,.1,gold,0,1.12,.22);
 ball(root,.085,glow,0,1.44,.31);
 // shoulder guards and articulated arms
 for(const s of [-1,1]){
  const arm=new THREE.Group();arm.position.set(s*.44,1.57,0);root.add(arm);arms.push(arm);
  const pauldron=ball(arm,.2,edge,s*.02,0,0);pauldron.scale.set(1,.72,1);
  capsule(arm,.12,.32,steel,0,-.22,0);ball(arm,.125,dark,0,-.42,.02);
  capsule(arm,.095,.25,edge,0,-.55,.02);ball(arm,.1,dark,0,-.71,.04);
  box(arm,.23,.07,.2,gold,0,-.39,.02);
 }
 // helmet with glowing visor and crest
 ball(root,.25,steel,0,2.06,0);
 const helmetTop=add(root,new THREE.SphereGeometry(.27,20,14,0,Math.PI*2,0,Math.PI*.56),edge,0,2.12,0);
 box(root,.49,.075,.34,gold,0,2.03,.02);
 box(root,.35,.105,.06,dark,0,1.98,.245);box(root,.25,.035,.025,glow,0,1.98,.28);
 for(const s of [-1,1]){const horn=add(root,new THREE.ConeGeometry(.075,.27,7),gold,s*.22,2.24,-.01);horn.rotation.z=s*.5;}
 // short cloth cape
 const cape=box(root,.67,.88,.12,leather,0,1.28,-.29);cape.rotation.x=-.1;
 // sword attached to right hand
 const sword=new THREE.Group();sword.position.set(0,-.72,.08);arms[1].add(sword);
 box(sword,.09,.28,.1,dark,0,-.02,0);box(sword,.34,.07,.13,gold,0,.15,0);
 box(sword,.105,.7,.045,edge,0,.53,0);const tip=add(sword,new THREE.ConeGeometry(.075,.18,4),edge,0,.97,0);tip.rotation.z=Math.PI;
 scene.add(root);
 return {root,arms,legs,sword,health:100,maxHealth:100,damage:25,speed:6.7,attackCooldown:0,hitCooldown:0,xp:0,level:1,walkTime:0,attackAnim:0,cameraYaw:0,cameraPitch:.2};
}

export function updatePlayer(p,dt,input,camera){
 const yaw=p.cameraYaw,forward=new THREE.Vector3(Math.sin(yaw),0,-Math.cos(yaw)),right=new THREE.Vector3(Math.cos(yaw),0,Math.sin(yaw)),dir=new THREE.Vector3();
 if(input.forward)dir.add(forward);if(input.backward)dir.sub(forward);if(input.right)dir.add(right);if(input.left)dir.sub(right);
 const moving=dir.lengthSq()>.001,blend=1-Math.exp(-13*dt);
 if(moving){dir.normalize();const angle=Math.atan2(dir.x,dir.z);p.root.rotation.y=THREE.MathUtils.lerp(p.root.rotation.y,angle,blend);p.root.position.addScaledVector(dir,p.speed*dt);p.walkTime+=dt*10;}
 const stride=moving?Math.sin(p.walkTime):0;
 p.legs[0].rotation.x=THREE.MathUtils.lerp(p.legs[0].rotation.x,stride*.62,blend);
 p.legs[1].rotation.x=THREE.MathUtils.lerp(p.legs[1].rotation.x,-stride*.62,blend);
 p.arms[0].rotation.x=THREE.MathUtils.lerp(p.arms[0].rotation.x,-stride*.3,blend);
 if(p.attackAnim>0){p.attackAnim=Math.max(0,p.attackAnim-dt);const t=1-p.attackAnim/.38;const swing=Math.sin(Math.min(1,t)*Math.PI);p.arms[1].rotation.x=-1.8*swing;p.arms[1].rotation.z=-.75*swing;}
 else{p.arms[1].rotation.x=THREE.MathUtils.lerp(p.arms[1].rotation.x,stride*.3,blend);p.arms[1].rotation.z=THREE.MathUtils.lerp(p.arms[1].rotation.z,0,blend);}
 p.root.position.x=THREE.MathUtils.clamp(p.root.position.x,-49,49);p.root.position.z=THREE.MathUtils.clamp(p.root.position.z,-49,49);
 const distance=7.8*Math.cos(p.cameraPitch),height=2.1+7.8*Math.sin(p.cameraPitch);
 const desired=new THREE.Vector3(p.root.position.x+Math.sin(yaw)*distance,p.root.position.y+height,p.root.position.z+Math.cos(yaw)*distance);
 camera.position.lerp(desired,1-Math.exp(-9*dt));camera.lookAt(p.root.position.x,p.root.position.y+1.15,p.root.position.z);
 p.attackCooldown=Math.max(0,p.attackCooldown-dt);p.hitCooldown=Math.max(0,p.hitCooldown-dt);
}
