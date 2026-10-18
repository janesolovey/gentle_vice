(()=>{'use strict';const region=document.querySelector('.gv-draw');if(region){
const paths=[...region.querySelectorAll('.gv-line path')];
const mobile=region.querySelector('.gv-line-m');
const mobilePath=mobile&&mobile.querySelector('path');
const narrow=matchMedia('(max-width:600px)');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let raf=0,layout=true,mobileLength=0;
function route(){
 if(!narrow.matches||!mobilePath)return;
 const r=region.getBoundingClientRect(),w=r.width,h=r.height;
 if(!w||!h)return;
 mobile.setAttribute('viewBox',`0 0 ${w} ${h}`);
 const cards=[...region.querySelectorAll('.gv-story-grid>.gv-card')].map(e=>e.getBoundingClientRect());
 const boxes=[];
 cards.forEach(box=>{const row=boxes[boxes.length-1];if(row&&Math.abs(row.top-box.top)<2)row.bottom=Math.max(row.bottom,box.bottom);else boxes.push({top:box.top,bottom:box.bottom});});
 const heading=region.querySelector('.gv-top .gv-h1b');
 const end=heading?heading.getBoundingClientRect().top-r.top: h-24;
 const left=8,right=w-8;
 let x=right,y=12;
 let d=`M ${x} ${y}`;
 boxes.forEach((box,index)=>{
  const top=Math.max(y,box.top-r.top-10);
  // Cross only in the space before a card; keep the line outside its image and caption.
  const next=index%2?left:right;
  d+=` C ${x} ${y+(top-y)*.5} ${next} ${y+(top-y)*.5} ${next} ${top}`;
  x=next;y=box.bottom-r.top;
  d+=` L ${x} ${y}`;
 });
 const finish=Math.max(y,end-12);
 d+=` C ${x} ${y+(finish-y)*.5} ${left} ${y+(finish-y)*.5} ${left} ${finish}`;
 mobilePath.setAttribute('d',d);
 mobileLength=mobilePath.getTotalLength();
}
function draw(){
 raf=0;if(layout){layout=false;route();}
 const r=region.getBoundingClientRect();
 const cursor=innerHeight*.78-r.top;
 const progress=reduced.matches?1:Math.max(0,Math.min(1,cursor/r.height));
 paths.forEach(p=>{
  let amount=progress;
  if(p===mobilePath&&narrow.matches&&mobileLength&&!reduced.matches){
   // Mobile route has increasing Y: reveal the point that actually reaches the viewport.
   let lo=0,hi=mobileLength;
   for(let i=0;i<18;i++){const mid=(lo+hi)/2;if(p.getPointAtLength(mid).y<cursor)lo=mid;else hi=mid;}
   amount=cursor<=0?0:cursor>=r.height?1:(lo+hi)/2/mobileLength;
  }
  p.style.strokeDashoffset=String(1-amount);
 });
}
function schedule(){if(!raf)raf=requestAnimationFrame(draw)}
function reflow(){layout=true;schedule()}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',reflow);
reduced.addEventListener('change',schedule);narrow.addEventListener('change',reflow);
if('ResizeObserver'in window)new ResizeObserver(reflow).observe(region);
if(document.fonts)document.fonts.ready.then(reflow);
draw();}
const videos=document.querySelectorAll('video[data-video-src]');function play(v){if(v.getAttribute('src'))return;v.src=v.dataset.videoSrc;v.muted=true;v.play().catch(()=>{});}function loadVideos(){if('IntersectionObserver'in window){const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){play(e.target);o.unobserve(e.target)}}));videos.forEach(v=>o.observe(v));}else videos.forEach(play);}if('requestIdleCallback'in window)requestIdleCallback(loadVideos,{timeout:1200});else setTimeout(loadVideos,400);})();