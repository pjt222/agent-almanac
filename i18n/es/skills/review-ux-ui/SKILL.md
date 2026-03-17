---
name: review-ux-ui
description: >
  Revisar la experiencia de usuario y el diseño de interfaz usando las
  heurísticas de Nielsen, las directrices de accesibilidad WCAG 2.1, auditoría
  de teclado y lector de pantalla, análisis de flujos de usuario, evaluación de
  carga cognitiva y evaluación de usabilidad de formularios. Usar al realizar
  una revisión de usabilidad antes del lanzamiento, evaluar el cumplimiento de
  accesibilidad WCAG 2.1, valorar los flujos de usuario en cuanto a eficiencia,
  revisar el diseño de formularios, o realizar una evaluación heurística de una
  interfaz existente.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: multi
  tags: ux, ui, accessibility, wcag, heuristics, usability, user-flows, cognitive-load
---

# Revisar UX/UI

Evaluar la experiencia de usuario y el diseño de interfaz en cuanto a usabilidad, accesibilidad y efectividad.

## Cuándo Usar

- Realizar una revisión de usabilidad de una aplicación antes del lanzamiento
- Evaluar el cumplimiento de accesibilidad (WCAG 2.1 AA o AAA)
- Valorar los flujos de usuario en cuanto a eficiencia y prevención de errores
- Revisar el diseño de formularios para usabilidad y optimización de conversión
- Realizar una evaluación heurística de una interfaz existente
- Evaluar la carga cognitiva y la arquitectura de la información

## Entradas

- **Obligatorio**: Aplicación a revisar (URL, prototipo o código fuente)
- **Obligatorio**: Descripción del usuario objetivo (roles, nivel de habilidad técnica, contexto de uso)
- **Opcional**: Hallazgos de investigación de usuarios (entrevistas, encuestas, analítica)
- **Opcional**: Objetivo de conformidad con WCAG (A, AA o AAA)
- **Opcional**: Flujos de usuario o tareas específicas a evaluar
- **Opcional**: Tecnología de asistencia con la que probar (lector de pantalla, acceso por conmutador)

## Procedimiento

### Paso 1: Evaluación Heurística (10 Heurísticas de Nielsen)

Evaluar la interfaz frente a cada heurística:

| # | Heurística | Pregunta Clave | Valoración |
|---|-----------|---------------|-----------|
| 1 | **Visibilidad del estado del sistema** | ¿Informa siempre el sistema a los usuarios sobre lo que está pasando? | |
| 2 | **Coincidencia entre el sistema y el mundo real** | ¿Usa el sistema lenguaje y conceptos familiares? | |
| 3 | **Control y libertad del usuario** | ¿Pueden los usuarios deshacer, rehacer o salir fácilmente de estados no deseados? | |
| 4 | **Consistencia y estándares** | ¿Se comportan los elementos similares de la misma manera en toda la aplicación? | |
| 5 | **Prevención de errores** | ¿El diseño previene los errores antes de que ocurran? | |
| 6 | **Reconocimiento en lugar de recuerdo** | ¿Son las opciones, acciones e información visibles o fácilmente recuperables? | |
| 7 | **Flexibilidad y eficiencia de uso** | ¿Hay atajos para usuarios experimentados sin confundir a los novatos? | |
| 8 | **Diseño estético y minimalista** | ¿Tiene cada elemento un propósito? ¿Hay desorden innecesario? | |
| 9 | **Ayudar a los usuarios a reconocer, diagnosticar y recuperarse de errores** | ¿Los mensajes de error son claros, específicos y constructivos? | |
| 10 | **Ayuda y documentación** | ¿La ayuda está disponible y es fácil de encontrar cuando se necesita? | |

Para cada heurística, valorar la gravedad de las violaciones:

| Gravedad | Descripción |
|---------|-------------|
| 0 | No es un problema de usabilidad |
| 1 | Cosmético — corregir si hay tiempo |
| 2 | Menor — corrección de baja prioridad |
| 3 | Mayor — importante corregir, alta prioridad |
| 4 | Catastrófico — debe corregirse antes del lanzamiento |

```markdown
## Hallazgos de Evaluación Heurística
| # | Heurística | Gravedad | Hallazgo | Ubicación |
|---|-----------|---------|---------|---------|
| 1 | Estado del sistema | 3 | Sin indicador de carga durante la obtención de datos — los usuarios hacen clic repetidamente | Página de panel |
| 3 | Control del usuario | 2 | Sin deshacer para eliminar elementos — solo un diálogo de confirmación | Lista de elementos |
| 5 | Prevención de errores | 3 | El campo de fecha acepta fechas inválidas (30 de febrero) | Formulario de reserva |
| 9 | Recuperación de errores | 4 | El error de envío del formulario borra todos los campos | Registro |
```

**Esperado:** Las 10 heurísticas evaluadas con hallazgos específicos y valoraciones de gravedad.
**En caso de fallo:** Si el tiempo es limitado, enfóquese en las heurísticas 1, 3, 5 y 9 (las más impactantes para la experiencia del usuario).

### Paso 2: Auditoría de Accesibilidad (WCAG 2.1)

#### Perceptible
- [ ] **1.1.1 Contenido no textual**: Todas las imágenes tienen texto alternativo (las imágenes decorativas tienen `alt=""`)
- [ ] **1.3.1 Información y relaciones**: HTML semántico usado (encabezados, listas, tablas, landmarks)
- [ ] **1.3.2 Secuencia significativa**: El orden del DOM coincide con el orden visual
- [ ] **1.4.1 Uso del color**: El color no es el único medio de transmitir información
- [ ] **1.4.3 Contraste**: Ratio de contraste del texto ≥ 4.5:1 (normal), ≥ 3:1 (texto grande)
- [ ] **1.4.4 Cambio de tamaño del texto**: El texto puede redimensionarse al 200% sin pérdida de funcionalidad
- [ ] **1.4.11 Contraste no textual**: Los componentes de interfaz y gráficos tienen ≥ 3:1 de contraste
- [ ] **1.4.12 Espaciado del texto**: El contenido funciona con espaciado de texto incrementado (altura de línea 1.5x, espaciado de letras 0.12em, espaciado de palabras 0.16em)

#### Operable
- [ ] **2.1.1 Teclado**: Toda la funcionalidad es operable mediante teclado
- [ ] **2.1.2 Sin trampa de teclado**: El foco nunca queda atrapado en un componente
- [ ] **2.4.1 Omitir bloques**: Enlace de omisión de navegación disponible para usuarios de teclado
- [ ] **2.4.3 Orden de foco**: El orden de tabulación sigue una secuencia lógica y predecible
- [ ] **2.4.7 Foco visible**: El indicador de foco del teclado es claramente visible
- [ ] **2.4.11 Foco no obstruido**: El elemento enfocado no está oculto detrás de encabezados fijos/superposiciones
- [ ] **2.5.5 Tamaño del objetivo**: Los objetivos interactivos son de al menos 24x24px (44x44px recomendado en táctil)

#### Comprensible
- [ ] **3.1.1 Idioma de la página**: Atributo `lang` establecido en `<html>`
- [ ] **3.2.1 Al enfocar**: El foco no desencadena cambios inesperados
- [ ] **3.2.2 Al introducir**: La entrada no desencadena cambios inesperados sin advertencia
- [ ] **3.3.1 Identificación de errores**: Los errores están claramente descritos en texto
- [ ] **3.3.2 Etiquetas o instrucciones**: Los campos de formulario tienen etiquetas visibles
- [ ] **3.3.3 Sugerencia de error**: Los mensajes de error sugieren cómo solucionar el problema

#### Robusto
- [ ] **4.1.1 Análisis sintáctico**: El HTML es válido (sin IDs duplicados, anidamiento correcto)
- [ ] **4.1.2 Nombre, rol, valor**: Los componentes personalizados tienen roles y propiedades ARIA
- [ ] **4.1.3 Mensajes de estado**: Los cambios de contenido dinámico se anuncian a los lectores de pantalla

**Esperado:** Los criterios WCAG 2.1 AA verificados sistemáticamente con pasa/falla por criterio.
**En caso de fallo:** Use herramientas automatizadas (axe-core, Lighthouse) para el escaneo inicial, luego pruebas manuales para los criterios que requieren juicio humano.

### Paso 3: Auditoría de Teclado y Lector de Pantalla

#### Prueba de Navegación con Teclado
Usando solo Tab, Shift+Tab, Enter, Espacio, teclas de flecha y Escape:

```markdown
## Auditoría de Navegación con Teclado
| Tarea | ¿Completable? | Problemas |
|------|-------------|---------|
| Navegar al contenido principal | Sí — el enlace de omisión funciona | Ninguno |
| Abrir menú desplegable | Sí | Las teclas de flecha no funcionan dentro del menú |
| Enviar un formulario | Sí | El orden de tabulación omite el botón de envío |
| Cerrar un modal | No | Escape no cierra, sin botón de cierre visible en el orden de tabulación |
| Usar selector de fecha | No | El selector de fecha personalizado no es accesible por teclado |
```

#### Prueba de Lector de Pantalla
Probar con NVDA (Windows), VoiceOver (macOS/iOS), o TalkBack (Android):

```markdown
## Auditoría de Lector de Pantalla
| Elemento | Anunciado Como | Esperado | Problema |
|---------|--------------|---------|---------|
| Enlace del logotipo | "enlace, imagen" | "Inicio, enlace" | Falta texto alternativo en el logotipo |
| Campo de búsqueda | "editar, buscar" | "Buscar productos, editar" | Falta asociación de etiqueta |
| Menú de navegación | "navegación, principal" | Correcto | Ninguno |
| Mensaje de error | (no anunciado) | "Error: el email es obligatorio" | Falta región activa |
| Indicador de carga | (no anunciado) | "Cargando, por favor espere" | Falta aria-live o role="status" |
```

**Esperado:** Flujos de tareas completos probados solo con teclado y lector de pantalla.
**En caso de fallo:** Si no hay un lector de pantalla disponible, inspeccione los atributos ARIA y el HTML semántico como proxy.

### Paso 4: Analizar los Flujos de Usuario

Mapear y evaluar los flujos de usuario clave:

```markdown
## Flujo de Usuario: Completar una Compra

### Pasos
1. Explorar productos → 2. Ver producto → 3. Añadir al carrito → 4. Ver carrito →
5. Introducir envío → 6. Introducir pago → 7. Revisar pedido → 8. Confirmar

### Evaluación
| Paso | Fricción | Gravedad | Notas |
|------|---------|---------|-------|
| 1→2 | Baja | - | Tarjetas de producto claras |
| 2→3 | Media | 2 | El botón "Añadir al carrito" está debajo del pliegue en móvil |
| 3→4 | Baja | - | El icono del carrito se actualiza con el recuento |
| 4→5 | Alta | 3 | Debe crear una cuenta — sin pago como invitado |
| 5→6 | Baja | - | El autocompletado de dirección funciona bien |
| 6→7 | Media | 2 | El campo de número de tarjeta no se formatea automáticamente |
| 7→8 | Baja | - | Resumen del pedido claro |

### Eficiencia del Flujo
- **Pasos**: 8 (aceptable para comercio electrónico)
- **Campos obligatorios**: 14 (podría reducirse con autocompletado de dirección + pago guardado)
- **Puntos de decisión**: 2 (selección de talla, método de envío)
- **Posibles puntos de abandono**: Paso 4→5 (creación de cuenta forzada)
```

**Esperado:** Flujos de usuario críticos mapeados con puntos de fricción identificados y valorados.
**En caso de fallo:** Si no hay analítica de usuarios disponible, evalúe los flujos basándose en la complejidad de la tarea y el número de pasos.

### Paso 5: Evaluar la Carga Cognitiva

- [ ] **Densidad de información**: ¿Es apropiada la cantidad de información por pantalla?
- [ ] **Divulgación progresiva**: ¿Se revela la información compleja gradualmente?
- [ ] **Agrupación**: ¿Los elementos relacionados están agrupados visualmente (principios de la Gestalt)?
- [ ] **Reconocimiento en lugar de recuerdo**: ¿Pueden los usuarios ver las opciones en lugar de recordarlas?
- [ ] **Patrones consistentes**: ¿Las tareas similares usan patrones de interacción similares?
- [ ] **Fatiga de decisión**: ¿Se presentan demasiadas opciones a la vez? (Ley de Hick)
- [ ] **Memoria de trabajo**: ¿Necesitan los usuarios recordar información entre pasos?

**Esperado:** Carga cognitiva evaluada con áreas específicas de sobrecarga o subcarga identificadas.
**En caso de fallo:** Si la carga cognitiva es difícil de evaluar objetivamente, use la "prueba del entrecerrado de ojos" — entrecierre los ojos mirando la pantalla y vea si la estructura y la jerarquía siguen siendo aparentes.

### Paso 6: Revisar la Usabilidad de los Formularios

Para cada formulario en la aplicación:

- [ ] **Etiquetas**: Cada campo tiene una etiqueta visible y asociada
- [ ] **Texto de marcador de posición**: Usado solo como ejemplos, no como etiquetas
- [ ] **Tipos de entrada**: Tipos de entrada HTML correctos (email, tel, number, date) para teclados móviles
- [ ] **Temporización de validación**: Los errores se muestran al perder el foco o al enviar (no en cada pulsación)
- [ ] **Mensajes de error**: Específicos ("El email debe incluir @") no genéricos ("Entrada inválida")
- [ ] **Campos obligatorios**: Claramente marcados (y los campos opcionales marcados si la mayoría son obligatorios)
- [ ] **Agrupación de campos**: Los campos relacionados están agrupados visualmente (nombre, dirección, secciones de pago)
- [ ] **Autocompletado**: Atributos `autocomplete` establecidos para campos estándar (name, email, address, cc-number)
- [ ] **Orden de tabulación**: Flujo lógico que coincide con el diseño visual
- [ ] **Formularios de múltiples pasos**: El indicador de progreso muestra el paso actual y el total de pasos
- [ ] **Persistencia**: Los datos del formulario se conservan si el usuario navega fuera y regresa

**Esperado:** Cada formulario evaluado frente a la lista de verificación con problemas específicos documentados.
**En caso de fallo:** Si hay muchos formularios, priorice los de mayor tráfico (registro, pago, contacto).

### Paso 7: Redactar la Revisión UX/UI

```markdown
## Informe de Revisión UX/UI

### Resumen Ejecutivo
[2-3 oraciones: usabilidad general, problemas más críticos, aspectos más fuertes]

### Resumen de Evaluación Heurística
| Heurística | Gravedad | Hallazgo Clave |
|-----------|---------|--------------|
[Tabla resumen del Paso 1]

### Cumplimiento de Accesibilidad
- **Objetivo**: WCAG 2.1 AA
- **Estado**: [X de Y criterios pasan]
- **Fallos críticos**: [Lista]

### Análisis de Flujos de Usuario
[Puntos de fricción clave con gravedad y recomendaciones]

### Top 5 Mejoras (Priorizadas)
1. **[Problema]** — Gravedad: [N] — [Recomendación específica]
2. ...

### Lo que Funciona Bien
1. [Observación positiva específica]
2. ...
```

**Esperado:** La revisión proporciona recomendaciones priorizadas y accionables con valoraciones de gravedad.
**En caso de fallo:** Si la revisión revela demasiados problemas, categorícelos en "debe corregir" (gravedad 3-4) y "debería corregir" (gravedad 1-2).

## Validación

- [ ] Las 10 heurísticas de Nielsen evaluadas con valoraciones de gravedad
- [ ] Criterios WCAG 2.1 verificados (como mínimo: 1.1.1, 1.4.3, 2.1.1, 2.4.7, 3.3.1, 4.1.2)
- [ ] Navegación con teclado probada para flujos de usuario clave
- [ ] Lector de pantalla probado (o ARIA/HTML semántico revisado como proxy)
- [ ] Al menos un flujo de usuario crítico analizado en cuanto a fricción
- [ ] Carga cognitiva evaluada
- [ ] Usabilidad de formularios evaluada
- [ ] Hallazgos priorizados por gravedad con recomendaciones accionables

## Errores Comunes

- **Confundir UX con diseño visual**: La UX trata de cómo funciona; el diseño visual trata de cómo se ve. Una interfaz hermosa puede tener una UX terrible. Evalúe ambas pero distíngalas.
- **Probar solo el camino feliz**: Los estados de error, vacío, carga y los casos extremos son donde se esconden los problemas de UX.
- **Ignorar los dispositivos reales**: El modo responsivo de las herramientas de desarrollo del navegador es un proxy. Las pruebas en dispositivos reales detectan problemas táctiles, de rendimiento y de ventana gráfica.
- **La accesibilidad como reflexión tardía**: Los problemas de accesibilidad encontrados tarde son costosos de corregir. Evalúe pronto y continuamente.
- **Preferencia personal como retroalimentación UX**: "Yo preferiría..." no es retroalimentación UX. Cite heurísticas, investigaciones o patrones establecidos.

## Habilidades Relacionadas

- `review-web-design` — revisión de diseño visual (diseño, tipografía, color — complementario a UX)
- `scaffold-nextjs-app` — andamiaje de aplicaciones Next.js
- `setup-tailwind-typescript` — Tailwind CSS para implementación de sistemas de diseño
