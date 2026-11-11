import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import {createPlayer,updatePlayer} from './player.js';
import {createWorld} from './world.js';
import {createChests,updateChests,openChest,rarityClass} from './loot.js';
import {createEnemies,updateEnemies,hitEnemy} from './enemies.js';
import {createShop} from './shop.js';

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,180);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;
document.body.insertBefore(renderer.domElement,document.getElementById('game'));
const world=createWorld(scene);
const player=createPlayer(scene);
player.root.position.set(0,0,3);
const chests=createChests(scene);
const enemies=createEnemies(scene);
const game={coins:0,inventory:[],toast,updateHud};
const SAVE_KEY='loot-rush-save-v1';
function saveGame(){
 try {
  localStorage.setItem(SAVE_KEY,JSON.stringify({
   coins:game.coins,inventory:game.inventory,level:player.level,xp:player.xp,
   health:player.health,maxHealth:player.maxHealth,damage:player.damage,speed:player.speed,
   position:{x:player.root.position.x,z:player.root.position.z},
   openedChests:chests.map((c,i)=>c.opened?i:null).filter(i=>i!==null),
   shop:shop.getSaveData()
  }));
 } catch(error) { console.warn('Could not save LOOT RUSH progress.',error); }
}
function loadGame(){
 try {
  const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
  if(!saved)return;
  game.coins=Number(saved.coins)||0;
  game.inventory=Array.isArray(saved.inventory)?saved.inventory:[];
  player.level=Math.max(1,Number(saved.level)||1);
  player.xp=Math.max(0,Number(saved.xp)||0);
  player.maxHealth=Math.max(100,Number(saved.maxHealth)||100);
  player.health=Math.min(player.maxHealth,Math.max(1,Number(saved.health)||player.maxHealth));
  player.damage=Math.max(1,Number(saved.damage)||20);
  player.speed=Math.max(1,Number(saved.speed)||6);
  if(saved.position){player.root.position.set(THREE.MathUtils.clamp(Number(saved.position.x)||0,-47,47),0,THREE.MathUtils.clamp(Number(saved.position.z)||0,-47,47));}
  if(Array.isArray(saved.openedChests))saved.openedChests.forEach(i=>{
   const chest=chests[i];if(chest){chest.opened=true;chest.lid.rotation.x=-1.15;chest.lid.position.z=-.28;chest.glow.intensity=0;}
  });
  return saved;
 } catch(error) { console.warn('Could not load LOOT RUSH progress.',error); return {}; }
}
const savedProgress=loadGame();
const shop=createShop(player,game,savedProgress);

const keys={forward:false,backward:false,left:false,right:false};
const keyMap={KeyW:'forward',ArrowUp:'forward',KeyS:'backward',ArrowDown:'backward',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
let nearby=null,gameTime=0,lastTime=performance.now(),toastTimer=0;
const clock=new THREE.Clock();

function toast(message){
 const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2100);
}
function updateHud(){
 document.getElementById('coins').textContent=game.coins;
 document.getElementById('level').textContent=player.level;
 document.getElementById('levelLabel').textContent=player.level;
 document.getElementById('xpText').textContent=player.xp+' / '+(player.level*100)+' XP';
 document.getElementById('xpBar').style.width=Math.min(100,player.xp/(player.level*100)*100)+'%';
 document.getElementById('healthText').textContent=Math.ceil(player.health)+' / '+player.maxHealth;
 document.getElementById('healthBar').style.width=(player.health/player.maxHealth*100)+'%';
 shop.refresh();
 saveGame();
}
function addXp(amount){
 player.xp+=amount;
 while(player.xp>=player.level*100){player.xp-=player.level*100;player.level++;player.maxHealth+=5;player.health=Math.min(player.maxHealth,player.health+15);toast('LEVEL UP! You reached level '+player.level);}
 updateHud();
}
function refreshInventory(){
 const list=document.getElementById('inventoryList');
 if(!game.inventory.length){list.innerHTML='<div class="inventory-item"><span>Your bag is empty.</span><span>—</span></div>';return;}
 list.innerHTML=game.inventory.map(item=>'<div class="inventory-item"><span class="'+rarityClass(item.rarity)+'">◆ '+item.name+'</span><b class="'+rarityClass(item.rarity)+'">'+item.rarity+'</b></div>').join('');
}
function setModal(id,show){document.getElementById(id).classList.toggle('hidden',!show);}
document.getElementById('inventoryBtn').addEventListener('click',()=>{refreshInventory();setModal('inventoryPanel',true);});
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>setModal(b.dataset.close,false)));
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)setModal(m.id,false);}));

function nearestInteractable(){
 let best=null,bestDist=3.2;
 for(const chest of chests){if(chest.opened)continue;const d=player.root.position.distanceTo(chest.group.position);if(d<bestDist){best={type:'chest',object:chest,label:'Open treasure chest'};bestDist=d;}}
 const shopDist=player.root.position.distanceTo(world.shopPosition);
 if(shopDist<5&&shopDist<bestDist){best={type:'shop',object:null,label:'Open upgrade shop'};}
 return best;
}
function interact(){
 if(!nearby)return;
 if(nearby.type==='shop'){setModal('shopPanel',true);shop.refresh();return;}
 const reward=openChest(nearby.object);
 game.coins+=reward.coins;game.inventory.unshift(reward);addXp(25);
 toast(reward.rarity+' loot found! +'+reward.coins+' coins');
 updateHud();
}
function attack(){
 if(player.attackCooldown>0)return;
 player.attackCooldown=.55;player.sword.rotation.z=-1.25;
 const target=enemies.filter(e=>e.alive&&e.group.position.distanceTo(player.root.position)<3.3).sort((a,b)=>a.group.position.distanceTo(player.root.position)-b.group.position.distanceTo(player.root.position))[0];
 if(target){
  const killed=hitEnemy(target,player.damage);
  if(killed){const reward=18+Math.floor(Math.random()*13);game.coins+=reward;addXp(35);toast('Enemy defeated! +'+reward+' coins');updateHud();}
  else toast('Hit! Keep going!');
 }
}
function onKeyDown(e){
 const modalOpen=[...document.querySelectorAll('.modal')].some(m=>!m.classList.contains('hidden'));
 if(e.code==='Escape'){document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden'));return;}
 if(modalOpen)return;
 if(keyMap[e.code]){keys[keyMap[e.code]]=true;e.preventDefault();}
 if(e.code==='Space'){e.preventDefault();attack();}
 if(e.code==='KeyE'){interact();}
}
function onKeyUp(e){if(keyMap[e.code])keys[keyMap[e.code]]=false;}
addEventListener('keydown',onKeyDown);addEventListener('keyup',onKeyUp);
document.querySelectorAll('[data-move]').forEach(button=>{
 const key=button.dataset.move;
 const press=e=>{e.preventDefault();keys[key]=true;};
 const release=e=>{e.preventDefault();keys[key]=false;};
 button.addEventListener('pointerdown',press);
 ['pointerup','pointercancel','pointerleave'].forEach(type=>button.addEventListener(type,release));
});
document.getElementById('touchAttack')?.addEventListener('pointerdown',e=>{e.preventDefault();attack();});
document.getElementById('touchInteract')?.addEventListener('pointerdown',e=>{e.preventDefault();interact();});
addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});

function animate(now){
 requestAnimationFrame(animate);
 const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;gameTime+=dt;
 updatePlayer(player,dt,keys,camera,scene);
 updateChests(chests,gameTime);
 updateEnemies(enemies,player,dt);
 nearby=nearestInteractable();
 const prompt=document.getElementById('prompt');
 if(nearby){prompt.classList.remove('hidden');document.getElementById('promptText').textContent=nearby.label;}
 else prompt.classList.add('hidden');
 if(player.health<=0){
  player.health=player.maxHealth;player.root.position.set(0,0,3);game.coins=Math.floor(game.coins*.8);
  toast('You were sent back to the outpost. Some coins were lost.');
  updateHud();
 }
 renderer.render(scene,camera);
}
camera.position.set(0,7,13);camera.lookAt(0,1,0);
updateHud();
requestAnimationFrame(animate);
setTimeout(()=>{const l=document.getElementById('loading');l.style.opacity='0';setTimeout(()=>l.remove(),550);},700);
