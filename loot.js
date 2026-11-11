import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const tiers=[{name:'Common',color:0xd5dadd,weight:55,mult:1},{name:'Uncommon',color:0x69d99b,weight:27,mult:1.5},{name:'Rare',color:0x61b7ff,weight:12,mult:2.5},{name:'Epic',color:0xc18aff,weight:5,mult:4},{name:'Legendary',color:0xffc65c,weight:1,mult:8}];
export function createChests(scene){
 const chests=[];const positions=[[-12,-4],[13,-8],[-19,13],[20,17],[5,25],[-30,-16],[31,-25],[0,37]];
 positions.forEach((p,i)=>{const g=new THREE.Group();g.position.set(p[0],0,p[1]);const wood=new THREE.MeshStandardMaterial({color:0x81502f,roughness:.7}),gold=new THREE.MeshStandardMaterial({color:0xe5b34e,metalness:.65,roughness:.3});
 const base=new THREE.Mesh(new THREE.BoxGeometry(1.35,.75,.9),wood);base.position.y=.55;base.castShadow=true;g.add(base);
 const lid=new THREE.Mesh(new THREE.BoxGeometry(1.4,.28,.94),wood);lid.position.y=1.05;lid.castShadow=true;g.add(lid);
 const band=new THREE.Mesh(new THREE.BoxGeometry(.18,.8,.98),gold);band.position.set(0,.7,0);g.add(band);
 const lock=new THREE.Mesh(new THREE.BoxGeometry(.22,.28,.12),gold);lock.position.set(0,.75,.51);g.add(lock);
 const glow=new THREE.PointLight(0xffc75c,.8,4);glow.position.y=1.3;g.add(glow);scene.add(g);
 chests.push({group:g,lid,opened:false,glow,baseY:1.05,phase:i});
 });return chests;
}
export function updateChests(chests,time){chests.forEach(c=>{if(!c.opened){c.glow.intensity=.65+Math.sin(time*2+c.phase)*.2;c.group.position.y=Math.sin(time*1.5+c.phase)*.045;}});}
export function openChest(chest){
 chest.opened=true;chest.lid.rotation.x=-1.15;chest.lid.position.z=-.28;chest.glow.intensity=0;
 const roll=Math.random()*100;let sum=0;let tier=tiers[0];for(const t of tiers){sum+=t.weight;if(roll<sum){tier=t;break;}}
 return {name:['Traveler','Guardian','Explorer','Champion','Ancient'][Math.floor(Math.random()*5)]+' '+['Blade','Helm','Charm','Armor'][Math.floor(Math.random()*4)],rarity:tier.name,color:tier.color,mult:tier.mult,coins:Math.floor(12*tier.mult+Math.random()*12*tier.mult)};
}
export const rarityClass=name=>'rarity-'+name.toLowerCase();
