# 🥚 Geode NFT Assets

## 📁 Estructura de Archivos

```
geodes/
├── petit/
│   └── GEODA PETIT AQUA.mp4 (✅ Implementado)
├── alto/
│   └── (por agregar)
├── animal/
│   └── (por agregar)
├── ultramech/
│   └── (por agregar)
└── tanque/
    └── (por agregar)
```

## 🎬 Especificaciones de Video

### Formato Recomendado:
- **Formato:** MP4 (H.264)
- **Resolución:** 512x512px (1:1 ratio)
- **Duración:** 2-5 segundos (loop perfecto)
- **FPS:** 30fps
- **Bitrate:** 1-2 Mbps
- **Tamaño:** <500KB por archivo
- **Audio:** Opcional (se reproduce muted)

### Nombres de Archivo:
```
GEODA [TIPO] [ELEMENTO].mp4

Ejemplos:
- GEODA PETIT AQUA.mp4
- GEODA PETIT FIRE.mp4
- GEODA ALTO NATURE.mp4
- GEODA ANIMAL ELECTRIC.mp4
```

## 🎨 Guía de Elementos por Tipo

### Petit (Tipo 0):
- Aqua ✅
- Fire
- Nature
- Electric

### Alto (Tipo 1):
- Storm
- Ice
- Shadow

### Animal (Tipo 2):
- Beast
- Dragon
- Phoenix

### Ultramech (Tipo 3):
- Cyber
- Plasma
- Quantum

### Tanque (Tipo 4):
- Titan
- Colossus
- Juggernaut

## 🔧 Herramientas de Optimización

### FFmpeg - Optimizar MP4:
```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset slow \
  -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2" \
  -c:a aac -b:a 128k -movflags +faststart output.mp4
```

### Crear GIF (alternativa):
```bash
ffmpeg -i input.mp4 -vf "scale=512:512:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  -loop 0 output.gif
```

### Crear Thumbnail:
```bash
ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 -vf scale=256:256 thumbnail.webp
```

## 📊 Comparación: MP4 vs GIF

| Aspecto | MP4 | GIF |
|---------|-----|-----|
| Tamaño (512x512, 3s) | ~500KB | ~2-5MB |
| Calidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Compatibilidad | ✅ 100% | ✅ 100% |
| Hardware Accel | ✅ | ❌ |
| Transparencia | ❌ | ✅ |
| **Recomendado** | ✅ **SÍ** | ❌ No |

## 🚀 Estado de Implementación

- [x] Sistema de GeodeVideo component
- [x] Petit Aqua implementado
- [ ] Resto de Petit (Fire, Nature, Electric)
- [ ] Alto (3 variantes)
- [ ] Animal (3 variantes)
- [ ] Ultramech (3 variantes)
- [ ] Tanque (3 variantes)

**Total:** 1/15 geodas implementadas (6.7%)
