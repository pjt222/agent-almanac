---
name: review-web-design
description: >
  Revisar el diseño web en cuanto a calidad del diseño, tipografía, uso del
  color, espaciado, comportamiento responsivo, consistencia de marca y jerarquía
  visual. Cubre la evaluación de principios de diseño y recomendaciones de
  mejora. Usar al revisar una maqueta antes del desarrollo, evaluar un sitio
  implementado en cuanto a calidad de diseño, proporcionar retroalimentación
  durante una sesión de revisión de diseño, evaluar la consistencia de marca,
  o verificar el comportamiento responsivo en distintos puntos de quiebre.
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
  complexity: intermediate
  language: multi
  tags: web-design, layout, typography, colour, responsive, visual-hierarchy, branding
---

# Revisar Diseño Web

Evaluar un diseño web en cuanto a calidad visual, consistencia y efectividad en distintos dispositivos.

## Cuándo Usar

- Revisar una maqueta o prototipo de diseño antes del desarrollo
- Evaluar un sitio web o aplicación web implementada en cuanto a calidad de diseño
- Proporcionar retroalimentación sobre diseño visual durante una sesión de revisión
- Evaluar la consistencia de marca en múltiples páginas o secciones
- Verificar el comportamiento del diseño responsivo en distintos puntos de quiebre

## Entradas

- **Obligatorio**: Diseño a revisar (URL, archivos de maqueta, capturas de pantalla o código fuente)
- **Opcional**: Directrices de marca o documentación del sistema de diseño
- **Opcional**: Descripción de la audiencia objetivo
- **Opcional**: Diseños de referencia o ejemplos de la competencia
- **Opcional**: Áreas específicas de preocupación

## Procedimiento

### Paso 1: Evaluar la Jerarquía Visual

La jerarquía visual guía el ojo del usuario a través del contenido en orden de importancia.

- [ ] **Punto focal claro**: ¿Hay un punto de entrada obvio en cada página/pantalla?
- [ ] **Jerarquía de encabezados**: ¿Descienden los encabezados lógicamente (H1 → H2 → H3)?
- [ ] **Contraste de tamaño**: ¿Son los elementos importantes más grandes que los elementos de soporte?
- [ ] **Contraste de color**: ¿Son las llamadas a la acción y acciones clave visualmente prominentes?
- [ ] **Espacio en blanco**: ¿El espaciado separa eficazmente los grupos lógicos?
- [ ] **Flujo de lectura**: ¿Sigue el diseño un patrón de lectura natural (patrón F, patrón Z)?

```markdown
## Evaluación de Jerarquía Visual
| Página/Sección | Punto Focal | ¿Jerarquía Clara? | Problemas |
|---------------|-------------|------------------|----------|
| Inicio | CTA en el hero | Sí | El CTA secundario compite con el principal |
| Página de producto | Imagen del producto | En su mayoría | El precio no es lo suficientemente prominente |
| Formulario de contacto | Botón de envío | No | El título del formulario tiene el mismo tamaño que el texto del cuerpo |
```

**Esperado:** Cada página/sección principal evaluada en cuanto a jerarquía visual clara.
**En caso de fallo:** Si las maquetas no están disponibles, evalúe desde el código en vivo usando las herramientas de desarrollo del navegador.

### Paso 2: Evaluar la Tipografía

- [ ] **Selección de fuentes**: ¿Son las fuentes apropiadas para la marca y el tipo de contenido?
- [ ] **Combinación de fuentes**: ¿Se complementan las fuentes de encabezado y cuerpo (máximo 2-3 familias)?
- [ ] **Escala tipográfica**: ¿Existe una escala consistente (p. ej., segunda mayor 1.25, cuarta perfecta 1.333)?
- [ ] **Altura de línea**: El texto del cuerpo tiene altura de línea 1.4-1.6; los encabezados tienen 1.1-1.3
- [ ] **Longitud de línea**: La longitud de línea del texto del cuerpo es de 45-75 caracteres (óptimo ~66)
- [ ] **Peso de fuente**: Las variaciones de peso usadas consistentemente para indicar jerarquía
- [ ] **Tamaño de fuente**: El tamaño base de fuente es al menos 16px para el texto del cuerpo

```css
/* Ejemplo de escala tipográfica bien estructurada (ratio 1.25) */
:root {
  --text-xs: 0.64rem;    /* 10.24px */
  --text-sm: 0.8rem;     /* 12.8px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.25rem;    /* 20px */
  --text-xl: 1.563rem;   /* 25px */
  --text-2xl: 1.953rem;  /* 31.25px */
  --text-3xl: 2.441rem;  /* 39.06px */
}
```

**Esperado:** Tipografía evaluada en cuanto a consistencia, legibilidad y jerarquía.
**En caso de fallo:** Si el diseño usa más de 3 familias de fuentes, recomiende una consolidación.

### Paso 3: Revisar el Uso del Color

- [ ] **Coherencia de paleta**: ¿Es la paleta de colores intencional y limitada (típicamente 3-5 colores + neutros)?
- [ ] **Alineación con la marca**: ¿Coinciden los colores con las directrices de marca?
- [ ] **Ratios de contraste**: El texto cumple WCAG AA (4.5:1 para texto normal, 3:1 para texto grande)
- [ ] **Color semántico**: ¿Se usan los colores consistentemente para transmitir significado (rojo=error, verde=éxito)?
- [ ] **Daltonismo**: ¿Se transmite la información por más medios que solo el color?
- [ ] **Modo oscuro/claro**: Si se admite, ambos modos mantienen la legibilidad y consistencia de marca

```markdown
## Evaluación de Color
| Uso | Color | Ratio de Contraste | WCAG AA | Notas |
|-----|-------|-------------------|---------|-------|
| Texto del cuerpo sobre blanco | #333333 | 12.6:1 | Pasa | Bien |
| Texto de enlace sobre blanco | #2563eb | 5.2:1 | Pasa | Bien |
| Texto atenuado sobre gris claro | #9ca3af sobre #f3f4f6 | 2.1:1 | FALLA | Aumentar contraste |
| Texto del botón CTA | #ffffff sobre #22c55e | 3.1:1 | FALLA para texto pequeño | Usar verde más oscuro o texto más grande |
```

**Esperado:** Paleta de colores revisada en cuanto a coherencia, accesibilidad y consistencia semántica.
**En caso de fallo:** Use una herramienta de verificación de contraste (WebAIM) para verificar los ratios exactos.

### Paso 4: Evaluar el Diseño y el Espaciado

- [ ] **Sistema de cuadrícula**: ¿Se usa una cuadrícula consistente (12 columnas, auto-diseño o personalizada)?
- [ ] **Escala de espaciado**: ¿El espaciado es sistemático (base 4px/8px, o escala similar a Tailwind)?
- [ ] **Alineación**: ¿Los elementos están alineados a la cuadrícula (sin elementos "casi alineados")?
- [ ] **Densidad**: ¿Es la densidad de información apropiada para el tipo de contenido (datos pesados vs. marketing)?
- [ ] **Espacio en blanco**: ¿Se usa el espacio en blanco intencionalmente para agrupar y separar?
- [ ] **Consistencia**: ¿Las secciones similares tienen el mismo espaciado?

Auditoría de espaciado:

```markdown
## Verificación de Consistencia de Espaciado
| Par de Elementos | Brecha Esperada | Brecha Real | ¿Consistente? |
|-----------------|----------------|-------------|--------------|
| Título de sección a contenido | 24px | 24px | Sí |
| Tarjeta a tarjeta | 16px | 16px/24px | No — inconsistente |
| Etiqueta de formulario a entrada | 8px | 4px/8px/12px | No — varía |
```

**Esperado:** El diseño usa una cuadrícula sistemática y una escala de espaciado consistentemente.
**En caso de fallo:** Si el espaciado es inconsistente, recomiende adoptar una escala de espaciado (p. ej., `space-*` de Tailwind).

### Paso 5: Evaluar el Diseño Responsivo

Probar en los puntos de quiebre clave:

| Punto de Quiebre | Ancho | Representa |
|-----------------|-------|-----------|
| Móvil | 375px | iPhone SE / teléfonos pequeños |
| Móvil L | 428px | iPhone 14 / teléfonos grandes |
| Tableta | 768px | iPad en portrait |
| Escritorio | 1280px | Portátil estándar |
| Ancho | 1536px+ | Monitor de escritorio |

Verificar en cada punto de quiebre:
- [ ] **Adaptación del diseño**: ¿El diseño se reordena apropiadamente (apilado en móvil, lado a lado en escritorio)?
- [ ] **Objetivos táctiles**: ¿Son los elementos interactivos de al menos 44x44px en móvil?
- [ ] **Legibilidad del texto**: ¿El tamaño de fuente es apropiado para la ventana gráfica?
- [ ] **Escalado de imágenes**: ¿Cambian de tamaño las imágenes sin distorsión ni desbordamiento?
- [ ] **Navegación**: ¿Es la navegación móvil accesible (hamburguesa, navegación inferior, etc.)?
- [ ] **Sin scroll horizontal**: El contenido no desborda horizontalmente la ventana gráfica

```markdown
## Revisión Responsiva
| Punto de Quiebre | Diseño | Objetivos Táctiles | Texto | Imágenes | Navegación | Problemas |
|-----------------|--------|-------------------|-------|---------|-----------|---------|
| 375px | OK | OK | OK | Desbordamiento en hero | Hamburguesa | La imagen hero se recorta |
| 768px | OK | OK | OK | OK | Hamburguesa | Ninguno |
| 1280px | OK | N/A | OK | OK | Navegación completa | Ninguno |
| 1536px | OK | N/A | Línea demasiado larga | OK | Navegación completa | Agregar max-width al contenido |
```

**Esperado:** Diseño probado en todos los puntos de quiebre clave con problemas documentados.
**En caso de fallo:** Si las herramientas de prueba responsiva no están disponibles, revise las media queries de CSS para cobertura.

### Paso 6: Verificar la Consistencia de Marca

- [ ] **Uso del logotipo**: Logotipo renderizado correctamente (tamaño, espaciado, zona de exclusión)
- [ ] **Precisión del color**: Los colores de marca coinciden con las especificaciones (valores hex, no "suficientemente parecido")
- [ ] **Correspondencia de tipografía**: Las fuentes coinciden con las directrices de marca
- [ ] **Tono/voz**: El texto de la interfaz coincide con la personalidad de la marca
- [ ] **Iconografía**: Los iconos son de un conjunto consistente (estilo, peso, cuadrícula)
- [ ] **Estilo fotográfico**: Las imágenes coinciden con las directrices de marca (si aplica)

**Esperado:** Elementos de marca verificados frente a las directrices con desviaciones específicas anotadas.
**En caso de fallo:** Si no existen directrices de marca, anote esto como recomendación y evalúe la consistencia interna en su lugar.

### Paso 7: Redactar la Revisión de Diseño

```markdown
## Revisión de Diseño Web

### Impresión General
[2-3 oraciones: calidad general, aspectos más fuertes y más débiles]

### Jerarquía Visual: [Puntuación/5]
[Hallazgos clave con referencias específicas]

### Tipografía: [Puntuación/5]
[Hallazgos clave con referencias específicas]

### Color: [Puntuación/5]
[Hallazgos clave con referencias específicas]

### Diseño y Espaciado: [Puntuación/5]
[Hallazgos clave con referencias específicas]

### Diseño Responsivo: [Puntuación/5]
[Hallazgos clave con referencias específicas]

### Consistencia de Marca: [Puntuación/5]
[Hallazgos clave con referencias específicas]

### Mejoras Prioritarias
1. [Cambio más impactante — específico y accionable]
2. [Segunda prioridad]
3. [Tercera prioridad]

### Notas Positivas
1. [Lo que funciona bien y debe preservarse]
```

**Esperado:** La revisión proporciona retroalimentación específica con referencias visuales y mejoras priorizadas.
**En caso de fallo:** Si la puntuación parece arbitraria, use un sistema más simple de pasa/preocupación/falla en su lugar.

## Validación

- [ ] Jerarquía visual evaluada para todas las páginas/secciones principales
- [ ] Tipografía evaluada en cuanto a legibilidad, consistencia y escala
- [ ] Contraste de color verificado frente a los mínimos WCAG AA
- [ ] Diseño y espaciado verificados en cuanto a consistencia de cuadrícula
- [ ] Diseño responsivo probado en 3+ puntos de quiebre
- [ ] Consistencia de marca verificada frente a directrices (o consistencia interna evaluada)
- [ ] La retroalimentación es específica con referencias visuales (página, sección, elemento)

## Errores Comunes

- **Subjetividad sin razonamiento**: "No me gusta el color" no es accionable. Explique por qué (contraste, desajuste con la marca, accesibilidad).
- **Ignorar la accesibilidad**: La revisión de diseño visual debe incluir verificaciones de contraste WCAG. Los diseños hermosos que excluyen usuarios no son buenos diseños.
- **Revisar solo maquetas**: Pruebe el comportamiento responsivo, los estados al pasar el cursor y las transiciones — no solo los diseños estáticos.
- **Prescribir soluciones**: Describa el problema ("el texto es difícil de leer sobre este fondo") en lugar de dictar una solución específica ("use #333").
- **Olvidar el contexto**: Una aplicación bancaria y un sitio de juegos tienen estándares de diseño diferentes. Revise según el contexto apropiado.

## Habilidades Relacionadas

- `review-ux-ui` — usabilidad, patrones de interacción y accesibilidad (complementario al diseño visual)
- `setup-tailwind-typescript` — implementación de Tailwind CSS para sistemas de diseño
- `scaffold-nextjs-app` — andamiaje de aplicaciones Next.js
