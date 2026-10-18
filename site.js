(()=>{'use strict';const region=document.querySelector('.gv-draw');if(region){
const svg=region.querySelector('.gv-line-d'),path=svg&&svg.querySelector('path');
const phone=matchMedia('(max-width:767px)');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
let raf=0,layout=true,samples=[],lineHeight=0,pathLength=0;
let drawn=null,lastFrame=0;
function measure(){
 if(phone.matches||!path)return;
 const rect=region.getBoundingClientRect(),heading=region.querySelector('.gv-top .gv-h1b');
 lineHeight=Math.max(1,heading?heading.getBoundingClientRect().top-rect.top:rect.height);
 svg.style.height=lineHeight+'px';
 if(!samples.length){
  // The authored shape consists of M/L points. Read them once without expensive SVG geometry queries.
  const points=(path.getAttribute('d').match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);
  const viewHeight=svg.viewBox.baseVal.height;
  let distance=0,furthest=0;
  for(let i=0;i<points.length;i+=2){
   if(i)distance+=Math.hypot(points[i]-points[i-2],points[i+1]-points[i-1]);
   furthest=Math.max(furthest,points[i+1]);
   samples.push({y:furthest/viewHeight,distance});
  }
  pathLength=distance;
  // Use one real-length dash and one equally long gap. Avoid Safari's pathLength normalization.
  path.removeAttribute('pathLength');
  path.style.strokeDasharray=pathLength+' '+pathLength;
  samples.forEach(point=>point.progress=distance?point.distance/distance:0);
 }

}
function draw(now){
 raf=0;if(phone.matches||!path){lastFrame=0;return;}
 if(layout){layout=false;measure();}
 const rect=region.getBoundingClientRect();
 // Reveal the actual point at the vertical centre, rather than a fraction of arc length.
 const cursor=innerHeight*.5-rect.top,y=cursor/lineHeight;
 let lo=0,hi=samples.length;
 while(lo<hi){const mid=(lo+hi)>>1;if(samples[mid].y<=y)lo=mid+1;else hi=mid;}
 const before=samples[Math.max(0,lo-1)],after=samples[Math.min(samples.length-1,lo)];
 const fraction=after.y>before.y?Math.max(0,Math.min(1,(y-before.y)/(after.y-before.y))):0;
 const progress=cursor<=0?0:before.progress+(after.progress-before.progress)*fraction;
 const target=reduced.matches?1:progress;
 if(drawn===null||reduced.matches){drawn=target;}
 else{
  const dt=Math.min(40,Math.max(1,now-(lastFrame||now-16)));
  const difference=target-drawn;
  // Trace every intervening part of a curl, including when its Y direction reverses.
  const step=Math.sign(difference)*Math.min(Math.abs(difference)*(1-Math.exp(-dt/140)),dt*.00022);
  drawn=Math.abs(difference)<.00002?target:drawn+step;
 }
 lastFrame=now;
 path.style.strokeDashoffset=String((1-drawn)*pathLength);
 if(Math.abs(target-drawn)>.00002)raf=requestAnimationFrame(draw);
}
function schedule(){if(!raf)raf=requestAnimationFrame(draw)}
function reflow(){layout=true;schedule()}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',reflow);
reduced.addEventListener('change',schedule);phone.addEventListener('change',reflow);
if('ResizeObserver'in window)new ResizeObserver(reflow).observe(region);
if(document.fonts)document.fonts.ready.then(reflow);
schedule();}
const videos=document.querySelectorAll('video[data-video-src]');function play(v){if(v.getAttribute('src'))return;v.src=v.dataset.videoSrc;v.muted=true;v.play().catch(()=>{});}function loadVideos(){if('IntersectionObserver'in window){const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){play(e.target);o.unobserve(e.target)}}));videos.forEach(v=>o.observe(v));}else videos.forEach(play);}if('requestIdleCallback'in window)requestIdleCallback(loadVideos,{timeout:1200});else setTimeout(loadVideos,400);})();