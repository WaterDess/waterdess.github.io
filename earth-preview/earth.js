/* Independent preview: analytical 3D sphere, local photographic texture, no runtime dependencies. */
(() => {
  'use strict';
  const hero = document.querySelector('.home-landing');
  if (!hero) return;
  const scriptBase = new URL('.', document.currentScript.src);
  const space = document.createElement('div');
  space.className = 'earth-space';
  hero.prepend(space);
  const canvas = document.createElement('canvas');
  canvas.className = 'earth-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  hero.append(canvas);
  const tools = document.createElement('div');
  tools.className = 'preview-tools';
  tools.innerHTML = '<span>EARTH IN MOTION · COVER PREVIEW</span><div class="preview-actions"><button type="button" hidden>Pause rotation</button><a href="' + new URL('../index.html', scriptBase).href + '">Current homepage ↗</a></div>';
  hero.append(tools);
  const credit=document.createElement('a');
  credit.className='space-credit';
  credit.href=new URL('credits.html',scriptBase).href;
  credit.textContent='Space image: ESO/S. Brunier · CC BY 4.0';
  hero.append(credit);
  const button = tools.querySelector('button');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motion.matches, ready = false, angle = 1.55, last = 0, frame = 0;
  let gl;
  function fallback() {
    ready = false;
    cancelAnimationFrame(frame);
    hero.classList.remove('earth-ready');
    button.hidden = true;
    tools.querySelector('span').textContent = 'COVER PREVIEW · STATIC EARTH';
  }
  try {
    gl = canvas.getContext('webgl', { alpha:true, premultipliedAlpha:false, antialias:false, powerPreference:'low-power' });
    if (!gl) return fallback();
    const vertex = 'attribute vec2 p; void main(){gl_Position=vec4(p,0.,1.);}';
    const fragment = `precision highp float;
      uniform vec2 size; uniform float angle; uniform sampler2D earth; uniform sampler2D clouds;
      void main(){
        float radius=min(size.y*.435,size.x*.46);
        vec2 p=(gl_FragCoord.xy-size*.5)/radius;
        float r=length(p);
        if(r>1.035) discard;
        if(r>1.) { float a=pow(max(0.,1.-(r-1.)/.035),3.)*.28; gl_FragColor=vec4(.18,.43,.88,a); return; }
        vec3 n=vec3(p,sqrt(max(0.,1.-dot(p,p))));
        float tilt=.10;
        vec3 q=vec3(n.x*cos(tilt)+n.y*sin(tilt),-n.x*sin(tilt)+n.y*cos(tilt),n.z);
        float lat=.17;
        q=vec3(q.x,q.y*cos(lat)+q.z*sin(lat),-q.y*sin(lat)+q.z*cos(lat));
        vec2 uv=vec2(fract(.5+(atan(q.x,q.z)+angle)/6.2831853),.5-asin(clamp(q.y,-1.,1.))/3.14159265);
        vec3 color=texture2D(earth,uv).rgb;
        float light=max(dot(n,normalize(vec3(-.65,.55,1.4))),0.);
        color.b*=1.28; color.g*=1.08;
        vec4 cloud=texture2D(clouds,uv);
        color=mix(color,vec3(.94,.96,1.),cloud.a*.82);
        color*=.45+.65*light;
        float rim=pow(1.-n.z,3.5);
        color=mix(color,vec3(.16,.37,.69),rim*.48);
        gl_FragColor=vec4(color,1.);
      }`;
    function shader(type, source) {
      const s=gl.createShader(type); gl.shaderSource(s,source); gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s));
      return s;
    }
    const program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment)); gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw Error('Shader link failed');
    gl.useProgram(program);
    const buffer=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const pos=gl.getAttribLocation(program,'p'); gl.enableVertexAttribArray(pos); gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    const size=gl.getUniformLocation(program,'size'), rotation=gl.getUniformLocation(program,'angle');
    function draw(now) {
      frame=0;
      if(!ready || document.hidden) return;
      if(!paused && last) angle += Math.min(now-last,100)*.000035;
      last=now;
      gl.uniform1f(rotation,angle); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLES,0,6);
      if(!paused) frame=requestAnimationFrame(draw);
    }
    function resume() { cancelAnimationFrame(frame); last=0; frame=requestAnimationFrame(draw); }
    function resize() {
      const dpr=Math.min(devicePixelRatio||1,1.5);
      canvas.width=Math.round(hero.clientWidth*dpr); canvas.height=Math.round(hero.clientHeight*dpr);
      gl.viewport(0,0,canvas.width,canvas.height); gl.uniform2f(size,canvas.width,canvas.height); resume();
    }
    function label() { button.textContent=paused?'Resume rotation':'Pause rotation'; button.setAttribute('aria-pressed',String(paused)); }
    button.addEventListener('click',()=>{paused=!paused; label(); resume();});
    motion.addEventListener('change',()=>{paused=motion.matches; label(); resume();});
    document.addEventListener('visibilitychange',resume);
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback();});
    new ResizeObserver(resize).observe(hero);
    const img=new Image();
    img.onload=()=>{
      try {
        const texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,img);
        ready=true; hero.classList.add('earth-ready'); button.hidden=false; label(); resize();
      } catch(error) { fallback(); }
    };
    img.onerror=fallback;
    const cloudImg=new Image();
    cloudImg.onload=()=>{
      try {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D,gl.createTexture());
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cloudImg);
        gl.uniform1i(gl.getUniformLocation(program,'clouds'),1);
        gl.activeTexture(gl.TEXTURE0);
        img.src=window.EARTH_PREVIEW_TEXTURE || new URL('../public/assets/earth-preview/earth.jpg',scriptBase).href;
      } catch(error) { fallback(); }
    };
    cloudImg.onerror=fallback;
    cloudImg.src=window.EARTH_PREVIEW_CLOUDS || new URL('../public/assets/earth-preview/clouds.png',scriptBase).href;
  } catch(error) { fallback(); }
})();
