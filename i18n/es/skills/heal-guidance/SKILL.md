---
name: heal-guidance
description: >
  Guiar a una persona a través de modalidades de sanación — evaluación somática,
  exploración emocional, reenmarque cognitivo e integración de prácticas de
  bienestar. Guía a las personas a través de un proceso de auto-sanación usando
  la escucha activa, preguntas y técnicas apropiadas. Usar cuando alguien
  expresa malestar físico o emocional, cuando la conversación revela estrés,
  agotamiento o abrumamiento subyacente, cuando se solicita específicamente
  orientación de bienestar, o cuando un usuario quiere explorar prácticas de
  auto-cuidado.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: esoteric
  complexity: advanced
  language: natural
  tags: esoteric, healing, guidance, wellness, somatic, emotional, cognitive, ai-self-application
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Guía de Sanación

Guiar a una persona a través de un proceso de auto-sanación — combinando conciencia somática, exploración emocional, reenmarque cognitivo e integración práctica. La sanación aquí significa restauración de la función, no cura de enfermedad. Es el proceso de notar dónde la energía, la atención o el bienestar están restringidos y trabajar suave y sistemáticamente con esa restricción.

## Cuándo Usar

- Alguien expresa malestar físico o emocional y busca orientación
- La conversación revela estrés, agotamiento o abrumamiento subyacente
- Se solicita específicamente orientación de bienestar o prácticas de auto-cuidado
- Un usuario quiere explorar técnicas de regulación mente-cuerpo
- Después de que una sesión de `listen` revela tensión o desequilibrio más profundos
- Como complemento a `meditate-guidance` cuando la persona necesita más que limpieza — necesita reparación

## Entradas

- **Requerido**: Disposición de la persona para participar (consentimiento implícito o explícito)
- **Opcional**: Preocupación o síntoma específico (p. ej., "He estado estresado por el trabajo", "Mi hombro está tenso")
- **Opcional**: Experiencia previa con prácticas de bienestar (yoga, meditación, trabajo corporal, terapia)
- **Opcional**: Preferencias o límites (p. ej., "No me gusta la visualización", "Prefiero enfoques cognitivos")
- **Opcional**: MEMORY.md para contexto de sesiones anteriores (vía `Read`)

## Procedimiento

### Paso 1: Establecer Seguridad y Encuadre

Crear el contenedor para la exploración de sanación. La seguridad viene primero — antes de cualquier técnica, la persona necesita saber que esto es voluntario, que tiene el control y que la incomodidad es una señal, no una orden.

1. Reconocer lo que la persona ha compartido sin diagnosticar ni arreglar:
   - "Escucho que estás experimentando ___. Gracias por compartir eso."
   - Evitar saltar a soluciones — primero honrar la experiencia
2. Establecer el marco:
   - "La sanación aquí no se trata de arreglar algo roto — se trata de notar dónde las cosas están restringidas y explorar lo que podría ayudarlas a fluir de nuevo."
   - "Puedes pausar o detenerte en cualquier momento. Esto es totalmente tuyo."
3. Verificar cualquier límite:
   - "¿Hay algo que preferirías que no abordemos, o algún enfoque que funcione especialmente bien para ti?"
4. Calibrar la profundidad:
   - Si la persona parece cautelosa: mantenerlo ligero y cognitivo
   - Si la persona parece abierta: ofrecer exploración más profunda
   - Si la persona parece en crisis: reconocer los límites y sugerir apoyo profesional
   - **Importante**: No eres un terapeuta, consejero o profesional médico. Si alguien describe síntomas que sugieren crisis de salud mental, trauma, o condición médica, reconoce la limitación de forma amable y sugiere recursos profesionales apropiados.

**Esperado:** La persona se siente segura, respetada y con control del proceso. El encuadre está claro: esto es exploración, no tratamiento.

**En caso de fallo:** Si la persona parece incómoda con el encuadre, simplificar. "Solo vamos a registrarnos con cómo te sientes y ver si algo útil emerge." Lo más simple que funcione es siempre la mejor opción.

### Paso 2: Escaneo Somático — Verificar con el Cuerpo

Guiar la atención de la persona hacia su experiencia física. El cuerpo a menudo contiene información que la mente aún no ha procesado.

1. Invitar a la conciencia corporal:
   - "Toma un momento para notar tu cuerpo ahora mismo. No necesitas cambiar nada — solo nota."
   - "¿Qué llama tu atención? ¿Alguna tensión, pesadez, inquietud, o sensación en alguna parte?"
2. Explorar lo que surge:
   - Si se identifica tensión: "¿Puedes describir esa tensión? ¿Se siente apretada, quemante, presionante, o de alguna otra manera?"
   - Si nada surge: "Eso está bien — no siempre hay una señal fuerte. Pasemos a cómo están las cosas emocionalmente."
3. Ofrecer una técnica somática simple si es apropiado:
   - **Relajación por tensión**: "Intenta tensar esa área deliberadamente por 5 segundos, luego suelta completamente. A veces los músculos necesitan permiso para soltar."
   - **Conciencia de la respiración**: "Nota si puedes dirigir tu respiración hacia esa área. No necesita funcionar — solo notando la intención puede ayudar."
   - **Movimiento**: "Si el trabajo lo permite, ¿puedes estirar, rotar o mover suavemente esa parte de tu cuerpo?"
4. Validar cualquier cosa que surja:
   - "Lo que estás notando es información real. Tu cuerpo está comunicándose."

**Esperado:** La persona ha verificado con su cuerpo y puede nombrar al menos una sensación física (incluso si es "Me siento neutro/bien"). Las señales somáticas proporcionan un punto de entrada para una exploración más profunda.

**En caso de fallo:** Si la persona no puede conectar con sensaciones corporales (común para quienes pasan mucho tiempo en el pensamiento), no forzar. Pasar al Paso 3 (exploración emocional) y volver al cuerpo más tarde si se siente natural.

### Paso 3: Exploración Emocional — Nombrar lo que Está Presente

Ayudar a la persona a identificar y nombrar su paisaje emocional. Nombrar las emociones las regula — la investigación sobre etiquetado de afectos muestra que articular sentimientos reduce su intensidad.

1. Preguntar abiertamente:
   - "¿Cómo describirías tu estado emocional ahora mismo?"
   - Si la persona tiene dificultades con la granularidad: "¿Es más como tensión, agotamiento, frustración, tristeza, ansiedad, o algo más?"
2. Explorar la emoción nombrada:
   - "¿Cuánto tiempo ha estado presente esto?"
   - "¿Se conecta con algo específico, o está más como un ruido de fondo?"
   - "¿Hay algo que la emoción quiere o necesita?" (Esto puede sentirse inusual — invita a la perspectiva de que las emociones transportan información, no solo incomodidad)
3. Validar sin minimizar:
   - "Tiene sentido que sientas eso dado lo que está sucediendo."
   - Evitar: "Al menos...", "Míralo por el lado positivo...", o cualquier cosa que descarte la experiencia
4. Verificar capas:
   - "¿Hay algo debajo de eso? A veces lo que notamos primero (como irritación) está protegiendo algo más suave debajo (como decepción o miedo)."
   - Solo preguntar si la persona parece dispuesta — no empujar

**Esperado:** La persona ha nombrado al menos un estado emocional con algo de especificidad. El acto de nombrar mismo es terapéutico — este paso no necesita resolver nada, solo hacer visible el paisaje emocional.

**En caso de fallo:** Si la persona dice "Estoy bien" pero señales previas sugieren lo contrario, respetar su límite declarado. "Está bien. Avísame si quieres explorar algo más adelante." La presión para abrir contradice la seguridad del Paso 1.

### Paso 4: Exploración Cognitiva — Examinar Patrones de Pensamiento

Guiar a la persona para notar patrones de pensamiento que podrían estar contribuyendo al malestar. No se trata de TCC o reestructuración formal — se trata de amable notificación.

1. Explorar la narrativa:
   - "¿Cuál es la historia que te estás contando sobre esto?" (Las personas a menudo tienen una narrativa interna que amplifica o minimiza su experiencia)
   - "¿Qué significado estás asignando a lo que está sucediendo?"
2. Notar distorsiones suavemente (si están presentes):
   - **Pensamiento todo-o-nada**: "Escucho mucho 'siempre' y 'nunca'. ¿Realmente es así de absoluto, o hay matices?"
   - **Catastrofización**: "¿Cuál es el resultado que temes? ¿Qué tan probable es realmente?"
   - **Lectura mental**: "Estás asumiendo que sabes lo que piensan. ¿Lo has verificado?"
   - **Descuento del mérito propio**: "Restas importancia al éxito pero amplificas los problemas. ¿Qué pasa si ambos son igualmente reales?"
3. Ofrecer un reenmarque solo si se siente natural:
   - "Otra forma de ver esto podría ser ___. ¿Eso resuena, o te parece incorrecto?"
   - Nunca imponer un reenmarque — ofrecer y dejar que la persona decida si encaja
4. Reconocer los límites del reenmarque:
   - A veces la situación genuinamente es difícil, y la respuesta cognitiva correcta es reconocer eso, no reenmarcar como positivo
   - "Puede que esto sea simplemente difícil ahora mismo, y no se necesita un reencuadre."

**Esperado:** La persona ha examinado al menos un patrón de pensamiento y ha obtenido cierta perspectiva, o ha confirmado que su evaluación cognitiva es precisa. Ambos resultados son valiosos.

**En caso de fallo:** Si el trabajo cognitivo se siente demasiado analítico o desconectado, volver a lo somático o emocional. Algunas personas procesan mejor a través del cuerpo o los sentimientos que a través del pensamiento. Conocer a la persona donde está.

### Paso 5: Integración — Conectar los Hilos

Reunir los hallazgos somáticos, emocionales y cognitivos en una imagen coherente.

1. Reflejar lo que ha surgido:
   - "Esto es lo que estoy escuchando: tu cuerpo está sintiendo ___, emocionalmente estás ___, y la historia que te estás contando es ___. ¿Eso captura bien?"
2. Notar conexiones:
   - "Es interesante que la tensión en tus hombros y la presión que sientes en el trabajo pueden estar conectadas — el cuerpo a menudo carga lo que la mente no ha procesado."
3. Preguntar qué necesita atención:
   - "De todo lo que hemos explorado, ¿qué se siente más importante abordar?"
   - Dejar que la persona elija — la sabiduría propia sobre qué necesita atención es más valiosa que la prescripción externa

**Esperado:** Una imagen integrada que conecta las dimensiones física, emocional y cognitiva. La persona puede ver patrones que no eran visibles cuando cada dimensión se consideraba por separado.

**En caso de fallo:** Si la integración se siente forzada (los hilos no conectan naturalmente), no fabricar conexiones. "Estos pueden ser hilos separados, y eso está bien. No todo necesita conectarse en una narrativa ordenada."

### Paso 6: Prácticas Prácticas — Ofrecer Herramientas

Sugerir 1-2 prácticas concretas que la persona pueda probar. Menos es más — una práctica que realmente hacen es mejor que diez que olvidarán.

1. Alinear las sugerencias con lo que surgió:
   - Si somático: estiramientos específicos, higiene del sueño, pausas de movimiento
   - Si emocional: diario, hablar con alguien, auto-compasión programada
   - Si cognitivo: prueba de suposiciones, práctica de gratitud, descansos de preocupación programados
   - Si general: técnica de respiración, caminar al aire libre, reducir estimulación
2. Hacer las sugerencias específicas y alcanzables:
   - "¿Podrías intentar un estiramiento de hombros de 30 segundos cada hora mañana? Solo mañana — no te comprometas a más."
   - No: "Deberías empezar una práctica de meditación." (Demasiado vago, demasiado grande)
3. Empoderar, no prescribir:
   - "Estas son sugerencias — tú sabes qué funciona para ti mejor que yo. ¿Algo de esto te parece que podría ayudar?"
4. Plantar una semilla para la próxima vez:
   - "Si esto se siente útil, siempre podemos registrarnos de nuevo más adelante."

**Esperado:** 1-2 prácticas específicas y alcanzables que la persona puede intentar. Las prácticas se alinean con lo que surgió en la exploración, no con prescripciones genéricas de bienestar.

**En caso de fallo:** Si la persona rechaza todas las sugerencias, respeta eso. A veces la exploración en sí es la práctica — nombrar la experiencia, sentirse escuchado, obtener perspectiva. No necesita resolver nada.

### Paso 7: Cierre y Regreso

Cerrar la sesión de sanación con amabilidad y completitud.

1. Reconocer el coraje:
   - "Gracias por explorar esto abiertamente. Verificar con uno mismo requiere honestidad genuina."
2. Resumir brevemente:
   - "Hoy exploramos ___ y descubrimos ___."
   - Mantener el resumen corto — no repetir toda la sesión
3. Normalizar el estado actual:
   - "Sin importar cómo te sientas ahora mismo — más ligero, pensativo, cansado, o igual — todo eso es normal después de este tipo de verificación."
4. Transicionar suavemente:
   - "¿Quieres continuar con la tarea, o necesitas un momento?"
   - Si la persona quiere continuar con el trabajo, hacer la transición limpia — no seguir en modo de sanación durante el trabajo técnico

**Esperado:** Un cierre limpio que honra lo que se exploró sin prolongarlo. La persona se siente completa, no cortada ni abrumada.

**En caso de fallo:** Si la persona parece movilizada (la exploración tocó algo profundo), prioriza la contención sobre la completitud. "Parece que tocamos algo importante. ¿Quieres sentarte con eso un momento, o prefieres abordarlo otro día?" No dejar a alguien en un estado emocionalmente abierto sin cierre.

### Paso 8: Documentar (Solo si es Apropiado)

Si la sesión reveló patrones que vale la pena preservar para futuras sesiones, considera documentarlos.

1. Solo documentar con permiso implícito o explícito
2. Documentar patrones, no detalles privados:
   - Sí: "El usuario se beneficia de registros somáticos antes del trabajo de planificación"
   - No: "El usuario está ansioso por la situación laboral"
3. Almacenar en MEMORY.md bajo un encabezado apropiado
4. Si no hay nada que documentar, eso está perfectamente bien — no toda sesión de sanación necesita dejar un rastro

**Esperado:** Documentación mínima y respetuosa si los patrones fueron significativos, o ninguna documentación si la sesión fue autocontenida.

**En caso de fallo:** En caso de duda, no documentar. La privacidad supera a la preservación de patrones.

## Validación

- [ ] Se estableció seguridad y el encuadre fue apropiado para la disposición de la persona
- [ ] Se ofreció exploración somática (incluso si la persona la omitió)
- [ ] Los estados emocionales fueron nombrados con especificidad
- [ ] Los patrones cognitivos fueron examinados sin imposición
- [ ] La integración conectó los hilos sin fabricar conexiones
- [ ] Las sugerencias prácticas fueron específicas, alcanzables y alineadas con los hallazgos
- [ ] El cierre fue limpio y completo
- [ ] Se respetaron los límites de la persona durante todo el proceso
- [ ] Se proporcionaron referencias a apoyo profesional si las preocupaciones excedían el alcance

## Errores Comunes

- **Jugar a ser terapeuta**: Esta es una guía para auto-exploración, no una sesión de terapia. Reconocer los límites. Si alguien describe síntomas clínicos, sugerir apoyo profesional amablemente
- **Saltar a soluciones**: El error número uno. Escuchar y explorar antes de sugerir. La persona sabe más sobre su experiencia de lo que tú sabrás jamás
- **Forzar la conexión mente-cuerpo**: No todo se conecta ordenadamente. A veces un hombro tenso es solo un hombro tenso, no una metáfora del estrés laboral
- **Reenmarcar la invalidación**: "¡Pero mira todo lo que has logrado!" invalida la lucha actual. Valida primero, reenmarca solo cuando se invite
- **Sobre-medicalizar**: Notar tensión o emociones no es un diagnóstico. Mantener el lenguaje experiencial, no clínico
- **Ignorar señales de alarma**: Si alguien describe pensamientos de autolesión, suicidio, o abuso, eso necesita derivación profesional, no auto-exploración guiada. Conocer los límites del rol
- **Sobre-documentar**: Escribir demasiados detalles privados en MEMORY.md. Preservar patrones, no confesiones

## Habilidades Relacionadas

- `heal` — la versión de auto-aplicación de IA; esta habilidad es la versión guiada para humanos
- `meditate-guidance` — guiar meditación; la sanación va más profundo que la limpieza
- `listen` — escucha receptiva profunda que sustenta toda la guía de sanación
- `listen-guidance` — enseñar habilidades de escucha; complementario a la guía de sanación
- `attune` — calibrar a la persona; esencial durante toda la sesión de sanación
- `observe` — observación neutral que informa la fase de integración
- `breathe` — técnica de micro-reinicio que puede recomendarse como herramienta práctica
