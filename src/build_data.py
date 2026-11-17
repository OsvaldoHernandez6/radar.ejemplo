"""Radar DEMO: datos 100% ficticios para mostrar la herramienta sin informacion de clientes."""
import json, statistics, random, pathlib
random.seed(7)
ROOT = pathlib.Path(__file__).resolve().parent.parent

def logo(name, color, shape):
    shapes = {
        'ring': f'<circle cx="20" cy="20" r="11" fill="none" stroke="{color}" stroke-width="6"/>',
        'square': f'<rect x="9" y="9" width="22" height="22" rx="6" fill="{color}"/>',
        'tri': f'<path d="M20 7 L33 31 H7 Z" fill="{color}"/>',
        'drop': f'<path d="M20 6 C28 16 31 21 31 25 a11 11 0 0 1-22 0 c0-4 3-9 11-19z" fill="{color}"/>',
        'bars': f'<rect x="8" y="18" width="6" height="14" rx="2" fill="{color}"/><rect x="17" y="12" width="6" height="20" rx="2" fill="{color}"/><rect x="26" y="7" width="6" height="25" rx="2" fill="{color}"/>',
    }
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40">{shapes[shape]}'
           f'<text x="42" y="27" font-family="Helvetica,Arial,sans-serif" font-size="19" font-weight="700" fill="#0B0B0C" letter-spacing="-.6">{name}</text></svg>')
    return 'data:image/svg+xml;utf8,' + svg.replace('#', '%23').replace('"', "'")

TOPICS = {
 'tumarca': ['Latte de temporada','Detrás de la barra','Promo martes 2x1','Nuevo croissant','Tip de barista: molienda','Cold brew de verano','Playlist del local','Brunch de domingo','Origen del grano','Encuesta: ¿qué sabor?','Equipo del mes','Horario de feriado'],
 'alfa': ['Lanzamiento bebida de temporada','App: suma puntos','Nuevo local','Sorteo kit de filtrado','Receta en casa','Combo desayuno','Origen del grano','Detrás de la barra','Promo app','Menú de otoño','Taza edición limitada','Barista invitado'],
 'beta': ['Video viral: arte latte','Reto del barista','Pastelería nueva','Promo estudiantes','Café + trabajo remoto','Detrás de la barra','Encuesta de sabores','Tostado en vivo','Cata abierta','Nuevo horario','Menú vegano','Playlist'],
 'gamma': ['Menú del día','Foto de local','Promo almuerzo','Postre de la semana','Horario','Foto de local','Sándwich nuevo','Promo almuerzo','Foto de local','Torta de cumpleaños','Saludo de fiesta','Menú del día'],
 'delta': ['Origen: finca y productor','Tostado de la semana','Método V60 paso a paso','Cata guiada','Suscripción mensual','Taller de latte art','Cold brew','Origen: finca y productor','Molienda correcta','Bolsa edición limitada','Comunidad: tu taza','Agua y extracción'],
}
CFG = {
 # id: name, color, followers, ppw, reel share, collab idx, median target, spread, viral idx
 'tumarca': ('Tu Marca', '#00E07A', 48200, 5.4, .72, [7], 185, .35, None, 'ring'),
 'alfa':    ('Marca Alfa', '#0B0B0C', 142000, 2.6, .45, [1,4,8,10,11], 640, .30, None, 'square'),
 'beta':    ('Marca Beta', '#4C4C4A', 86500, 3.1, .60, [5,9], 420, .30, 0, 'tri'),
 'gamma':   ('Marca Gamma', '#8C8C88', 61300, 1.6, .20, [], 170, .30, None, 'bars'),
 'delta':   ('Marca Delta', '#C2C2BC', 37800, 4.1, .75, [4,10,11], 430, .25, None, 'drop'),
}
BOOST = {('tumarca','Detrás de la barra'):2.1,('tumarca','Tip de barista: molienda'):1.9,('tumarca','Origen del grano'):2.0,('tumarca','Promo martes 2x1'):.6,('tumarca','Encuesta: ¿qué sabor?'):.9}
dates = ['14 nov','13 nov','11 nov','10 nov','8 nov','6 nov','5 nov','3 nov','1 nov','30 oct','29 oct','27 oct']

brands = []
for bid,(name,color,fol,ppw,reel,col,med,spr,viral,shape) in CFG.items():
    grid = []
    for i,t in enumerate(TOPICS[bid]):
        own = i not in col
        v = med*random.uniform(1-spr,1+spr)*(1 if own else 2.4)
        if viral is not None and i == viral: v = med*11
        v *= BOOST.get((bid, t), 1)
        comments = max(0, int(v*random.uniform(.03,.07)))
        typ = 'Reel' if random.random() < reel else 'Post'
        if viral is not None and i == viral: typ = 'Reel'
        grid.append({'code': '', 'type': typ, 'date': dates[i], 'likes': int(v)-comments, 'comments': comments, 'own': own,
                     'topic': t if own else 'Collab ' + ('con creador/a gastronómico/a' if i % 2 else 'con marca aliada')})
    owni = [p['likes']+p['comments'] for p in grid if p['own']]
    ownp = [p for p in grid if p['own']]
    brands.append({'id': bid, 'name': name, 'handle': '@' + name.lower().replace(' ', '') + '.demo', 'url': '', 'color': color,
        'logo': logo(name, '#00C46B' if bid=='tumarca' else '#0B0B0C', shape), 'followers': fol, 'posts': random.randint(420, 1400), 'following': random.randint(60, 900),
        'postsPerWeek': ppw, 'avgInteractions': round(statistics.mean(owni), 1), 'medianInteractions': round(statistics.median(owni), 1),
        'er': round(statistics.mean(owni)/fol*100, 3), 'erMedian': round(statistics.median(owni)/fol*100, 3),
        'reelsPct': round(sum(p['type']=='Reel' for p in ownp)/len(ownp)*100), 'collabs': len(col), 'collabPct': round(len(col)/12*100),
        'grid': grid, 'isClient': bid == 'tumarca'})
B = {b['id']: b for b in brands}

extra = {
 'tumarca': dict(fb=(12400,'Replica Instagram con 1 día de desfase. Responde mensajes en menos de 2 h.'),
   ads=dict(active=True,count=14,since='12 oct 2026',themes=['Promo martes 2x1','Nuevo croissant','Delivery por app','Bebida de temporada'],ctas=['Pedir ahora','Más información','Cómo llegar'],formats='Video 9:16 (0:12–0:20) + estático; 3 versiones en testeo',
     summary='Pauta táctica y constante, centrada en promociones de precio. Buen volumen para su tamaño, pero casi sin piezas de marca.',
     alert='Dos anuncios activos dirigen a un local que cambió de horario: el copy promete apertura 7:30 y la ficha dice 8:30.'),
   footprint='9 locales en RM y V Región',pos=dict(tone='Cercano, cotidiano, mucho emoji',focus='Promos y producto nuevo',cta='Pedir por app',community='Oficinistas y estudiantes')),
 'alfa': dict(fb=(38000,'Contenido propio y nativo; concursos con alta respuesta.'),
   ads=dict(active=True,count=22,since='2 sep 2026',themes=['App de fidelización','Bebida de temporada','Locales nuevos','Marca emocional'],ctas=['Descargar','Comprar','Cómo llegar','Más información'],formats='Video, carrusel y catálogo; segmentación por comuna',
     summary='El anunciante más completo: embudo de marca a app, piezas geolocalizadas por apertura y una línea emocional sostenida.',alert=''),
   footprint='31 locales a nivel nacional',pos=dict(tone='Aspiracional, pulido',focus='Lanzamientos y app',cta='Descarga la app',community='Público masivo urbano')),
 'beta': dict(fb=(21000,'Comparte los videos de Instagram; 1 de cada 4 se viraliza también aquí.'),
   ads=dict(active=True,count=6,since='20 oct 2026',themes=['Promo estudiantes','Pastelería nueva','Café + trabajo remoto'],ctas=['Más información','Enviar mensaje'],formats='Reels promocionados (0:15)',
     summary='Pauta corta que amplifica sus contenidos orgánicos con mejor desempeño. Poca variedad de mensajes, pero alineada con su voz.',alert=''),
   footprint='14 locales en RM',pos=dict(tone='Divertido, nativo de video',focus='Entretenimiento y retos',cta='Ven a probarlo',community='Jóvenes 18–30')),
 'gamma': dict(fb=(30500,'Su canal más activo: menú diario, público mayor, alta interacción en comentarios.'),
   ads=dict(active=False,count=0,since='',themes=[],ctas=[],formats='',summary='Sin anuncios activos en el periodo revisado. Depende del tráfico de sus locales y de Facebook.',alert=''),
   footprint='6 locales en centros de oficina',pos=dict(tone='Informativo, funcional',focus='Menú del día y almuerzo',cta='Te esperamos',community='Trabajadores del sector')),
 'delta': dict(fb=(4200,'Presencia mínima; publica una vez al mes.'),
   ads=dict(active=True,count=3,since='28 oct 2026',themes=['Suscripción mensual','Origen del café'],ctas=['Suscribirse','Comprar'],formats='Carrusel educativo + video corto',
     summary='Poca pauta, muy enfocada en suscripción. Mensaje experto y diferenciado: la única marca que vende origen y método.',alert=''),
   footprint='2 tostadurías + tienda online',pos=dict(tone='Experto, didáctico',focus='Origen, método y cata',cta='Suscríbete',community='Entusiastas del café de especialidad')),
}
for bid, e in extra.items():
    b = B[bid]
    b['fb'] = {'followers': e['fb'][0], 'url': '', 'note': e['fb'][1]}
    b['ads'] = dict(e['ads'], library='')
    b['footprint'] = e['footprint']; b['footprintConf'] = 'estimado'; b['pos'] = e['pos']

tm = B['tumarca']
comp = [b for b in brands if not b['isClient']]
k = lambda n: (f"{n/1000:.1f}".replace('.', ',').replace(',0', '') + 'K') if n < 100000 else f"{round(n/1000)}K"
pc = lambda v: f"{v:.2f}".replace('.', ',') + '%'

data = {
 'meta': {
  'title': 'Radar Competitivo · Demo', 'client': 'Tu Marca', 'demo': True,
  'category': 'cafeterías de especialidad', 'market': 'Chile', 'extractionDate': 'noviembre de 2026',
  'railTag': 'DEMO · DATOS FICTICIOS',
  'thesis': 'Tu Marca es la que más publica, pero de las que menos convierte esa constancia en comunidad',
  'sub': 'Benchmark de Instagram, Facebook y Meta Ads de 5 marcas, con un diagnóstico puntuado y las oportunidades que nadie en la categoría está tomando.',
  'demoNote': 'Versión demostrativa. Marcas, cifras y textos son ficticios y no corresponden a ninguna empresa real. Las etiquetas “verificado” y “estimado” muestran cómo se marca cada dato en un Radar real.',
  'panoramaDesc': 'Cinco marcas de cafeterías de especialidad, comparadas en las mismas métricas.',
  'facebookDesc': 'Comunidad, rol del canal y diferencias de uso entre marcas.',
  'scatterCap': 'Dónde está cada marca: eje horizontal, tamaño de comunidad; eje vertical, cuánto responde esa comunidad. Tu Marca está abajo a la izquierda: comunidad chica que responde poco para lo que publica.',
  'dotsCap': 'Cada punto es una de las últimas 12 publicaciones. Se ve el video viral de Marca Beta, el salto de las colaboraciones de Marca Alfa y la regularidad de Marca Delta.',
  'waffleCap': 'Las últimas 12 publicaciones por tipo. Tu Marca tiene una sola colaboración y Marca Alfa entrega casi la mitad de su grilla a creadores.',
  'pricesCap': 'Ofertas equivalentes en anuncios activos. En café de bolsa, Tu Marca es la más cara del segmento.',
  'heatCap': 'Qué temas pauta cada marca. Promo de precio y producto nuevo están saturados; origen del café y suscripción casi no tienen dueño.',
  'divergeCap': 'Diferencia porcentual contra el promedio de las cuatro competidoras. Tu Marca gana en esfuerzo (frecuencia, Reels) y pierde en alcance (seguidores, Facebook y colaboraciones).',
  'dxDesc': 'Puntaje sobre 100 frente a las 4 competidoras, con una rúbrica de 8 dimensiones ponderadas.',
  'searchHint': '“promo”, “Alfa” o “creadores”',
  'kpi3': 'bajo la mediana',
  'method': 'En un Radar real, los datos de Instagram, Facebook y la Biblioteca de anuncios de Meta se leen directamente en cada plataforma en la fecha de corte. Interacciones = likes + comentarios de las últimas 12 publicaciones visibles (posts propios, sin fijados). Engagement = interacciones ÷ seguidores. En esta demo todas las cifras son ficticias.',
 },
 'brands': brands,
 'instagram': {
  'conclusions': [
   {'title': 'Tu Marca es la que más publica y la que menos crece', 'text': f"Publica {str(tm['postsPerWeek']).replace('.',',')} posts propios por semana, el doble que Marca Alfa, pero tiene un tercio de sus seguidores. La frecuencia no está comprando alcance."},
   {'title': 'Las colaboraciones multiplican la respuesta', 'text': 'En Marca Alfa, las piezas con creadores rinden más del doble que sus posts propios. Tu Marca tiene una sola colaboración en sus últimas 12 publicaciones.'},
   {'title': 'Un viral no es una estrategia', 'text': 'Marca Beta tiene el mejor promedio por un solo video. Su mediana está cerca de la de Tu Marca: sin ese post, la diferencia desaparece.'},
   {'title': 'Marca Delta: comunidad chica, la más fiel', 'text': 'Con el menor número de seguidores, tiene el engagement mediano más alto. Su contenido educativo (origen, método) genera guardados y comentarios.'},
   {'title': 'Promo cansa', 'text': 'Los posts de precio de Tu Marca están en el piso de su grilla. Los de proceso y barra duplican su respuesta.'},
  ],
  'recommendations': [
   {'title': 'Programa de creadores gastronómicos', 'text': 'Activar 3–4 micro-creadores por trimestre en las comunas de sus locales. Es la palanca de alcance más barata que la competencia ya probó.', 'priority': 'alta'},
   {'title': 'Menos promo, más proceso', 'text': 'Bajar las piezas de precio al 30% de la grilla y subir “detrás de la barra” y origen, que hoy rinden el doble.', 'priority': 'alta'},
   {'title': 'Formato serie', 'text': 'Convertir el tip de barista en una serie semanal fija para generar hábito y guardados.', 'priority': 'media'},
   {'title': 'Medir guardados y compartidos', 'text': 'Mover el KPI de likes a guardados y compartidos, que predicen mejor el alcance orgánico.', 'priority': 'media'},
  ]},
 'facebook': {
  'conclusions': [
   {'title': 'Facebook sigue vivo para un público', 'text': 'Marca Gamma tiene en Facebook su canal más activo: menú diario y conversación con un público mayor que no está en Instagram.'},
   {'title': 'Tu Marca usa Facebook como espejo', 'text': 'Replica Instagram con un día de desfase. No hay contenido nativo ni uso de comunidad.'},
   {'title': 'Mensajería como servicio', 'text': 'Las marcas que responden rápido por Messenger concentran las reseñas positivas. Tu Marca ya lo hace bien: falta mostrarlo.'},
  ],
  'recommendations': [
   {'title': 'Facebook para lo que funciona', 'text': 'Usarlo para menú del día, reseñas y atención, no como copia de Instagram.', 'priority': 'media'},
   {'title': 'Pedir reseñas después de la visita', 'text': 'Activar recomendaciones de página y pedirlas por mensaje tras una compra en app.', 'priority': 'media'},
  ]},
 'metaAds': {
  'conclusions': [
   {'title': 'Promo de precio es el campo de batalla', 'text': '4 de las 5 marcas pautan descuentos o combos. Es el territorio más caro y el que menos diferencia.'},
   {'title': 'Marca Alfa domina con embudo completo', 'text': 'Es la única que pauta marca, producto, app y aperturas al mismo tiempo, con piezas por comuna.'},
   {'title': 'Origen y suscripción casi no tienen dueño', 'text': 'Solo Marca Delta los pauta, con un presupuesto pequeño. Es el hueco más claro de la categoría.'},
   {'title': 'Tu Marca tiene volumen, no variedad', 'text': '14 anuncios activos, pero 3 de 4 mensajes son de precio. Falta una línea de marca que sostenga el precio premium.'},
   {'title': 'Un copy desactualizado resta confianza', 'text': 'Dos anuncios prometen un horario que el local ya no cumple. Es un error de ejecución fácil de corregir.'},
  ],
  'recommendations': [
   {'title': 'Corregir hoy los anuncios con horario antiguo', 'text': 'Pausar o actualizar las dos piezas. Una promesa que no se cumple en el local daña la conversión.', 'priority': 'alta'},
   {'title': 'Abrir una línea de origen', 'text': 'Pautar el origen del grano y el tostado para justificar el precio del café de bolsa.', 'priority': 'alta'},
   {'title': 'Probar suscripción', 'text': 'Testear una oferta de suscripción mensual en pauta, hoy territorio de una sola marca chica.', 'priority': 'media'},
   {'title': 'Geolocalizar por local', 'text': 'Piezas por comuna con el local más cercano, como hace Marca Alfa.', 'priority': 'media'},
  ],
  'territories': {
   'labels': ['Promo precio','Producto nuevo','Delivery app','Suscripción','Origen café','Locales nuevos','Marca emocional','Fidelización'],
   'values': {'tumarca':[1,1,1,0,0,0,0,0.5],'alfa':[1,1,0,0,0,1,1,1],'beta':[1,1,0,0,0,0,0.5,0],'gamma':[0,0,0,0,0,0,0,0],'delta':[0,0,0,1,1,0,0,0]},
   'notes': {'tumarca': {'7': 'Solo menciona la app al pie'}, 'beta': {'6': 'Una pieza de comunidad'}, 'alfa': {'5': 'Piezas por comuna'}}},
  'prices': [
   {'offer': 'Latte 12 oz', 'values': {'tumarca': 3900, 'alfa': 4200, 'beta': 3500}},
   {'offer': 'Combo desayuno', 'values': {'tumarca': 6900, 'alfa': 7490, 'beta': 5990}},
   {'offer': 'Café de bolsa 250 g', 'values': {'tumarca': 12990, 'alfa': 10990, 'delta': 11990}},
  ]},
 'strategicOpportunities': {
  'title': 'Oportunidades estratégicas de la categoría',
  'subtitle': 'Caminos de comunicación que la categoría no está explotando',
  'industryStats': [
   {'value': '62%', 'label': 'de los compradores de café de especialidad dice que el origen influye en su elección', 'source': 'Dato ilustrativo · demo'},
   {'value': '3,4x', 'label': 'más guardados obtiene el contenido educativo frente al promocional en la categoría', 'source': 'Dato ilustrativo · demo'},
   {'value': '41%', 'label': 'de las visitas a cafeterías se deciden en el momento, a menos de 500 m del local', 'source': 'Dato ilustrativo · demo'},
   {'value': '1 de 4', 'label': 'clientes frecuentes probaría una suscripción mensual de café en grano', 'source': 'Dato ilustrativo · demo'},
   {'value': '18–30', 'label': 'es el tramo de edad con mayor respuesta a contenido de creadores gastronómicos', 'source': 'Dato ilustrativo · demo'},
  ],
  'opportunities': [
   {'icon':'☕','title':'Apropiarse del origen','description':'Todas venden precio y producto; solo una marca chica cuenta de dónde viene el café. Es el argumento que sostiene un precio premium.','hook':'“Del cerro a tu taza”: una serie mensual con el productor de cada grano.','platforms':['Instagram','Meta Ads']},
   {'icon':'🔁','title':'Suscripción como hábito','description':'Nadie con escala pauta suscripción. Convierte al cliente frecuente en ingreso recurrente.','hook':'Primer mes con taza de regalo para quien ya compra 3 veces por semana.','platforms':['Meta Ads','App']},
   {'icon':'🎥','title':'Creadores de barrio','description':'Las colaboraciones rinden el doble y la marca cliente casi no las usa.','hook':'Un creador por comuna recorre el local más cercano y arma su pedido ideal.','platforms':['Instagram']},
   {'icon':'📍','title':'Pauta a 500 metros','description':'La decisión se toma cerca del local. Solo una marca segmenta por comuna.','hook':'“Estás a 3 minutos de tu latte”: piezas por local con horario real.','platforms':['Meta Ads']},
   {'icon':'🎓','title':'Educar para fidelizar','description':'El contenido de método genera guardados y comunidad, como muestra la marca con mejor engagement.','hook':'Mini curso de 5 reels: molienda, agua, filtro, leche y cata.','platforms':['Instagram','Facebook']},
   {'icon':'💬','title':'Facebook para la conversación','description':'Hay un público mayor activo en Facebook que la mayoría ignora.','hook':'Menú del día con encuesta diaria y respuesta rápida por Messenger.','platforms':['Facebook']},
  ]},
 'diagnosticBrand': {
  'scoreRows': [
   {'dim':'Alcance Instagram','weight':20,'pts':7,'note':f"{k(tm['followers'])} vs 142K del líder (34%)"},
   {'dim':'Alcance Facebook','weight':10,'pts':3,'note':'12,4K vs 38K del líder (33%)'},
   {'dim':'Frecuencia Instagram','weight':15,'pts':15,'note':'5,4 posts/sem, la más alta de la categoría'},
   {'dim':'Engagement Instagram','weight':15,'pts':7,'note':f"{pc(tm['erMedian'])} mediano, bajo la mediana de la categoría"},
   {'dim':'Mix de formatos (Reels)','weight':10,'pts':8,'note':f"{tm['reelsPct']}% Reels"},
   {'dim':'Colaboraciones','weight':10,'pts':2,'note':'1 de 12 vs 5 de 12 del líder'},
   {'dim':'Calidad de pauta Meta','weight':15,'pts':9,'note':'Buen volumen, poca variedad y un copy vencido'},
   {'dim':'Contenido y tono','weight':5,'pts':3,'note':'Voz cercana; abusa de la promo'},
  ],
  'gaps': [
   {'dimension':'Alcance · Instagram','values':{b['id']:k(b['followers']) for b in brands},'gapText':'Tu Marca es la cuarta de cinco. Con 9 locales, su escala física supera a su escala digital.','severity':'alta'},
   {'dimension':'Engagement mediano','values':{b['id']:pc(b['erMedian']) for b in brands},'gapText':'Marca Delta muestra que una comunidad chica bien alimentada responde más. El problema de Tu Marca es el contenido, no la frecuencia.','severity':'alta'},
   {'dimension':'Colaboraciones','values':{b['id']:f"{b['collabs']}/12" for b in brands},'gapText':'La palanca de alcance que el líder ya usa y Tu Marca no.','severity':'alta'},
   {'dimension':'Anuncios activos','values':{b['id']:(f"~{b['ads']['count']}" if b['ads']['active'] else '0') for b in brands},'gapText':'Volumen competitivo, segundo de la categoría.','severity':'baja'},
   {'dimension':'Territorios de pauta','values':{bid:f"{sum(1 for x in v if x)}/8" for bid,v in {'tumarca':[1,1,1,0,0,0,0,0.5],'alfa':[1,1,0,0,0,1,1,1],'beta':[1,1,0,0,0,0,0.5,0],'gamma':[0]*8,'delta':[0,0,0,1,1,0,0,0]}.items()},'gapText':'Pauta concentrada en territorios saturados; ausente en origen y suscripción.','severity':'media'},
   {'dimension':'Seguidores Facebook','values':{b['id']:k(b['fb']['followers']) for b in brands},'gapText':'Canal secundario; mejora con contenido nativo, no con más frecuencia.','severity':'media'},
  ],
  'verdict': {
   'scoreValue': 54, 'scoreLabel': '54 / 100', 'label': 'Mucha constancia, poca tracción',
   'description': 'Tu Marca es la más disciplinada de la categoría: publica más que nadie y sostiene pauta todo el mes. Pero su contenido promocional no genera comunidad y casi no usa creadores, la palanca que el líder ya domina. El salto está en cambiar qué publica, no cuánto.',
   'strengths': ['Frecuencia más alta de la categoría','Mix de formatos con mayoría de Reels','Pauta constante con buen volumen','Atención rápida por mensajes','Red de 9 locales para activar a nivel barrio'],
   'weaknesses': ['Comunidad pequeña frente a su escala física','Engagement bajo la mediana','Una sola colaboración en 12 publicaciones','Pauta concentrada en precio','Copy de horario desactualizado en anuncios activos'],
   'priority': ['Corregir los anuncios con horario antiguo','Lanzar programa de creadores por comuna','Bajar la promo al 30% de la grilla','Abrir una línea de pauta de origen','Testear suscripción mensual'],
  }},
 'sources': [
  {'t':'Perfiles públicos de Instagram de cada marca (en un Radar real)','u':''},
  {'t':'Páginas públicas de Facebook de cada marca (en un Radar real)','u':''},
  {'t':'Biblioteca de anuncios de Meta','u':'https://www.facebook.com/ads/library/'},
  {'t':'Estudios de industria citados con enlace (en un Radar real)','u':''},
 ],
}
(ROOT/'data.json').write_text(json.dumps(data, ensure_ascii=False, indent=1))
print('ok', [(b['id'], b['followers'], b['erMedian'], b['er'], b['reelsPct'], b['medianInteractions']) for b in brands])
