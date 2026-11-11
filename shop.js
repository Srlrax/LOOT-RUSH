export function createShop(player,game,saved={}){
 const upgrades={damage:Math.max(1,Number(saved.upgrades?.damage)||1),health:Math.max(1,Number(saved.upgrades?.health)||1),speed:Math.max(1,Number(saved.upgrades?.speed)||1)};
 const costs={damage:Math.max(50,Number(saved.costs?.damage)||50),health:Math.max(50,Number(saved.costs?.health)||50),speed:Math.max(50,Number(saved.costs?.speed)||50)};
 function refresh(){
  document.getElementById('damageLevel').textContent='Level '+upgrades.damage;
  document.getElementById('healthLevel').textContent='Level '+upgrades.health;
  document.getElementById('speedLevel').textContent='Level '+upgrades.speed;
  for(const key of Object.keys(upgrades)){const b=document.getElementById('buy'+key[0].toUpperCase()+key.slice(1));b.disabled=game.coins<costs[key];b.querySelector('span').textContent=costs[key]+' ◈';}
 }
 function buy(key){
  const cost=costs[key];
  if(game.coins<cost){game.toast('You need more coins!');return;}
  game.coins-=cost;upgrades[key]++;costs[key]=Math.floor(cost*1.65);
  if(key==='damage')player.damage+=8;
  if(key==='health'){player.maxHealth+=20;player.health=Math.min(player.maxHealth,player.health+20);}
  if(key==='speed')player.speed+=.7;
  game.toast(key==='damage'?'Blade upgraded!':key==='health'?'Maximum health increased!':'Movement speed increased!');
  game.updateHud();refresh();
 }
 document.getElementById('buyDamage').addEventListener('click',()=>buy('damage'));
 document.getElementById('buyHealth').addEventListener('click',()=>buy('health'));
 document.getElementById('buySpeed').addEventListener('click',()=>buy('speed'));
 return {refresh,upgrades,getSaveData:()=>({upgrades:{...upgrades},costs:{...costs}})};
}
