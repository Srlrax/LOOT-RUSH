import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
export function createWorld(scene){
 scene.background=new THREE.Color(0x91b8c0);scene.fog=new THREE.Fog(0x91b8c0,48,125);
 scene.add(new THREE.HemisphereLight(0xe8f6ff,0x526448,1.75));
 const sun=new THREE.DirectionalLight(0xffe5c4,2.5);sun.position.set(-32,48,24);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-65;sun.shadow.camera.right=65;sun.shadow.camera.top=65;sun.shadow.camera.bottom=-65;sun.shadow.bias=-.0002;scene.add(sun);
 const mat=(c,r=1,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(130,130),mat(0x648a51));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
 // broad irregular grassland patches
 const grass=[0x71975b,0x587e49,0x7e9d60,0x698b52].map(c=>mat(c));
 for(let i=0;i<95;i++){const x=(Math.random()-.5)*116,z=(Math.random()-.5)*116;if(Math.abs(x)<7&&Math.abs(z)<8)continue;const patch=new THREE.Mesh(new THREE.CircleGeometry(1.5+Math.random()*3.7,16),grass[i%grass.length]);patch.rotation.x=-Math.PI/2;patch.position.set(x,.014,z);patch.scale.set(1,.55,.7);scene.add(patch);}
 // distant rock ridges on the horizon
 const cliff=mat(0x718078),ridge=mat(0x87918a);
 for(let i=0;i<17;i++){const a=i/17*Math.PI*2,r=57+Math.random()*8,h=5+Math.random()*8;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(h*.7,1),i%2?cliff:ridge);rock.position.set(Math.cos(a)*r,h*.35,Math.sin(a)*r);rock.scale.set(1.7,.8,.7);rock.rotation.y=a;rock.castShadow=true;scene.add(rock);}
 // forest edge with layered trunks and canopies
 const bark=mat(0x60452f),leaves=[0x315f3e,0x47764a,0x5b8750,0x6b9257].map(c=>mat(c));
 for(let i=0;i<105;i++){
  const x=(Math.random()-.5)*112,z=(Math.random()-.5)*112;if(Math.abs(x)<10&&z<5&&z>-22)continue;
  const tree=new THREE.Group();tree.position.set(x,0,z);
  const h=2.4+Math.random()*1.5;const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.29,h,8),bark);trunk.position.y=h/2;trunk.castShadow=true;tree.add(trunk);
  for(let j=0;j<3;j++){const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.85+Math.random()*.42,1),leaves[(i+j)%4]);crown.position.set((Math.random()-.5)*.5,h*.72+j*.42,(Math.random()-.5)*.5);crown.scale.set(1,1.05,.9);crown.castShadow=true;tree.add(crown);}
  scene.add(tree);
 }
 // rocks and low shrubs
 const stone=mat(0x858d83),shrub=mat(0x3f713f);
 for(let i=0;i<75;i++){const x=(Math.random()-.5)*105,z=(Math.random()-.5)*105;if(Math.abs(x)<8&&Math.abs(z)<8)continue;const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.3+Math.random()*.75,0),stone);r.position.set(x,.25,z);r.rotation.set(Math.random(),Math.random(),Math.random());r.castShadow=true;scene.add(r);}
 for(let i=0;i<125;i++){const x=(Math.random()-.5)*108,z=(Math.random()-.5)*108;if(Math.abs(x)<8&&z<4&&z>-20)continue;const bush=new THREE.Group();bush.position.set(x,0,z);for(let j=0;j<3;j++){const leaf=new THREE.Mesh(new THREE.IcosahedronGeometry(.22+Math.random()*.13,1),shrub);leaf.position.set((j-1)*.22,.25+Math.random()*.12,0);bush.add(leaf);}scene.add(bush);}
 // Trader courtyard and timber stall
 const stoneMat=mat(0x9a9b87),wood=mat(0x60412e),trim=mat(0x302b27),roofMat=mat(0x7d4935),gold=mat(0xd6a64d,.45,.5);
 const platform=new THREE.Mesh(new THREE.CylinderGeometry(6.2,6.6,.38,16),stoneMat);platform.position.set(0,.18,-12);platform.receiveShadow=true;scene.add(platform);
 const stall=new THREE.Group();stall.position.set(0,0,-12);
 for(const x of [-2.35,2.35])for(const z of [-1.5,1.5]){const post=new THREE.Mesh(new THREE.BoxGeometry(.2,3.4,.2),wood);post.position.set(x,1.75,z);post.castShadow=true;stall.add(post);}
 const roof=new THREE.Mesh(new THREE.ConeGeometry(3.5,1.2,4),roofMat);roof.rotation.y=Math.PI/4;roof.position.y=3.65;roof.scale.set(1,.75,.72);roof.castShadow=true;stall.add(roof);
 const canopy=new THREE.Mesh(new THREE.BoxGeometry(5.1,.18,3.6),wood);canopy.position.y=3.05;stall.add(canopy);
 const counter=new THREE.Mesh(new THREE.BoxGeometry(4.2,.95,.7),wood);counter.position.set(0,.75,1.12);counter.castShadow=true;stall.add(counter);
 const sign=new THREE.Mesh(new THREE.BoxGeometry(2.6,.72,.12),trim);sign.position.set(0,2.35,1.58);stall.add(sign);
 const letters=new THREE.Mesh(new THREE.BoxGeometry(1.45,.08,.035),gold);letters.position.set(0,2.38,1.66);stall.add(letters);
 // barrels and crates
 for(const x of [-3.5,3.5]){const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.38,.42,.85,12),wood);barrel.position.set(x,.55,-11.5);barrel.castShadow=true;scene.add(barrel);for(const y of [.3,.75]){const hoop=new THREE.Mesh(new THREE.TorusGeometry(.39,.035,6,16),gold);hoop.rotation.x=Math.PI/2;hoop.position.set(x,y,-11.5);scene.add(hoop);}}
 for(const x of [-3.7,3.7]){const crate=new THREE.Mesh(new THREE.BoxGeometry(.7,.7,.7),wood);crate.position.set(x,.4,-14.3);crate.rotation.y=.2;crate.castShadow=true;scene.add(crate);}
 scene.add(stall);
 // stone path from spawn to trader
 const path=mat(0xa4a08b);for(let i=0;i<23;i++){const p=new THREE.Mesh(new THREE.CylinderGeometry(.48,.54,.11,7),path);p.position.set((Math.random()-.5)*.35,.06,2-i*.68);p.rotation.y=Math.random()*2; p.receiveShadow=true;scene.add(p);}
 // lanterns
 const metal=mat(0x292d2d,.35,.75),flame= new THREE.MeshStandardMaterial({color:0xffd58a,emissive:0xffa32c,emissiveIntensity:2});
 for(const x of [-3,3]){const post=new THREE.Mesh(new THREE.CylinderGeometry(.075,.12,2.3,8),metal);post.position.set(x,1.15,-10.4);post.castShadow=true;scene.add(post);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.17,12,10),flame);bulb.position.set(x,2.28,-10.4);scene.add(bulb);const light=new THREE.PointLight(0xffbd69,1.4,11);light.position.copy(bulb.position);scene.add(light);}
 return {shopPosition:new THREE.Vector3(0,0,-12)};
}
