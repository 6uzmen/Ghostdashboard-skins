(function(){"use strict";var h=document.createElement("style");h.textContent=`@font-face{font-family:Rubik;font-weight:600;src:local("Rubik Medium"),local("Rubik-Medium"),url(../../assets/fonts/Rubik-Medium.ttf) format("truetype")}@font-face{font-family:Digital Numbers;src:url(fonts/DigitalNumbers-Regular.ttf) format("truetype")}:root{--main-color: #cc0000;--second-color: #e8e8e8;--rpm-bar: 294px;--kmh-bar: 294px;--fuel-bar: 1;--clt-bar: 0}*,*:before,*:after{box-sizing:border-box;margin:0;padding:0}body,html{width:1280px;height:480px;overflow:hidden;background:#111;font-family:Rubik,sans-serif;color:#fff;-webkit-font-smoothing:antialiased}#container{width:1280px;height:480px;position:relative;opacity:0}#container.anim-in{animation:fadeIn .6s ease forwards}#container.anim-out{animation:fadeOut .4s ease forwards}@keyframes fadeIn{0%{opacity:0;transform:scale(.98)}to{opacity:1;transform:scale(1)}}@keyframes fadeOut{0%{opacity:1}to{opacity:0}}#top-icons{position:absolute;top:16px;left:50%;transform:translate(-50%);display:flex;gap:20px;align-items:center}#top-icons span{display:inline-flex;opacity:.15;transition:opacity .15s ease}#top-icons img{width:22px;height:22px;filter:invert(1)}#turnLeft,#turnRight,#turnLeft img,#turnRight img{filter:none}#top-gauges{position:absolute;top:56px;left:50%;transform:translate(-50%);display:flex;gap:48px;align-items:center}.gauge-mini{display:flex;flex-direction:column;align-items:center;gap:6px}.gauge-mini-bar{width:140px;height:5px;background:#ffffff1f;border-radius:3px;overflow:hidden}.gauge-mini-fill{height:100%;background:var(--main-color);transform-origin:left center;will-change:transform}#fuel-gauge .gauge-mini-fill{transform:scaleX(calc(1 - var(--fuel-bar)))}#clt-gauge .gauge-mini-fill{transform:scaleX(var(--clt-bar))}.gauge-mini-value{display:flex;align-items:center;gap:6px;font-size:13px;letter-spacing:.5px;color:#ffffffbf}.gauge-mini-value img{width:14px;height:14px;filter:invert(1);opacity:.6}.turn-signal{--turn-on: .12s;--turn-off: .34s;display:flex;align-items:center;width:fit-content}.turn-signal svg{display:block;width:66px;height:42px;overflow:visible}.turn-left svg{transform:scaleX(-1)}.turn-signal .chevron path{stroke-width:3.5;transition:stroke var(--turn-off) ease-out,stroke-opacity var(--turn-off) ease-out,opacity var(--turn-off) ease-out}.turn-signal .chevron .glow{stroke:#ff5252;stroke-opacity:.65;opacity:0}.turn-signal .chevron .core{stroke:#ff4545;stroke-opacity:.1}.turn-signal .chevron[data-level="1"] path{transition-duration:var(--turn-on)}.turn-signal .chevron[data-level="1"] .core{stroke:#ff4545;stroke-opacity:1}.turn-signal .chevron[data-level="1"] .glow{opacity:1}.turn-signal .chevron[data-level="2"] .core{stroke:#ff6161;stroke-opacity:.6}.turn-signal .chevron[data-level="3"] .core{stroke:#ff6d6d;stroke-opacity:.4}#main-gauges{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;gap:80px;align-items:center}.gauge-circle{position:relative;width:210px;height:210px;border-radius:50%;border:2px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;background:#0006}.gauge-center{font-size:52px;font-weight:700;letter-spacing:-1px;color:#fff;z-index:2;-webkit-user-select:none;user-select:none}.gauge-numbers{position:absolute;bottom:12px;left:50%;transform:translate(-50%);display:flex;align-items:flex-end;font-size:9px;color:#fff6;pointer-events:none}.gauge-numbers div{position:absolute}.gauge-arc-clip{position:absolute;bottom:0;left:6px;right:6px;height:6px;border-radius:3px;overflow:hidden;background:#ffffff14}.gauge-arc-fill{height:100%;background:var(--main-color);will-change:transform;transform-origin:left center}.rpm-fill{width:calc(100% + 294px);transform:translate(calc(-1px * var(--rpm-bar)))}.kmh-fill{width:calc(100% + 294px);transform:translate(calc(-1px * var(--kmh-bar)))}#speedo{--spd-main: #f5f5f5;--spd-glow: #f5f5f5;--spd-glow-lead: #f5f5f5;--spd-units: #f5f5f5;display:flex;font-family:Digital Numbers,monospace;font-size:48px;line-height:normal;-webkit-user-select:none;user-select:none;z-index:2}#speedo[data-tier="2"]{--spd-main: #fbfdc7;--spd-glow: #fbfdc7;--spd-glow-lead: #fffee4;--spd-units: #fbfdc7}#speedo[data-tier="3"]{--spd-main: #ff9c45;--spd-glow: #ff6333;--spd-glow-lead: #ff6333;--spd-units: #ff6333}#speedo[data-tier="4"]{--spd-main: #ff4545;--spd-glow: #ff3d5e;--spd-glow-lead: #ff3d5e;--spd-units: #ff3d5e}#speedo[data-tier="5"]{--spd-main: #ff4040;--spd-glow: #ff509c;--spd-glow-lead: #ff509c;--spd-units: #ff509c}.spd-digit{position:relative;width:39px;text-align:center}.spd-digit span{display:block;color:var(--spd-main)}.spd-digit .spd-main{position:relative}.spd-digit .spd-glow{position:absolute;top:0;right:0;bottom:0;left:0;color:var(--spd-glow);filter:blur(2.25px)}.spd-digit.hundreds .spd-glow{color:var(--spd-glow-lead);filter:blur(3.5px)}.spd-digit.ghost span{opacity:.1;color:#f5f5f5}.spd-digit.units span{opacity:.45;color:var(--spd-units)}.spd-digit.ghost .spd-glow,.spd-digit.units .spd-glow,#speedo[data-tier="0"] .spd-glow{display:none}#speedo[data-tier="0"] .spd-digit:not(.ghost) span{opacity:.8}#speedo[data-tier="0"] .spd-digit.units span{opacity:.75}#micro-gauges{position:absolute;bottom:28px;left:50%;transform:translate(-50%);display:flex;gap:32px;align-items:flex-end}.micro-gauge{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:56px}.micro-label{font-size:9px;font-weight:600;letter-spacing:1.5px;color:#fff6;text-transform:uppercase}.micro-gauge>span{font-size:24px;font-weight:700;color:var(--main-color);line-height:1}.micro-unit{font-size:9px;letter-spacing:.5px;color:#ffffff4d}#odometer{position:absolute;bottom:8px;width:100%;display:flex;justify-content:space-between;padding:0 48px;font-size:11px;letter-spacing:1.5px;color:#ffffff59;text-transform:uppercase}#odometer span{color:#ffffffb3;font-weight:600;margin:0 4px}
/*$vite$:1*/`,document.head.appendChild(h);const A=["battAlt","eBrake","highBeam","parkLights","fogLights","auxLights","openDoor","fan","oilSwitch","ECUErr"],f=["M6.28715 7.81329L3.68266 10.4432L2.46293 11.6746L3.68266 12.9061L11.9053 21.2088L3.68266 29.5115L2.46293 30.743L3.68266 31.9744L5.96098 34.2762L7.20512 35.532L8.44829 34.2762L20.169 22.4402L21.3555 21.243L20.2032 20.0125L8.80766 7.84845L7.56547 6.52228L6.28715 7.81329Z","M25.2872 7.81329L22.6827 10.4432L21.4629 11.6746L22.6827 12.9061L30.9053 21.2088L22.6827 29.5115L21.4629 30.743L22.6827 31.9744L24.961 34.2762L26.2051 35.532L27.4483 34.2762L39.169 22.4402L40.3555 21.243L39.2032 20.0125L27.8077 7.84845L26.5655 6.52228L25.2872 7.81329Z","M44.2872 7.81329L41.6827 10.4432L40.4629 11.6746L41.6827 12.9061L49.9053 21.2088L41.6827 29.5115L40.4629 30.743L41.6827 31.9744L43.961 34.2762L45.2051 35.532L46.4483 34.2762L58.169 22.4402L59.3555 21.243L58.2032 20.0125L46.8077 7.84845L45.5655 6.52228L44.2872 7.81329Z"],x=150,B=350,v=400,b=x*f.length+B+v;function L(e){const a=`turn-glow-${e}`;return`
    <div id="turn${e}" class="turn-signal turn-${e}">
      <svg viewBox="0 0 65.7849 42.0188" fill="none" aria-hidden="true">
        <defs>
          <filter id="${a}" x="-50%" y="-50%" width="200%" height="200%"
            color-interpolation-filters="sRGB">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        ${f.map(t=>`
          <g class="chevron" data-level="0">
            <path class="glow" d="${t}" filter="url(#${a})" />
            <path class="core" d="${t}" />
          </g>`).join("")}
      </svg>
    </div>
  `}const E=e=>{const a=Math.min(f.length,Math.floor(e/x)+1);return e>=b-v?f.map(()=>0):f.map((t,i)=>i<a?a-i:0)};function y(e){const a=document.getElementById(`turn${e}`),t=a?Array.from(a.querySelectorAll(".chevron")):[];let i=null,o="";const p=l=>{const s=l.join("");s!==o&&(o=s,t.forEach((u,d)=>{u.dataset.level=l[d]}))};return{update(l,s){if(Number(l)!==0){i=null,p(f.map(()=>0));return}i===null&&(i=s),p(E((s-i)%b))}}}function N(){return`
    <div id="top-gauges">
      ${L("left")}
      ${L("right")}
    </div>
  `}const w=[0,50,100,140,180,200],O=["hundreds","tens","units"];function I(){return`
    <div id="speedo" data-tier="0">
      ${O.map(e=>`
        <div class="spd-digit ${e}">
          <span class="spd-glow">0</span>
          <span class="spd-main">0</span>
        </div>
      `).join("")}
    </div>
  `}const F=e=>{let a=0;for(let t=1;t<w.length;t++)e>=w[t]&&(a=t);return a};function P(){const e=document.getElementById("speedo"),a=Array.from(e.querySelectorAll(".spd-digit")).map(i=>({el:i,spans:i.querySelectorAll("span")}));let t=-1;return{update(i){const o=Math.min(999,Math.max(0,Math.round(i??0)));if(o===t)return;t=o,e.dataset.tier=F(o);const p=String(o).padStart(3,"0"),l=o===0?2:3-String(o).length;a.forEach(({el:s,spans:u},d)=>{u[0].textContent=p[d],u[1].textContent=p[d],s.classList.toggle("ghost",d<l)})}}}function z({rpmM:e=8}={}){return`
    <div id="main-gauges">
      <div id="rpm-gauge" class="gauge-circle">
        <div id="rpmnumbers" class="gauge-numbers rpm-max-${e}"></div>
        <div id="gear" class="gauge-center">N</div>
        <div class="gauge-arc-clip">
          <div class="gauge-arc-fill rpm-fill"></div>
        </div>
      </div>

      <div id="speed-gauge" class="gauge-circle">
        <div id="kmhnumbers" class="gauge-numbers"></div>
        ${I()}
        <div class="gauge-arc-clip">
          <div class="gauge-arc-fill kmh-fill"></div>
        </div>
      </div>
    </div>
  `}function _(e){const a=document.getElementById("rpmnumbers");if(a)for(let t=e;t>=0;t--){const i=document.createElement("div");i.style.cssText=`
      animation-delay: ${(t+15)*.2}s;
      transform: translateX(${t/e*-180}px);
    `,i.textContent=t,a.appendChild(i)}}function G(){const e=[0,20,40,60,100,140,200,260],a=document.getElementById("kmhnumbers");if(a)for(let t=e.length-1;t>=0;t--){const i=document.createElement("div");i.style.cssText=`
      animation-delay: ${(t+15)*.2}s;
      transform: translateX(${t/(e.length-1)*180}px);
    `,i.textContent=e[t],a.appendChild(i)}}const j=[{id:"battLevel",label:"BATT",unit:"V"},{id:"fuelPressure",label:"FUEL",unit:"BAR"},{id:"lambda",label:"LAMBDA",unit:"λ"},{id:"mapBoost",label:"BOOST",unit:"BAR"},{id:"oilPressure",label:"OIL",unit:"BAR"},{id:"mat",label:"MAT",unit:"°C"}];function X(){return`
    <div id="micro-gauges">
      ${j.map(({id:e,label:a,unit:t})=>`
        <div class="micro-gauge">
          <div class="micro-label">${a}</div>
          <span id="${e}">0</span>
          <div class="micro-unit">${t}</div>
        </div>
      `).join("")}
    </div>
  `}function q(){return`
    <div id="odometer">
      <div class="odo-trip">TRIP <span id="kmTrip">0</span> km</div>
      <div class="odo-total">TOTAL <span id="kmTotal">0</span> km</div>
    </div>
  `}const k=()=>{const{cMain:e,cSec:a}=COLORS,{rpmM:t,aSpd:i,clt:o,icon:p}=DASH_OPTIONS,l=t*1e3;document.getElementById("container").innerHTML=`
    ${N()}
    ${z({rpmM:t})}
    ${X()}
    ${q()}
  `,setRootCSS("--main-color",e),setRootCSS("--second-color",a),_(t),G();const s=P(),u=y("left"),d=y("right"),g=A,S=[...g,"container","kmTrip","kmTotal","fuelLevel","cltNow","gear","battLevel","fuelPressure","lambda","oilPressure","mapBoost","mat"].reduce((n,c)=>({...n,[c]:document.getElementById(c)}),{}),{container:H,kmTrip:C,kmTotal:T,gear:V,mat:U,battLevel:Z,fuelPressure:Y,lambda:J,oilPressure:K,mapBoost:Q,fuelLevel:W,cltNow:tt}=S;loadOdo(T,C,0);let[R,$,m,D]=[!1,!1,!1,!1];const et=()=>{[R,$,m,D]=[useCanChannel(),useCanChannel("sRpm"),useCanChannel("sVss"),useCanChannel("sClt")]},at=n=>{setRootCSS("--rpm-bar",`${294-(n??0)/l*294}px`)},it=(n,c)=>{s.update(i<2?c??n:n);let r=0;n<=60?r=n/60*125:n<=140?r=125+(n-60)/80*83:n<=260&&(r=208+(n-140)/120*86),setRootCSS("--kmh-bar",`${294-r}px`)},M=n=>{if(checkCache("useCAN",useCanChannel())||et(),R&&(setText(V,canData.gear),setText(U,canData.mat),setText(Q,mapFormat(canData.map)),setText(Y,canData.fuelPress),setText(Z,canData.batt),setText(J,canData.lambda),setText(K,canData.oilPress)),isBasicOnline){setText(W,fuelLevelFormat(basicData,"lvlFuel")),setRootCSS("--fuel-bar",`${1-safeReturn(basicData,"lvlFuel")/100}`);for(let r=0;r<g.length;r++)etoggle(S[g[r]],basicData[g[r]]);u.update(basicData.turnLeft,n),d.update(basicData.turnRight,n)}at($?canData.rpm:safeReturn(basicData,"rpm")),it(...m?[canData.vss]:[basicData.kmh,basicData.kmhF]);const c=D?canData.clt:safeReturn(basicData,"clt");setRootCSS("--clt-bar",`${c/o}`),setText(tt,zeroFixed(c)),updateOdo(T,C,m?canData.odoNow:basicData.odoNow),requestAnimationFrame(M)};setTimeout(()=>openConnection(M),5e3),H.classList.add("anim-in")};document.readyState==="complete"?k():window.addEventListener("load",k)})();
