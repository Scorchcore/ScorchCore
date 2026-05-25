# 📦 Supabase Storage Setup para NFT Assets

## 🎯 ¿Cuándo migrar a Supabase?

### Usar Local (Actual - Testnet):
- ✅ Desarrollo y pruebas
- ✅ Testnet con pocos usuarios
- ✅ Assets pequeños (<50 archivos)
- ✅ Equipo trabajando localmente

### Migrar a Supabase (Producción - Mainnet):
- ✅ Launch en mainnet
- ✅ >100 usuarios activos
- ✅ Múltiples regiones geográficas
- ✅ Necesitas CDN global
- ✅ Versionado de assets

---

## 🚀 Setup de Supabase Storage

### 1. Crear Bucket en Supabase

```sql
-- En Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('nft-assets', 'nft-assets', true);
```

### 2. Configurar Políticas de Acceso

```sql
-- Permitir lectura pública de assets
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'nft-assets');

-- Solo admins pueden subir (opcional)
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'nft-assets' 
  AND auth.role() = 'authenticated'
);
```

### 3. Estructura de Folders

```
nft-assets/
├── geodes/
│   ├── petit/
│   │   ├── aqua.mp4
│   │   ├── fire.mp4
│   │   └── nature.mp4
│   ├── alto/
│   ├── animal/
│   ├── ultramech/
│   └── tanque/
├── miners/
│   ├── tier1/
│   ├── tier2/
│   └── tier3/
└── axies/
    └── icons/
```

### 4. Subir Assets

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Subir archivos
supabase storage cp \
  ./public/images/geodes/petit/ \
  supabase://nft-assets/geodes/petit/ \
  --recursive
```

### 5. Actualizar Configuración Frontend

```typescript
// lib/config/storage.ts
const STORAGE_CONFIG = {
  // Para desarrollo
  development: {
    baseUrl: '/images',
    type: 'local'
  },
  
  // Para producción
  production: {
    baseUrl: 'https://your-project.supabase.co/storage/v1/object/public/nft-assets',
    type: 'supabase'
  }
};

export const getAssetUrl = (path: string) => {
  const config = STORAGE_CONFIG[process.env.NODE_ENV as 'development' | 'production'];
  return `${config.baseUrl}/${path}`;
};
```

### 6. Actualizar geodeAssets.ts

```typescript
import { getAssetUrl } from '@/lib/config/storage';

export const GEODE_ASSETS = {
  0: {
    name: 'Petit Aqua',
    video: getAssetUrl('geodes/petit/aqua.mp4'),
    thumbnail: getAssetUrl('geodes/petit/aqua-thumb.webp'),
    // ...
  },
  // ...
};
```

---

## 💰 Costos Estimados

### Supabase Free Tier:
- ✅ 1GB storage
- ✅ 2GB bandwidth/mes
- ✅ 50MB max file size
- ✅ Suficiente para ~100-200 NFTs con videos

### Supabase Pro ($25/mes):
- ✅ 100GB storage
- ✅ 200GB bandwidth/mes
- ✅ 5GB max file size
- ✅ Suficiente para 10,000+ NFTs

---

## 🎬 Optimización de Videos

### Antes de subir, optimiza los videos:

```bash
# Instalar ffmpeg
# Windows: choco install ffmpeg
# Mac: brew install ffmpeg

# Optimizar MP4
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset slow \
  -c:a aac -b:a 128k -movflags +faststart output.mp4

# Crear thumbnail WebP
ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 \
  -q:v 2 thumbnail.webp
```

### Tamaños recomendados:
- **Geodes:** 512x512px, ~500KB, 2-5 segundos
- **Miners:** 512x512px, ~800KB, 3-8 segundos
- **Thumbnails:** 256x256px, ~50KB, WebP

---

## 🔄 Script de Migración

```typescript
// scripts/migrate-to-supabase.ts
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function uploadAssets() {
  const assetsDir = './public/images/geodes';
  
  for (const file of fs.readdirSync(assetsDir, { recursive: true })) {
    const filePath = path.join(assetsDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    
    const { data, error } = await supabase.storage
      .from('nft-assets')
      .upload(`geodes/${file}`, fileBuffer, {
        contentType: 'video/mp4',
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) {
      console.error(`Error uploading ${file}:`, error);
    } else {
      console.log(`✅ Uploaded: ${file}`);
    }
  }
}

uploadAssets();
```

---

## 📊 Comparación: Local vs Supabase

| Feature | Local | Supabase |
|---------|-------|----------|
| **Velocidad (mismo país)** | ⚡⚡⚡⚡⚡ | ⚡⚡⚡⚡ |
| **Velocidad (global)** | ⚡ | ⚡⚡⚡⚡⚡ |
| **Costo** | $0 | $0-25/mes |
| **Escalabilidad** | ⚠️ Limitada | ✅ Ilimitada |
| **CDN** | ❌ | ✅ |
| **Backup** | Manual | ✅ Automático |
| **Versionado** | ❌ | ✅ |

---

## ✅ Recomendación Final

**Para Testnet (AHORA):**
```
✅ Usar archivos locales en /public
✅ Rápido para desarrollo
✅ Sin configuración extra
```

**Para Mainnet (DESPUÉS):**
```
✅ Migrar a Supabase Storage
✅ Activar CDN global
✅ Optimizar videos antes de subir
✅ Implementar lazy loading
```

**Orden de implementación:**
1. ✅ **Ahora:** Local + MP4
2. 🔜 **Beta:** Supabase + Optimización
3. 🚀 **Launch:** CDN + Caching avanzado
