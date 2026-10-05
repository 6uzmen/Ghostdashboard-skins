(function(){"use strict";var h=document.createElement("style");h.textContent=`@font-face{font-family:Rubik;font-weight:600;src:local("Rubik Medium"),local("Rubik-Medium"),url(../../assets/fonts/Rubik-Medium.ttf) format("truetype")}:root{--main-color: #cc0000;--second-color: #e8e8e8;--rpm-bar: 294px;--kmh-bar: 294px;--fuel-bar: 1;--clt-bar: 0}*,*:before,*:after{box-sizing:border-box;margin:0;padding:0}body,html{width:1280px;height:480px;overflow:hidden;background:#111;font-family:Rubik,sans-serif;color:#fff;-webkit-font-smoothing:antialiased}#container{width:1280px;height:480px;position:relative;opacity:0}#container.anim-in{animation:fadeIn .6s ease forwards}#container.anim-out{animation:fadeOut .4s ease forwards}@keyframes fadeIn{0%{opacity:0;transform:scale(.98)}to{opacity:1;transform:scale(1)}}@keyframes fadeOut{0%{opacity:1}to{opacity:0}}#top-icons{position:absolute;top:16px;left:50%;transform:translate(-50%);display:flex;gap:20px;align-items:center}#top-icons span{display:inline-flex;opacity:.15;transition:opacity .15s ease}#top-icons img{width:22px;height:22px;filter:invert(1)}#turnLeft,#turnRight,#turnLeft img,#turnRight img{filter:none}#top-gauges{position:absolute;top:56px;left:50%;transform:translate(-50%);display:flex;gap:48px;align-items:center}.gauge-mini{display:flex;flex-direction:column;align-items:center;gap:6px}.gauge-mini-bar{width:140px;height:5px;background:#ffffff1f;border-radius:3px;overflow:hidden}.gauge-mini-fill{height:100%;background:var(--main-color);transform-origin:left center;will-change:transform}#fuel-gauge .gauge-mini-fill{transform:scaleX(calc(1 - var(--fuel-bar)))}#clt-gauge .gauge-mini-fill{transform:scaleX(var(--clt-bar))}.gauge-mini-value{display:flex;align-items:center;gap:6px;font-size:13px;letter-spacing:.5px;color:#ffffffbf}.gauge-mini-value img{width:14px;height:14px;filter:invert(1);opacity:.6}.turn-signal{display:flex;align-items:center;width:fit-content}.turn-left{transform:rotate(180deg)}.turn-signal .arrow{width:24px;height:24px;stroke:#ff4545;opacity:40%;transition:opacity .15s ease}#main-gauges{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;gap:80px;align-items:center}.gauge-circle{position:relative;width:210px;height:210px;border-radius:50%;border:2px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;background:#0006}.gauge-center{font-size:52px;font-weight:700;letter-spacing:-1px;color:#fff;z-index:2;-webkit-user-select:none;user-select:none}.gauge-numbers{position:absolute;bottom:12px;left:50%;transform:translate(-50%);display:flex;align-items:flex-end;font-size:9px;color:#fff6;pointer-events:none}.gauge-numbers div{position:absolute}.gauge-arc-clip{position:absolute;bottom:0;left:6px;right:6px;height:6px;border-radius:3px;overflow:hidden;background:#ffffff14}.gauge-arc-fill{height:100%;background:var(--main-color);will-change:transform;transform-origin:left center}.rpm-fill{width:calc(100% + 294px);transform:translate(calc(-1px * var(--rpm-bar)))}.kmh-fill{width:calc(100% + 294px);transform:translate(calc(-1px * var(--kmh-bar)))}@font-face{font-family:Digital Numbers;src:url(fonts/DigitalNumbers-Regular.ttf) format("truetype")}#speedo{--spd-main: #f5f5f5;--spd-glow: #f5f5f5;--spd-glow-lead: #f5f5f5;--spd-units: #f5f5f5;display:flex;font-family:Digital Numbers,monospace;font-size:48px;line-height:normal;-webkit-user-select:none;user-select:none;z-index:2}#speedo[data-tier="2"]{--spd-main: #fbfdc7;--spd-glow: #fbfdc7;--spd-glow-lead: #fffee4;--spd-units: #fbfdc7}#speedo[data-tier="3"]{--spd-main: #ff9c45;--spd-glow: #ffeb9c;--spd-glow-lead: #ffeb9c;--spd-units: #ffeb9c}#speedo[data-tier="4"]{--spd-main: #ff4545;--spd-glow: #ff8d50;--spd-glow-lead: #ff8d50;--spd-units: #ff8d50}#speedo[data-tier="5"]{--spd-main: #ff4040;--spd-glow: #ff509c;--spd-glow-lead: #ff509c;--spd-units: #ff509c}.spd-digit{position:relative;width:39px;text-align:center}.spd-digit span{display:block;color:var(--spd-main)}.spd-digit .spd-main{position:relative}.spd-digit .spd-glow{position:absolute;top:0;right:0;bottom:0;left:0;color:var(--spd-glow);filter:blur(2.25px)}.spd-digit.hundreds .spd-glow{color:var(--spd-glow-lead);filter:blur(3.5px)}.spd-digit.ghost span{opacity:.1;color:#f5f5f5}.spd-digit.units span{opacity:.45;color:var(--spd-units)}.spd-digit.ghost .spd-glow,.spd-digit.units .spd-glow,#speedo[data-tier="0"] .spd-glow{display:none}#speedo[data-tier="0"] .spd-digit:not(.ghost) span{opacity:.8}#speedo[data-tier="0"] .spd-digit.units span{opacity:.75}#micro-gauges{position:absolute;bottom:28px;left:50%;transform:translate(-50%);display:flex;gap:32px;align-items:flex-end}.micro-gauge{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:56px}.micro-label{font-size:9px;font-weight:600;letter-spacing:1.5px;color:#fff6;text-transform:uppercase}.micro-gauge>span{font-size:24px;font-weight:700;color:var(--main-color);line-height:1}.micro-unit{font-size:9px;letter-spacing:.5px;color:#ffffff4d}#odometer{position:absolute;bottom:8px;width:100%;display:flex;justify-content:space-between;padding:0 48px;font-size:11px;letter-spacing:1.5px;color:#ffffff59;text-transform:uppercase}#odometer span{color:#ffffffb3;font-weight:600;margin:0 4px}
/*$vite$:1*/`,document.head.appendChild(h);const $=["battAlt","eBrake","highBeam","parkLights","fogLights","auxLights","openDoor","fan","oilSwitch","ECUErr"],u=`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="35" viewBox="0 0 24 35" fill="none">
<path class="arrow" d="M8.80768 3.84839L20.2032 16.0125L21.3555 17.2429L20.169 18.4402L8.4483 30.2761L7.20514 31.532L5.961 30.2761L3.68268 27.9744L2.46295 26.7429L3.68268 25.5115L11.9044 17.2087L3.68268 8.90601L2.46295 7.67456L3.68268 6.44312L6.28717 3.81323L7.56549 2.52222L8.80768 3.84839Z" stroke="red" stroke-width="3.5"/>
</svg>`;function x(t){return`
    <div id="turn${t}" class="turn-signal turn-${t}">
      ${u}
      ${u}
      ${u}
    </div>
  `}function b(t){const i=document.getElementById(`turn${t}`),e=i?Array.from(i.querySelectorAll(".arrow")):[];let a=0,s=0;const p=180,g=()=>{a=0,s=0,e.forEach(r=>{r.style.opacity=.4})};return{update(r,l){if(!r){g();return}l-s>p&&(a=(a+1)%(e.length+1),s=l),e.forEach((d,f)=>{d.style.opacity=f<a?1:.4})}}}function D(){return`
    <div id="top-gauges">
      ${x("left")}
      ${x("right")}
    </div>
  `}const v=[0,50,100,140,180,200],A=["hundreds","tens","units"];function B(){return`
    <div id="speedo" data-tier="0">
      ${A.map(t=>`
        <div class="spd-digit ${t}">
          <span class="spd-glow">0</span>
          <span class="spd-main">0</span>
        </div>
      `).join("")}
    </div>
  `}const E=t=>{let i=0;for(let e=1;e<v.length;e++)t>=v[e]&&(i=e);return i};function M(){const t=document.getElementById("speedo"),i=Array.from(t.querySelectorAll(".spd-digit")).map(a=>({el:a,spans:a.querySelectorAll("span")}));let e=-1;return{update(a){const s=Math.min(999,Math.max(0,Math.round(a??0)));if(s===e)return;e=s,t.dataset.tier=E(s);const p=String(s).padStart(3,"0"),g=s===0?2:3-String(s).length;i.forEach(({el:r,spans:l},d)=>{l[0].textContent=p[d],l[1].textContent=p[d],r.classList.toggle("ghost",d<g)})}}}function N({rpmM:t=8}={}){return`
    <div id="main-gauges">
      <div id="rpm-gauge" class="gauge-circle">
        <div id="rpmnumbers" class="gauge-numbers rpm-max-${t}"></div>
        <div id="gear" class="gauge-center">N</div>
        <div class="gauge-arc-clip">
          <div class="gauge-arc-fill rpm-fill"></div>
        </div>
      </div>

      <div id="speed-gauge" class="gauge-circle">
        <div id="kmhnumbers" class="gauge-numbers"></div>
        ${B()}
        <div class="gauge-arc-clip">
          <div class="gauge-arc-fill kmh-fill"></div>
        </div>
      </div>
    </div>
  `}function O(t){const i=document.getElementById("rpmnumbers");if(i)for(let e=t;e>=0;e--){const a=document.createElement("div");a.style.cssText=`
      animation-delay: ${(e+15)*.2}s;
      transform: translateX(${e/t*-180}px);
    `,a.textContent=e,i.appendChild(a)}}function I(){const t=[0,20,40,60,100,140,200,260],i=document.getElementById("kmhnumbers");if(i)for(let e=t.length-1;e>=0;e--){const a=document.createElement("div");a.style.cssText=`
      animation-delay: ${(e+15)*.2}s;
      transform: translateX(${e/(t.length-1)*180}px);
    `,a.textContent=t[e],i.appendChild(a)}}const P=[{id:"battLevel",label:"BATT",unit:"V"},{id:"fuelPressure",label:"FUEL",unit:"BAR"},{id:"lambda",label:"LAMBDA",unit:"λ"},{id:"mapBoost",label:"BOOST",unit:"BAR"},{id:"oilPressure",label:"OIL",unit:"BAR"},{id:"mat",label:"MAT",unit:"°C"}];function z(){return`
    <div id="micro-gauges">
      ${P.map(({id:t,label:i,unit:e})=>`
        <div class="micro-gauge">
          <div class="micro-label">${i}</div>
          <span id="${t}">0</span>
          <div class="micro-unit">${e}</div>
        </div>
      `).join("")}
    </div>
  `}function F(){return`
    <div id="odometer">
      <div class="odo-trip">TRIP <span id="kmTrip">0</span> km</div>
      <div class="odo-total">TOTAL <span id="kmTotal">0</span> km</div>
    </div>
  `}const w=()=>{const{cMain:t,cSec:i}=COLORS,{rpmM:e,aSpd:a,clt:s,icon:p}=DASH_OPTIONS,g=e*1e3;document.getElementById("container").innerHTML=`
    ${D()}
    ${N({rpmM:e})}
    ${z()}
    ${F()}
  `,setRootCSS("--main-color",t),setRootCSS("--second-color",i),O(e),I();const r=M(),l=b("left"),d=b("right"),f=$,y=[...f,"container","kmTrip","kmTotal","fuelLevel","cltNow","gear","battLevel","fuelPressure","lambda","oilPressure","mapBoost","mat"].reduce((n,c)=>({...n,[c]:document.getElementById(c)}),{}),{container:_,kmTrip:S,kmTotal:k,gear:G,mat:j,battLevel:q,fuelPressure:X,lambda:U,oilPressure:V,mapBoost:H,fuelLevel:Z,cltNow:J}=y;loadOdo(k,S,0);let[L,C,m,T]=[!1,!1,!1,!1];const K=()=>{[L,C,m,T]=[useCanChannel(),useCanChannel("sRpm"),useCanChannel("sVss"),useCanChannel("sClt")]},Q=n=>{setRootCSS("--rpm-bar",`${294-(n??0)/g*294}px`)},W=(n,c)=>{r.update(a<2?c??n:n);let o=0;n<=60?o=n/60*125:n<=140?o=125+(n-60)/80*83:n<=260&&(o=208+(n-140)/120*86),setRootCSS("--kmh-bar",`${294-o}px`)},R=n=>{if(checkCache("useCAN",useCanChannel())||K(),L&&(setText(G,canData.gear),setText(j,canData.mat),setText(H,mapFormat(canData.map)),setText(X,canData.fuelPress),setText(q,canData.batt),setText(U,canData.lambda),setText(V,canData.oilPress)),isBasicOnline){setText(Z,fuelLevelFormat(basicData,"lvlFuel")),setRootCSS("--fuel-bar",`${1-safeReturn(basicData,"lvlFuel")/100}`);for(let o=0;o<f.length;o++)etoggle(y[f[o]],basicData[f[o]]);l.update(basicData.turnLeft,n),d.update(basicData.turnRight,n)}Q(C?canData.rpm:safeReturn(basicData,"rpm")),W(...m?[canData.vss]:[basicData.kmh,basicData.kmhF]);const c=T?canData.clt:safeReturn(basicData,"clt");setRootCSS("--clt-bar",`${c/s}`),setText(J,zeroFixed(c)),updateOdo(k,S,m?canData.odoNow:basicData.odoNow),requestAnimationFrame(R)};setTimeout(()=>openConnection(R),5e3),_.classList.add("anim-in")};document.readyState==="complete"?w():window.addEventListener("load",w)})();
