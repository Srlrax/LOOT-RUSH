import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function createWorld(scene) {
  scene.background=new THREE.Color(0x9bc7c8);
  scene.fog=new THREE.Fog(0x9bc7c8,38,105);
  const hemi=new THREE.HemisphereLight(0xe5f5ff,0x526c43,2.0);scene.add(hemi);
  const sun=new THREE.DirectionalLight(0xffe4bd,2.7);sun.position.set(-25,40,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-60;sun.shadow.camera.right=60;sun.shadow.camera.top=60;sun.shadow.camera.bottom=-60;scene.add(sun);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshStandardMaterial({color:0x648b53,roughness:1}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
  const patchMat=new THREE.MeshStandardMaterial({color:0x779b5e,roughness:1});
  for(let i=0;i<24;i++){const x=(Math.random()-.5)*100,z=(Math.random()-.5)*100;const p=new THREE.Mesh(new THREE.CircleGeometry(2+Math.random()*4,24),patchMat);p.rotation.x=-Math.PI/2;p.position.set(x,.012,z);p.scale.y=.6;scene.add(p);}
  const trunkMat=new THREE.MeshStandardMaterial({color:0x65452f}),leafMats=[0x47764b,0x5c8d52,0x739d59].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:1}));
  for(let i=0;i<75;i++){
    const x=(Math.random()-.5)*108,z=(Math.random()-.5)*108;
    if(Math.abs(x)<9&&Math.abs(z)<9)continue;
    const tree=new THREE.Group();tree.position.set(x,0,z);
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,1.8,7),trunkMat);trunk.position.y=.9;trunk.castShadow=true;tree.add(trunk);
    const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(.9+Math.random()*.45,1),leafMats[i%3]);crown.position.y=2.25;crown.castShadow=true;tree.add(crown);scene.add(tree);
  }
  const rockMat=new THREE.MeshStandardMaterial({color:0x858b83,roughness:1});
  for(let i=0;i<35;i++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.4+Math.random()*.7,0),rockMat);r.position.set((Math.random()-.5)*95,.35,(Math.random()-.5)*95);r.rotation.set(Math.random(),Math.random(),Math.random());r.castShadow=true;scene.add(r);}
  // Small stone trader outpost
  const stone=new THREE.MeshStandardMaterial({color:0x9b9b83,roughness:1}),wood=new THREE.MeshStandardMaterial({color:0x765037});
  const platform=new THREE.Mesh(new THREE.CylinderGeometry(5,5.4,.35,12),stone);platform.position.set(0,.18,-12);platform.receiveShadow=true;scene.add(platform);
  const stall=new THREE.Group();stall.position.set(0,0,-12);
  const postGeo=new THREE.BoxGeometry(.18,3,.18);
  for(const x of [-2.1,2.1])for(const z of [-1.4,1.4]){const p=new THREE.Mesh(postGeo,wood);p.position.set(x,1.7,z);p.castShadow=true;stall.add(p);}
  const roof=new THREE.Mesh(new THREE.BoxGeometry(4.8,.25,3.5),new THREE.MeshStandardMaterial({color:0x9a573d}));roof.position.y=3.2;roof.castShadow=true;stall.add(roof);
  const counter=new THREE.Mesh(new THREE.BoxGeometry(3.8,.9,.6),wood);counter.position.set(0,.75,1.1);counter.castShadow=true;stall.add(counter);scene.add(stall);
  const sign=new THREE.Mesh(new THREE.BoxGeometry(2.5,.8,.12),new THREE.MeshStandardMaterial({color:0x283d3d}));sign.position.set(0,2.5,1.55);stall.add(sign);
  return {shopPosition:new THREE.Vector3(0,0,-12)};
}
