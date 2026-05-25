# Estrategia Técnica — Landing Scroll Cinemático Axie Infinity

## 1. Objetivo

Diseñar y construir una **landing page de nivel grant** para el ecosistema **Axie Infinity**, basada en **scroll narrativo con sensación de avance en eje Z**, sin usar 3D hasta la escena final (forja), manteniendo coherencia visual, alto rendimiento y una arquitectura frontend clara.

La landing cuenta una historia:
**Batalla → Descanso → Exploración → Producción**, alineada con la evolución del ecosistema Axie.

---

## 2. Concepto Central

### Scroll ≠ desplazamiento vertical

El scroll no representa bajar por una página, sino **avanzar hacia dentro de un mundo**.

* El usuario no se mueve
* El entorno se acerca
* La cámara es fija

Esto se logra simulando un **eje Z** mediante:

* `scale()` progresivo
* control de `opacity`
* reemplazo de capas (asset swapping)

---

## 3. Arquitectura Visual

### 3.1 Capas de profundidad

La experiencia se construye con **5–10 escenas 2D**, cada una ocupando el viewport completo:

* Coliseo (batalla)
* Coliseo post-batalla
* Transición naturaleza
* Bosque (Axies durmiendo)
* Bosque profundo
* Entrada a cueva
* Coreminers
* Forja

Todas las imágenes comparten:

* Composición centrada
* Punto de fuga único
* Misma cámara

Esto permite escalar agresivamente sin romper la ilusión.

---

### 3.2 Reemplazo de detalle (Detail Replacement)

En lugar de una imagen gigante:

* Cada escena se escala hasta que pierde detalle
* Antes de romperse visualmente, se funde con la siguiente

El usuario percibe continuidad, no cortes.

---

## 4. Flujo Técnico del Scroll

### 4.1 Timeline conceptual

| Scroll Progress | Acción                        |
| --------------- | ----------------------------- |
| 0.0 – 0.15      | Coliseo batalla escala + fade |
| 0.15 – 0.30     | Post-batalla entra            |
| 0.30 – 0.45     | Transición a bosque           |
| 0.45 – 0.60     | Axies durmiendo               |
| 0.60 – 0.75     | Bosque profundo → cueva       |
| 0.75 – 0.90     | Coreminers                    |
| 0.90 – 1.00     | Forja + transición a 3D       |

---

## 5. Librerías y Herramientas

### 5.1 Core

* **GSAP** — motor principal de animación
* **GSAP ScrollTrigger** — vinculación scroll ↔ timeline

Motivo:

* Control preciso
* `scrub` continuo
* Performance probada

---

### 5.2 Render 2D

* HTML + CSS (layers absolutas)
* `transform: scale()` y `opacity`
* `will-change: transform`

Opcional:

* Canvas 2D para overlays (niebla, partículas)

---

### 5.3 Render 3D (escena final)

* **Three.js**
* Canvas montado desde el inicio
* Opacity 0 → 1 durante apertura de forja

Esto evita cortes visuales entre 2D y 3D.

---

## 6. Estructura de Código Sugerida

```
/src
  /assets
    /scenes
      01-coliseum-battle.png
      02-coliseum-rest.png
      03-nature-transition.png
      ...
  /components
    SceneLayer.js
    ScrollController.js
    Forge3D.js
  /styles
    layers.css
    effects.css
  main.js
```

---

## 7. Estrategia de Assets con IA

### Principios

* Nunca pedir “continuación”
* Siempre recrear **la misma cámara**
* Estilo Axie Infinity (stylized, no realista)

### Resolución

* 4K mínimo
* Centro visual como prioridad

---

## 8. Riesgos Técnicos y Mitigaciones

### 8.1 Peso de imágenes

**Riesgo:** Assets grandes afectan carga inicial.

**Mitigación:**

* Lazy load por escenas
* `preload` solo 2 escenas adelante
* Compresión WebP / AVIF

---

### 8.2 Performance en móviles

**Riesgo:** Escalado agresivo causa jank.

**Mitigación:**

* Limitar `scale` máximo por dispositivo
* Desactivar efectos secundarios en mobile
* `prefers-reduced-motion`

---

### 8.3 Scroll inconsistente

**Riesgo:** Diferencias entre navegadores.

**Mitigación:**

* GSAP ScrollTrigger con `normalizeScroll`
* Bloquear scroll nativo si es necesario

---

### 8.4 Arte inconsistente (IA)

**Riesgo:** Assets no encajan visualmente.

**Mitigación:**

* Prompt base fijo
* Overlay de grano/luz común
* Ajustes de color por CSS

---

## 9. Por qué esta estrategia es grant-level

* No depende de gimmicks
* Demuestra criterio técnico
* Conecta UX, narrativa y tecnología
* Escalable a producto real
* Compatible con Web3 storytelling

No es solo una landing: es una **visualización del ciclo económico de Axie Infinity**.

---

## 10. Evolución Futura

* Reemplazar escenas 2D por 3D progresivamente
* Integrar estados on-chain
* Activar interacciones contextuales
* Usar shaders para transiciones

---

**Conclusión:**
Esta arquitectura permite construir una experiencia inmersiva, performante y coherente con Axie Infinity, maximizando impacto visual sin comprometer mantenibilidad ni control técnico.
