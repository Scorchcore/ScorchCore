"use client";

import { useEffect, useRef } from "react";

const SHADER_SRC = `#version 300 es
precision highp float;

out vec4 fragColor;
in vec2 v_uv;

uniform vec3  iResolution;
uniform float iTime;
uniform int   iFrame;
uniform vec4  iMouse;
uniform float uHeat;

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2  r  = iResolution.xy;
    float t  = iTime;
    vec3  FC = vec3(fragCoord, t);
    vec4  o  = vec4(0.0);

    float s = 0.0;
    for (float i = 0.0, z = 0.0, d = 0.0; i++ < 8e1; o += (cos(s + vec4(0.0, 1.0, 8.0, 0.0)) + 1.0) / d)
    {
        vec3 p = z * normalize(FC.rgb * 2.0 - r.xyy);
        vec3 a = normalize(cos(vec3(5.0, 0.0, 1.0) + t - d * 4.0));
        p.z += 5.0;

        a = a * dot(a, p) - cross(a, p);
        for (d = 1.0; d++ < 9.0; )
            a -= sin(a * d + t).zxy / d;

        z += d = 0.1 * abs(length(p) - 3.0) + 0.07 * abs(cos(s = a.y));
    }
    o = tanh(o / 5e3);

    vec3 val = o.rgb;
    float lum = length(val) / sqrt(3.0);

    // Brand color ramp (cool: blues, cyans, subtle oranges)
    vec3 brandLow  = vec3(0.02, 0.03, 0.08);
    vec3 brandMid  = vec3(0.08, 0.35, 0.55);
    vec3 brandHigh = vec3(0.45, 0.75, 0.95);

    // Heat color ramp (warm: reds, oranges, yellows)
    vec3 heatLow  = vec3(0.10, 0.01, 0.00);
    vec3 heatMid  = vec3(0.85, 0.25, 0.02);
    vec3 heatHigh = vec3(1.00, 0.85, 0.15);

    vec3 brand = mix(brandLow, brandMid, smoothstep(0.0, 0.45, lum));
    brand = mix(brand, brandHigh, smoothstep(0.45, 1.0, lum));

    vec3 heat = mix(heatLow, heatMid, smoothstep(0.0, 0.45, lum));
    heat = mix(heat, heatHigh, smoothstep(0.45, 1.0, lum));

    vec3 finalColor = mix(brand, heat, uHeat);

    // Dark areas fade to transparent so the page bg shows through
    float alpha = smoothstep(0.0, 0.12, lum);
    fragColor = vec4(finalColor, alpha);
}

void main(){
  mainImage(fragColor, gl_FragCoord.xy);
}
`;

const VERT_SRC = `#version 300 es
precision highp float;
layout(location=0) in vec2 a_pos;
out vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

function safeCompile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return { shader: null, log: "createShader failed" };
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  const ok = gl.getShaderParameter(sh, gl.COMPILE_STATUS);
  const log = gl.getShaderInfoLog(sh) || "";
  return { shader: ok ? sh : null, log };
}

function safeLink(
  gl: WebGL2RenderingContext,
  vs: WebGLShader,
  fs: WebGLShader,
) {
  const prog = gl.createProgram();
  if (!prog) return { program: null, log: "createProgram failed" };
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  const ok = gl.getProgramParameter(prog, gl.LINK_STATUS);
  const log = gl.getProgramInfoLog(prog) || "";
  return { program: ok ? prog : null, log };
}

function drawError(gl: WebGL2RenderingContext, msg: string) {
  console.error(msg);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clearColor(0.05, 0.02, 0.02, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

interface ForgeShaderProps {
  heat?: number;
  pixelRatio?: number;
  /** Fraction of display resolution to render at (0–1). Lower = faster. */
  renderScale?: number;
  /** Cap the render framerate. The look is ambient so ~30–40 is plenty. */
  maxFps?: number;
}

export default function ForgeShader({
  heat = 0,
  pixelRatio,
  renderScale = 1.0,
  maxFps = 40,
}: ForgeShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, l: 0, r: 0 });
  const heatRef = useRef(heat);

  useEffect(() => {
    heatRef.current = heat;
  }, [heat]);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
    }) as WebGL2RenderingContext;
    if (!gl) return;

    let disposed = false;
    let vao: WebGLVertexArrayObject | null = null;
    let vbo: WebGLBuffer | null = null;
    let program: WebGLProgram | null = null;
    let ro: ResizeObserver | null = null;
    let resizeScheduled = false;
    let mouseBound = false;
    let ctxBound = false;

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current.x = Math.max(0, Math.min(x, rect.width));
      mouseRef.current.y = Math.max(0, Math.min(rect.height - y, rect.height));
    };
    const onDown = (e: MouseEvent) => {
      if (e.button === 0) mouseRef.current.l = 1;
      if (e.button === 2) mouseRef.current.r = 1;
    };
    const onUp = (e: MouseEvent) => {
      if (e.button === 0) mouseRef.current.l = 0;
      if (e.button === 2) mouseRef.current.r = 0;
    };
    const onCtxMenu = (e: Event) => e.preventDefault();
    const onContextLost = (ev: Event) => {
      ev.preventDefault();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    const onContextRestored = () => {
      scheduleSize();
      startRef.current = performance.now();
      frameRef.current = 0;
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    };

    const getDpr = () => {
      const sys = window.devicePixelRatio || 1;
      const base = Math.max(1, Math.min(2, pixelRatio ?? sys));
      return base * Math.max(0.25, Math.min(1, renderScale));
    };

    function applySize() {
      resizeScheduled = false;
      if (disposed || !gl) return;
      const dpr = getDpr();
      const cssW = Math.max(1, canvas.clientWidth | 0);
      const cssH = Math.max(1, canvas.clientHeight | 0);
      const w = Math.max(1, Math.floor(cssW * dpr));
      const h = Math.max(1, Math.floor(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function scheduleSize() {
      if (resizeScheduled) return;
      resizeScheduled = true;
      requestAnimationFrame(applySize);
    }

    vao = gl.createVertexArray();
    vbo = gl.createBuffer();
    if (!vao || !vbo) {
      drawError(gl, "Failed to create VAO/VBO");
      return cleanup;
    }
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const { shader: vs, log: vsLog } = safeCompile(
      gl,
      gl.VERTEX_SHADER,
      VERT_SRC,
    );
    if (!vs) {
      drawError(gl, `Vertex compile error:\n${vsLog}`);
      return cleanup;
    }
    const { shader: fs, log: fsLog } = safeCompile(
      gl,
      gl.FRAGMENT_SHADER,
      SHADER_SRC,
    );
    if (!fs) {
      drawError(gl, `Fragment compile error:\n${fsLog}`);
      gl.deleteShader(vs);
      return cleanup;
    }
    const linked = safeLink(gl, vs, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!linked.program) {
      drawError(gl, `Program link error:\n${linked.log}`);
      return cleanup;
    }
    program = linked.program;

    const uResolution = gl.getUniformLocation(program, "iResolution");
    const uTime = gl.getUniformLocation(program, "iTime");
    const uFrame = gl.getUniformLocation(program, "iFrame");
    const uMouse = gl.getUniformLocation(program, "iMouse");
    const uHeat = gl.getUniformLocation(program, "uHeat");

    ro = new ResizeObserver(scheduleSize);
    ro.observe(canvas);
    scheduleSize();

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mouseup", onUp);
    canvas.addEventListener("contextmenu", onCtxMenu);
    mouseBound = true;

    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    ctxBound = true;

    startRef.current = performance.now();
    frameRef.current = 0;

    const frameInterval = 1000 / Math.max(1, maxFps);
    let lastFrame = 0;

    function tick(now: number) {
      if (disposed) return;
      if (gl.isContextLost()) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (now - lastFrame < frameInterval) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      lastFrame = now;

      const t = (now - startRef.current) / 1000;
      frameRef.current += 1;

      try {
        if (resizeScheduled) applySize();

        // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API, not a React hook
        gl.useProgram(program);

        const dpr = getDpr();
        const w = canvas.width;
        const h = canvas.height;

        if (uResolution) gl.uniform3f(uResolution, w, h, dpr);
        if (uTime) gl.uniform1f(uTime, t);
        if (uFrame) gl.uniform1i(uFrame, frameRef.current);
        if (uMouse) {
          const m = mouseRef.current;
          gl.uniform4f(uMouse, m.x * dpr, m.y * dpr, m.l, m.r);
        }
        if (uHeat) gl.uniform1f(uHeat, heatRef.current);

        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      } catch (err) {
        drawError(gl, (err as Error)?.message ?? String(err));
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    const onVis = () => {
      if (document.hidden) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      } else {
        if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    function cleanup() {
      disposed = true;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (mouseBound) {
        canvas.removeEventListener("mousemove", onMove);
        canvas.removeEventListener("mousedown", onDown);
        canvas.removeEventListener("mouseup", onUp);
        canvas.removeEventListener("contextmenu", onCtxMenu);
        mouseBound = false;
      }
      if (ctxBound) {
        canvas.removeEventListener("webglcontextlost", onContextLost);
        canvas.removeEventListener("webglcontextrestored", onContextRestored);
        ctxBound = false;
      }

      document.removeEventListener("visibilitychange", onVis);

      if (ro) {
        try {
          ro.disconnect();
        } catch {}
        ro = null;
      }

      if (gl) {
        if (vbo) {
          try {
            gl.deleteBuffer(vbo);
          } catch {}
          vbo = null;
        }
        if (vao) {
          try {
            gl.deleteVertexArray(vao);
          } catch {}
          vao = null;
        }
        if (program) {
          try {
            gl.deleteProgram(program);
          } catch {}
          program = null;
        }
      }
    }

    return cleanup;
  }, [pixelRatio, renderScale, maxFps]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}
