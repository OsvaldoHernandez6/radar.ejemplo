# Radar · cuando quieras (demo)

Versión demostrativa del Radar: dashboard navegable con **marcas, cifras y textos ficticios**. No contiene datos de clientes. Sirve para mostrar la herramienta a prospectos. Diseño según el manual de marca de cuando quieras: tinta, papel y señal verde; Space Grotesk, Inter y JetBrains Mono; líneas de 2 px y esquinas rectas.

## Publicar
1. Sube el *contenido* de esta carpeta a un repo de GitHub.
2. Conéctalo a Vercel (o activa GitHub Pages). No requiere build: es estático.
3. En local: `python3 -m http.server` y abre http://localhost:8000

## Módulos
RES resumen · CAT panorama · IG Instagram · FB Facebook · ADS Meta Ads · OPP oportunidades · DX diagnóstico · SRC fuentes.
Atajos: ⌘K/Ctrl K buscar, J/K módulo, 1–5 lente de marca, +/− texto. Abre siempre en tema claro.

## Editar
- Datos y textos: `src/build_data.py` (marcas, cifras, hallazgos, oportunidades, diagnóstico). Los textos de cabecera y leyendas de gráficos están en `meta`.
- Diseño: `src/head.html` (CSS + estructura) y `src/script.js` (render y gráficos).
- Regenerar: `python3 src/build.py` (crea `index.html` y `data.json`).
- Para quitar el aviso de demo en un Radar real: `meta.demo = False`.

## Logos
Los logos de la demo son wordmarks SVG genéricos embebidos en `data.json` (campo `logo`). En un Radar real puede ser la ruta a un archivo (`logo-marca.svg`).
