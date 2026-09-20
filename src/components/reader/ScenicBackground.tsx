import { useEffect, useRef, useState } from 'react'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

type Scene = 'sky' | 'shanhai'

function cloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, alpha: number) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.ellipse(x, y, 115*s, 42*s, 0, 0, Math.PI*2)
  ctx.ellipse(x-72*s, y+8*s, 80*s, 34*s, 0, 0, Math.PI*2)
  ctx.ellipse(x+76*s, y+10*s, 92*s, 36*s, 0, 0, Math.PI*2)
  ctx.ellipse(x-20*s, y-28*s, 76*s, 52*s, 0, 0, Math.PI*2)
  ctx.ellipse(x+42*s, y-20*s, 68*s, 48*s, 0, 0, Math.PI*2)
  ctx.fill()
  ctx.restore()
}

function drawSky(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const g = ctx.createLinearGradient(0,0,0,h)
  g.addColorStop(0,'#55b8f2'); g.addColorStop(.55,'#9ddcff'); g.addColorStop(1,'#e8f8ff')
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h)
  const glow=ctx.createRadialGradient(w*.76,h*.17,0,w*.76,h*.17,w*.34)
  glow.addColorStop(0,'rgba(255,252,220,.92)'); glow.addColorStop(.28,'rgba(255,246,198,.3)'); glow.addColorStop(1,'rgba(255,255,255,0)')
  ctx.fillStyle=glow; ctx.fillRect(0,0,w,h)
  const drift=(t*.018*w)%(w+420)
  cloud(ctx, (w*.12+drift)%(w+420)-210, h*.27, Math.max(.8,w/900), .88)
  cloud(ctx, (w*.76+drift*.55)%(w+520)-260, h*.48, Math.max(1,w/820), .78)
  cloud(ctx, (w*.34+drift*.32)%(w+620)-310, h*.72, Math.max(1.2,w/760), .7)
  cloud(ctx, (w*.9+drift*.2)%(w+500)-250, h*.86, Math.max(.9,w/900), .48)
}

function mountain(ctx: CanvasRenderingContext2D,w:number,h:number,base:number,peaks:number[],fill:string){
  ctx.fillStyle=fill; ctx.beginPath(); ctx.moveTo(0,h)
  ctx.lineTo(0,base)
  peaks.forEach((p,i)=>ctx.lineTo((i/(peaks.length-1))*w,base-p*h))
  ctx.lineTo(w,h); ctx.closePath(); ctx.fill()
}
function drawShanhai(ctx: CanvasRenderingContext2D,w:number,h:number,t:number){
  const g=ctx.createLinearGradient(0,0,0,h)
  g.addColorStop(0,'#8ecbd8'); g.addColorStop(.5,'#dce9df'); g.addColorStop(1,'#e8cfad')
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h)
  const sun=ctx.createRadialGradient(w*.72,h*.2,0,w*.72,h*.2,w*.24)
  sun.addColorStop(0,'rgba(255,244,194,.9)'); sun.addColorStop(1,'rgba(255,220,150,0)')
  ctx.fillStyle=sun; ctx.fillRect(0,0,w,h)
  mountain(ctx,w,h,h*.58,[.02,.16,.07,.25,.09,.2,.04],'rgba(105,148,143,.5)')
  mountain(ctx,w,h,h*.67,[.04,.18,.08,.29,.12,.22,.06],'rgba(75,119,116,.78)')
  mountain(ctx,w,h,h*.75,[.02,.15,.06,.24,.09,.19,.03],'#365f5e')
  const drift=(t*.012*w)%(w+500)
  cloud(ctx,(w*.18+drift)%(w+500)-250,h*.54,Math.max(1,w/780),.56)
  cloud(ctx,(w*.78+drift*.65)%(w+600)-300,h*.61,Math.max(1.1,w/760),.48)
  const sea=ctx.createLinearGradient(0,h*.7,0,h)
  sea.addColorStop(0,'#8bb8b5'); sea.addColorStop(1,'#416d72')
  ctx.fillStyle=sea; ctx.fillRect(0,h*.72,w,h*.28)
  ctx.strokeStyle='rgba(224,241,235,.42)'; ctx.lineWidth=2
  for(let i=0;i<7;i++){
    const y=h*(.77+i*.035)
    ctx.beginPath()
    for(let x=-30;x<=w+30;x+=18){
      const yy=y+Math.sin(x*.018+t*.0018+i)*3
      x===-30?ctx.moveTo(x,yy):ctx.lineTo(x,yy)
    }
    ctx.stroke()
  }
}

export default function ScenicBackground({scene,motion,variant}:{scene:Scene;motion:boolean;variant:'space'|'reader'}){
  const canvas=useRef<HTMLCanvasElement>(null)
  const [reduced,setReduced]=useState(false)
  useEffect(()=>{
    const media=window.matchMedia?.(REDUCED_MOTION_QUERY)
    if(!media)return
    const sync=()=>setReduced(media.matches); sync()
    media.addEventListener?.('change',sync)
    return()=>media.removeEventListener?.('change',sync)
  },[])
  useEffect(()=>{
    const el=canvas.current
    if(!el)return
    const ctx=el.getContext('2d')
    if(!ctx)return
    let frame=0
    const render=(time=0)=>{
      const dpr=Math.min(window.devicePixelRatio||1,2)
      const rect=el.getBoundingClientRect()
      const width=Math.max(1,Math.round(rect.width*dpr)),height=Math.max(1,Math.round(rect.height*dpr))
      if(el.width!==width||el.height!==height){el.width=width;el.height=height}
      ctx.setTransform(dpr,0,0,dpr,0,0)
      const w=width/dpr,h=height/dpr
      scene==='sky'?drawSky(ctx,w,h,time):drawShanhai(ctx,w,h,time)
      if(motion&&!reduced) frame=requestAnimationFrame(render)
    }
    render()
    return()=>cancelAnimationFrame(frame)
  },[scene,motion,reduced])
  return <div key={scene} className={`scenic-ambience scenic-${scene} scenic-${variant}`} data-scene={scene} data-animated={motion&&!reduced?'true':'false'} aria-hidden="true"><canvas ref={canvas} className="scenic-canvas"/><div className="scenic-tint"/></div>
}
