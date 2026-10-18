(()=>{'use strict';const region=document.querySelector('.gv-draw');if(region){
const paths=[...region.querySelectorAll('.gv-line path')];
const mobile=region.querySelector('.gv-line-m');
const mobilePath=mobile&&mobile.querySelector('path');
const narrow=matchMedia('(max-width:600px)');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let raf=0,layout=true,samples=[],lineHeight=0;
function measure(){
 if(!mobile)return;
 if(!narrow.matches){mobile.style.height='';return;}
 const rect=region.getBoundingClientRect();
 const heading=region.querySelector('.gv-top .gv-h1b');
 lineHeight=heading?heading.getBoundingClientRect().top-rect.top:rect.height;
 mobile.style.height=Math.max(1,lineHeight)+'px';
 // Keep the original curled SVG. Only measure it; never replace its shape.
 const length=mobilePath.getTotalLength();
 let furthest=0;samples=[];
 for(let i=0;i<=1200;i++){
  furthest=Math.max(furthest,mobilePath.getPointAtLength(length*i/1200).y);
  samples.push(furthest/3800);
 }
}
function draw(){
 raf=0;if(layout){layout=false;measure();}
 const rect=region.getBoundingClientRect(),cursor=innerHeight*.78-rect.top;
 paths.forEach(path=>{
  let progress=Math.max(0,Math.min(1,cursor/rect.height));
  if(path===mobilePath&&narrow.matches&&samples.length){
   const y=cursor/lineHeight;
   let lo=0,hi=samples.length;
   while(lo<hi){const mid=(lo+hi)>>1;if(samples[mid]<=y)lo=mid+1;else hi=mid;}
   progress=cursor<=0?0:Math.min(1,Math.max(0,(lo-1)/1200));
  }
  path.style.strokeDashoffset=String(reduced.matches?0:1-progress);
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