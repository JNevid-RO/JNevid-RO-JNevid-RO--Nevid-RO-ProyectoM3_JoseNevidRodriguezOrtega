# Proyecto SPA Chat Isaac Newton

SPA de chat con routing sin recarga, Gemini AI integrado mediante proxy serverless y diseño responsive para mobile, tablet y desktop.

## Características

- Routing funcional con History API: `/home`, `/chat`, `/about`
- Chat con estado de `loading`, manejo de errores y scroll automático
- Historial de sesión guardado en `sessionStorage`
- Integración segura con Gemini AI mediante función serverless en `api/functions.js`
- API key protegida con variable de entorno `GEMINI_API_KEY`
- Diseño mobile-first con Flexbox/Grid y media queries
- Pruebas unitarias con `vitest` y mocking de llamadas externas

## Estructura

- `src/` - frontend del SPA
- `api/functions.js` - proxy seguro hacia Gemini AI
- `tests/` - tests unitarios
- `.env.example` - plantilla de variables de entorno
- `vercel.json` - configuración para despliegue SPA y API

## Configuración local

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Copia el archivo de entorno:
   ```bash
   cp .env.example .env
   ```
3. Agrega tu clave de Gemini en `.env`:
   ```text
   GEMINI_API_KEY=tu_clave_aqui
   ```
4. Ejecuta tests:
   ```bash
   npm test
   ```

## Despliegue en Vercel

1. Inicia sesión en Vercel.
2. Crea un nuevo proyecto apuntando a este repositorio.
3. Configura la variable de entorno `GEMINI_API_KEY` en Vercel.
4. Despliega.

## Uso

- Visita `/home` para la página principal.
- Visita `/chat` para conversar con Isaac Newton.
- Visita `/about` para ver detalles del proyecto.

## Notas

- La clave no se expone en el frontend.
- La función serverless recibe la conversación y reenvía el payload a Gemini.

