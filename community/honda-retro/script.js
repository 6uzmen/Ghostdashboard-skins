(function(){"use strict";var h=document.createElement("style");h.textContent=`@font-face{font-family:Rubik;font-weight:600;src:local("Rubik Medium"),local("Rubik-Medium"),url(../../assets/fonts/Rubik-Medium.ttf) format("truetype")}:root{--main-color: #cc0000;--second-color: #e8e8e8;--rpm-bar: 294px;--kmh-bar: 294px;--fuel-bar: 1;--clt-bar: 0}*,*:before,*:after{box-sizing:border-box;margin:0;padding:0}body,html{width:1280px;height:480px;overflow:hidden;background:#111;font-family:Rubik,sans-serif;color:#fff;-webkit-font-smoothing:antialiased}#container{width:1280px;height:480px;position:relative;opacity:0}#container.anim-in{animation:fadeIn .6s ease forwards}#container.anim-out{animation:fadeOut .4s ease forwards}@keyframes fadeIn{0%{opacity:0;transform:scale(.98)}to{opacity:1;transform:scale(1)}}@keyframes fadeOut{0%{opacity:1}to{opacity:0}}#top-icons{position:absolute;top:16px;left:50%;transform:translate(-50%);display:flex;gap:20px;align-items:center}#top-icons span{display:inline-flex;opacity:.15;transition:opacity .15s ease}#top-icons img{width:22px;height:22px;filter:invert(1)}#turnLeft,#turnRight,#turnLeft img,#turnRight img{filter:none}#top-gauges{position:absolute;top:56px;left:50%;transform:translate(-50%);display:flex;gap:48px;align-items:center}.gauge-mini{display:flex;flex-direction:column;align-items:center;gap:6px}.gauge-mini-bar{width:140px;height:5px;background:#ffffff1f;border-radius:3px;overflow:hidden}.gauge-mini-fill{height:100%;background:var(--main-color);transform-origin:left center;will-change:transform}#fuel-gauge .gauge-mini-fill{transform:scaleX(calc(1 - var(--fuel-bar)))}#clt-gauge .gauge-mini-fill{transform:scaleX(var(--clt-bar))}.gauge-mini-value{display:flex;align-items:center;gap:6px;font-size:13px;letter-spacing:.5px;color:#ffffffbf}.gauge-mini-value img{width:14px;height:14px;filter:invert(1);opacity:.6}#main-gauges{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;gap:80px;align-items:center}.gauge-circle{position:relative;width:210px;height:210px;border-radius:50%;border:2px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;background:#0006}.gauge-center{font-size:52px;font-weight:700;letter-spacing:-1px;color:#fff;z-index:2;-webkit-user-select:none;user-select:none}.gauge-numbers{position:absolute;bottom:12px;left:50%;transform:translate(-50%);display:flex;align-items:flex-end;font-size:9px;color:#fff6;pointer-events:none}.gauge-numbers div{position:absolute}.gauge-arc-clip{position:absolute;bottom:0;left:6px;right:6px;height:6px;border-radius:3px;overflow:hidden;background:#ffffff14}.gauge-arc-fill{height:100%;background:var(--main-color);will-change:transform;transform-origin:left center}.rpm-fill{width:calc(100% + 294px);transform:translate(calc(-1px * var(--rpm-bar)))}.kmh-fill{width:calc(100% + 294px);transform:translate(calc(-1px * var(--kmh-bar)))}#micro-gauges{position:absolute;bottom:28px;left:50%;transform:translate(-50%);display:flex;gap:32px;align-items:flex-end}.micro-gauge{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:56px}.micro-label{font-size:9px;font-weight:600;letter-spacing:1.5px;color:#fff6;text-transform:uppercase}.micro-gauge>span{font-size:24px;font-weight:700;color:var(--main-color);line-height:1}.micro-unit{font-size:9px;letter-spacing:.5px;color:#ffffff4d}#odometer{position:absolute;bottom:8px;width:100%;display:flex;justify-content:space-between;padding:0 48px;font-size:11px;letter-spacing:1.5px;color:#ffffff59;text-transform:uppercase}#odometer span{color:#ffffffb3;font-weight:600;margin:0 4px}.turn-signal{display:flex;align-items:center}.turn-signal .arrow{width:24px;height:24px;transition:opacity .15s ease;stroke:#ff6d6d;opacity:40%}
/*$vite$:1*/`,document.head.appendChild(h);const T=["battAlt","eBrake","highBeam","parkLights","fogLights","auxLights","openDoor","fan","oilSwitch","ECUErr"],$=[{id:"ECUErr",file:"injection"},{id:"battAlt",file:"battery"},{id:"eBrake",file:"handbrake"},{id:"oilSwitch",file:"oil"},{id:"highBeam",file:"hheadlight"},{id:"parkLights",file:"headlight"},{id:"fogLights",file:"milha"},{id:"auxLights",file:"neblina"},{id:"fan",file:"fan"},{id:"openDoor",file:"door"}];function R({icon:t=1}={}){const e=`../../assets/${t===1?"icons":"icons_color"}`;return`
    <section id="top-icons" class="icons">
      ${$.map(({id:a,file:o})=>`
        <span id="${a}">
          <img src="${e}/${o}.svg" alt="${a}" />
        </span>
      `).join("")}
    </section>
  `}function D(){return`
    <div id="top-gauges">
      <div id="fuel-gauge" class="gauge-mini">
        <div class="gauge-mini-bar">
          <div class="gauge-mini-fill"></div>
        </div>
        <div class="gauge-mini-value">
          <img src="../../assets/icons/fuel.svg" alt="fuel" />
          <span id="fuelLevel">00</span>%
        </div>
      </div>

      <div id="clt-gauge" class="gauge-mini">
        <div class="gauge-mini-bar">
          <div class="gauge-mini-fill"></div>
        </div>
        <div class="gauge-mini-value">
          <img src="../../assets/icons/temp.svg" alt="clt" />
          <span id="cltNow">00</span>°C
        </div>
      </div>
    </div>
  `}function A({rpmM:t=8}={}){return`
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
        <div id="speedo" class="gauge-center">0</div>
        <div class="gauge-arc-clip">
          <div class="gauge-arc-fill kmh-fill"></div>
        </div>
      </div>
    </div>
  `}function B(t){const n=document.getElementById("rpmnumbers");if(n)for(let e=t;e>=0;e--){const a=document.createElement("div");a.style.cssText=`
      animation-delay: ${(e+15)*.2}s;
      transform: translateX(${e/t*-180}px);
    `,a.textContent=e,n.appendChild(a)}}function E(){const t=[0,20,40,60,100,140,200,260],n=document.getElementById("kmhnumbers");if(n)for(let e=t.length-1;e>=0;e--){const a=document.createElement("div");a.style.cssText=`
      animation-delay: ${(e+15)*.2}s;
      transform: translateX(${e/(t.length-1)*180}px);
    `,a.textContent=t[e],n.appendChild(a)}}const N=[{id:"battLevel",label:"BATT",unit:"V"},{id:"fuelPressure",label:"FUEL",unit:"BAR"},{id:"lambda",label:"LAMBDA",unit:"λ"},{id:"mapBoost",label:"BOOST",unit:"BAR"},{id:"oilPressure",label:"OIL",unit:"BAR"},{id:"mat",label:"MAT",unit:"°C"}];function M(){return`
    <div id="micro-gauges">
      ${N.map(({id:t,label:n,unit:e})=>`
        <div class="micro-gauge">
          <div class="micro-label">${n}</div>
          <span id="${t}">0</span>
          <div class="micro-unit">${e}</div>
        </div>
      `).join("")}
    </div>
  `}function O(){return`
    <div id="odometer">
      <div class="odo-trip">TRIP <span id="kmTrip">0</span> km</div>
      <div class="odo-total">TOTAL <span id="kmTotal">0</span> km</div>
    </div>
  `}const g=`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="35" viewBox="0 0 24 35" fill="none">
<path class="arrow" d="M8.80768 3.84839L20.2032 16.0125L21.3555 17.2429L20.169 18.4402L8.4483 30.2761L7.20514 31.532L5.961 30.2761L3.68268 27.9744L2.46295 26.7429L3.68268 25.5115L11.9044 17.2087L3.68268 8.90601L2.46295 7.67456L3.68268 6.44312L6.28717 3.81323L7.56549 2.52222L8.80768 3.84839Z" stroke="red" stroke-width="3.5"/>
</svg>`;function x(t){return`
    <div id="turn${t}" class="turn-signal">
      ${g}
      ${g}
      ${g}
    </div>
  `}function b(t){const n=document.getElementById(`turn${t}`),e=n?Array.from(n.querySelectorAll(".arrow")):[];let a=0,o=0;const u=180,p=()=>{a=0,o=0,e.forEach(c=>{c.style.stroke="#ff6d6d",c.style.opacity=.4})};return{update(c,f){if(!c){p();return}f-o>u&&(a=(a+1)%(e.length+1),o=f),e.forEach((r,d)=>{r.style.stroke=d<a?"ff4545":"#ff6d6d",r.style.opacity=d<a?1:.4})}}}const v=()=>{const{cMain:t,cSec:n}=COLORS,{rpmM:e,aSpd:a,clt:o,icon:u}=DASH_OPTIONS,p=e*1e3;document.getElementById("container").innerHTML=`
    ${x("left")}
    ${R({icon:u})}
    ${x("right")}
    ${D()}
    ${A({rpmM:e})}
    ${M()}
    ${O()}
  `,setRootCSS("--main-color",t),setRootCSS("--second-color",n),B(e),E();const c=b("left"),f=b("right"),r=T,d=[...r,"container","speedo","kmTrip","kmTotal","fuelLevel","cltNow","gear","battLevel","fuelPressure","lambda","oilPressure","mapBoost","mat"].reduce((i,l)=>({...i,[l]:document.getElementById(l)}),{}),{container:P,speedo:I,kmTrip:y,kmTotal:k,gear:F,mat:z,battLevel:_,fuelPressure:G,lambda:j,oilPressure:U,mapBoost:X,fuelLevel:V,cltNow:q}=d;loadOdo(k,y,0);let[w,L,m,C]=[!1,!1,!1,!1];const H=()=>{[w,L,m,C]=[useCanChannel(),useCanChannel("sRpm"),useCanChannel("sVss"),useCanChannel("sClt")]},Z=i=>{setRootCSS("--rpm-bar",`${294-(i??0)/p*294}px`)},J=(i,l)=>{setText(I,zeroFixed(a<2?l??i:i));let s=0;i<=60?s=i/60*125:i<=140?s=125+(i-60)/80*83:i<=260&&(s=208+(i-140)/120*86),setRootCSS("--kmh-bar",`${294-s}px`)},S=i=>{if(checkCache("useCAN",useCanChannel())||H(),w&&(setText(F,canData.gear),setText(z,canData.mat),setText(X,mapFormat(canData.map)),setText(G,canData.fuelPress),setText(_,canData.batt),setText(j,canData.lambda),setText(U,canData.oilPress)),isBasicOnline){setText(V,fuelLevelFormat(basicData,"lvlFuel")),setRootCSS("--fuel-bar",`${1-safeReturn(basicData,"lvlFuel")/100}`);for(let s=0;s<r.length;s++)etoggle(d[r[s]],basicData[r[s]]);c.update(basicData.turnLeft,i),f.update(basicData.turnRight,i)}Z(L?canData.rpm:safeReturn(basicData,"rpm")),J(...m?[canData.vss]:[basicData.kmh,basicData.kmhF]);const l=C?canData.clt:safeReturn(basicData,"clt");setRootCSS("--clt-bar",`${l/o}`),setText(q,zeroFixed(l)),updateOdo(k,y,m?canData.odoNow:basicData.odoNow),requestAnimationFrame(S)};setTimeout(()=>openConnection(S),5e3),P.classList.add("anim-in")};document.readyState==="complete"?v():window.addEventListener("load",v)})();
