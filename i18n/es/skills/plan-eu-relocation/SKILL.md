---
name: plan-eu-relocation
description: >
  Planificar un cronograma completo de reubicación a la UE/DACH con mapeo de
  dependencias entre pasos burocráticos, seguimiento de plazos e identificación
  de procedimientos específicos por país. Usar al planificar una mudanza entre
  países de la UE/DACH, al reubicarse desde un país fuera de la UE a un destino
  UE/DACH, al coordinar una reubicación laboral con RRHH del empleador, al
  gestionar una reubicación con plazos ajustados, o cuando se necesita un único
  documento que mapee todo el proceso de reubicación de principio a fin.
license: MIT
allowed-tools: Read Grep Glob WebFetch WebSearch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: relocation
  complexity: advanced
  language: natural
  tags: relocation, eu, dach, timeline, dependencies, planning
  locale: es
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Plan EU Relocation

Crear un plan de reubicación estructurado y consciente de dependencias para mudarse dentro de o hacia la región UE/DACH, cubriendo pasos burocráticos, plazos y requisitos específicos por país.

## Cuándo Usar

- Planificar una mudanza de un país UE/DACH a otro
- Reubicarse desde un país fuera de la UE a un destino UE/DACH
- Necesitar entender qué pasos burocráticos dependen de cuáles antes de comenzar
- Coordinar una reubicación laboral con RRHH del empleador
- Gestionar una reubicación con plazos ajustados (fecha de inicio laboral, inicio de alquiler, inscripción escolar)
- Querer un único documento que mapee todo el proceso de reubicación de principio a fin

## Entradas

### Requerido

- **País de origen**: País de residencia actual
- **País de destino**: País objetivo (Alemania, Austria o Suiza principalmente; otros de la UE soportados)
- **Nacionalidad(es)**: Ciudadanía(s) poseídas, incluyendo la distinción UE/no-UE
- **Tipo de empleo**: Empleado (contrato local), trabajador desplazado, autónomo, freelance, desempleado, estudiante o jubilado
- **Fecha objetivo de mudanza**: Fecha aproximada de la reubicación física
- **Composición del hogar**: Soltero, pareja, familia con hijos (edades), mascotas

### Opcional

- **Fecha de inicio laboral**: Primer día de empleo en el país de destino
- **Estado de vivienda**: Ya asegurada, en búsqueda, proporcionada por el empleador
- **Cobertura de seguro actual**: Salud, responsabilidad civil, hogar
- **Nivel de idioma**: Nivel del idioma del país de destino (A1-C2 o ninguno)
- **Circunstancias especiales**: Discapacidad, embarazo, obligaciones de servicio militar, asuntos legales en curso, acuerdos de custodia
- **Registros previos en la UE**: Anmeldung previo o equivalente en otros países de la UE

## Procedimiento

### Paso 1: Evaluar la Situación

Recopilar todo el contexto personal, profesional y legal relevante para determinar qué vías burocráticas aplican.

1. Confirmar el estatus de nacionalidad UE vs. no-UE para todos los miembros del hogar
2. Determinar si se requiere visa o permiso de residencia (nacionales no-UE, familiares no-EEE)
3. Clasificar el tipo de empleo y verificar si se necesita un permiso de trabajo por separado del permiso de residencia
4. Anotar cualquier acuerdo bilateral entre los países de origen y destino (seguridad social, tratados fiscales, reconocimiento de cualificaciones)
5. Identificar si la mudanza es permanente, temporal (menos o más de 183 días), o trabajo transfronterizo
6. Registrar todas las fechas fijas: inicio laboral, inicio de alquiler, inicio del año escolar, períodos de preaviso en la residencia actual

**Esperado:** Un documento de perfil estructurado que contenga el estatus de nacionalidad, la clasificación de empleo, el tipo de mudanza y todas las fechas fijas.

**En caso de fallo:** Si el estatus de nacionalidad o empleo es ambiguo (ej., doble nacionalidad con una no-UE, o distinción poco clara entre contratista y empleado), escalar a un asesor legal o la embajada del país de destino antes de proceder. No adivinar los requisitos de visa.

### Paso 2: Mapear la Cadena de Dependencias

Identificar todos los pasos burocráticos y sus prerrequisitos para establecer el orden correcto de ejecución.

1. Listar todos los registros requeridos para el país de destino:
   - Registro de residencia (Anmeldung / Meldezettel / Anmeldung bei der Gemeinde)
   - Registro fiscal o asignación de número
   - Inscripción en seguro de salud
   - Registro de seguridad social
   - Apertura de cuenta bancaria
   - Re-matriculación de vehículo (si aplica)
   - Inscripción escolar/guardería (si aplica)
   - Procedimientos de importación de mascotas (si aplica)
2. Listar todos los pasos de baja en el país de origen:
   - Baja de residencia (Abmeldung o equivalente)
   - Notificación a la oficina de impuestos
   - Cancelaciones o transferencias de seguros
   - Cancelación de servicios públicos
   - Redirección de correo
3. Mapear dependencias como un grafo acíclico dirigido (DAG):
   - El registro de residencia típicamente depende de tener un contrato de alquiler firmado
   - El número fiscal depende del registro de residencia
   - La cuenta bancaria puede depender del registro de residencia y el número fiscal
   - La inscripción en seguro de salud puede depender del contrato de empleo o el registro de residencia
   - La coordinación de seguridad social depende de la clasificación de empleo
4. Identificar vías paralelas: pasos que pueden proceder simultáneamente
5. Marcar pasos que requieren cita presencial vs. los que pueden hacerse online o por correo

**Esperado:** Un grafo de dependencias (textual o visual) que muestre todos los pasos, sus prerrequisitos y cuáles pueden ejecutarse en paralelo.

**En caso de fallo:** Si las dependencias no son claras para un país específico, buscar fuentes gubernamentales oficiales (ej., Alemania: bmi.bund.de, Austria: oesterreich.gv.at, Suiza: ch.ch). No asumir que las dependencias se transfieren entre países.

### Paso 3: Crear Cronograma con Plazos

Convertir el grafo de dependencias en un cronograma basado en calendario alineado con la fecha objetivo de mudanza.

1. Trabajar hacia atrás desde la fecha de mudanza y cualquier plazo fijo (inicio laboral, año escolar)
2. Para cada paso, estimar:
   - Tiempo de anticipación (cuán temprano puede iniciarse)
   - Tiempo de procesamiento (cuánto tarda la autoridad)
   - Tiempo de margen (holgura recomendada para retrasos)
3. Asignar ventanas de calendario a cada paso:
   - Acciones pre-mudanza (pueden hacerse desde el país de origen): solicitud de visa, investigación de seguros, preparación de documentos
   - Acciones de la semana de mudanza: Anmeldung, cuenta bancaria, tarjeta SIM
   - Acciones post-mudanza (dentro de plazos legales): registro fiscal, re-matriculación de vehículo, baja en origen
4. Anotar plazos legales con penalizaciones:
   - Alemania: Anmeldung dentro de 14 días desde la mudanza
   - Austria: Meldezettel dentro de 3 días
   - Suiza: Anmeldung dentro de 14 días (varía por cantón)
   - Los plazos de registro fiscal varían
5. Agregar tiempos de anticipación para reserva de citas (algunas oficinas Buergeramt requieren 2-6 semanas de anticipación)

**Esperado:** Un cronograma semana a semana que abarque desde 8-12 semanas antes de la mudanza hasta 4-8 semanas después, con cada paso burocrático ubicado en su ventana de ejecución.

**En caso de fallo:** Si la disponibilidad de citas es impredecible (común en grandes ciudades alemanas), incluir un margen de 2 semanas e identificar oficinas alternativas u opciones de atención sin cita por la mañana.

### Paso 4: Identificar Procedimientos Específicos por País

Adaptar el plan genérico a los requisitos y convenciones del país de destino específico.

1. Para Alemania:
   - Buergeramt Anmeldung (requiere Wohnungsgeberbestaetigung del arrendador)
   - Asignación de ID fiscal del Finanzamt (Steueridentifikationsnummer llega por correo en 2-4 semanas)
   - Inscripción en Krankenversicherung pública o privada
   - Coordinación de Rentenversicherung
   - Registro de Rundfunkbeitrag (GEZ)
   - Solicitudes de Elterngeld/Kindergeld si aplica
2. Para Austria:
   - Meldezettel en Meldeamt (dentro de 3 días)
   - Registro en Finanzamt para Steuernummer
   - e-card para seguro de salud (a través del empleador o auto-registro con OeGK)
   - Coordinación de Sozialversicherung
3. Para Suiza:
   - Registro en Einwohnerkontrolle (dentro de 14 días, dependiente del cantón)
   - Registro de seguro social AHV/IV/EO
   - Seguro de salud obligatorio (Grundversicherung) dentro de 3 meses
   - Quellensteuer o impuesto regular dependiendo del tipo de permiso
   - Solicitud de permiso de residencia (B o L) a través del empleador o cantón
4. Cruzar cada procedimiento con los documentos requeridos (ver habilidad check-relocation-documents)

**Esperado:** Una lista de procedimientos específica por país con nombres exactos de oficinas, formularios requeridos y tiempos de procesamiento típicos.

**En caso de fallo:** Si el destino es un municipio pequeño, los procedimientos pueden diferir del estándar nacional. Consultar el sitio web específico del Gemeinde/Kommune o llamar directamente a su Buergerservice.

### Paso 5: Señalar Elementos de Alto Riesgo

Identificar pasos donde los plazos incumplidos conllevan penalizaciones financieras, consecuencias legales o retrasos en cascada.

1. Marcar todos los pasos con plazos legales (Anmeldung, registro fiscal, inscripción en seguro)
2. Calcular la penalización por incumplir cada plazo:
   - Anmeldung tardío en Alemania: multa de hasta 1.000 EUR
   - Meldezettel tardío en Austria: multa de hasta 726 EUR
   - Seguro de salud tardío en Suiza: primas retroactivas más recargo
3. Identificar pasos cuello de botella que bloquean múltiples acciones posteriores:
   - Sin Anmeldung = sin ID fiscal = sin nómina correcta = sin cuenta bancaria (en algunos casos)
4. Señalar elementos que requieren documentos originales difíciles de reemplazar si se pierden (certificados de nacimiento, certificados de matrimonio, homologaciones de títulos)
5. Notar riesgos estacionales: las mudanzas de fin de año coinciden con cierres de oficinas; las mudanzas de septiembre coinciden con presión de inscripción escolar
6. Identificar pasos donde el país de origen también tiene un plazo (baja, coordinación del año fiscal, períodos de preaviso de seguros)

**Esperado:** Un registro de riesgos con cada elemento de alto riesgo, su plazo, penalización y estrategia de mitigación.

**En caso de fallo:** Si los montos de penalización o plazos no pueden confirmarse a través de fuentes oficiales, marcarlos como "sin confirmar" y recomendar consulta directa con la autoridad relevante. No inventar montos de penalización.

### Paso 6: Generar Documento de Plan de Reubicación

Compilar todos los hallazgos en un único plan de reubicación accionable.

1. Estructurar el documento con estas secciones:
   - Resumen ejecutivo (tipo de mudanza, fechas clave, composición del hogar)
   - Grafo de dependencias (visual o textual)
   - Cronograma (checklist semana a semana)
   - Procedimientos específicos por país (destino)
   - Procedimientos de baja (origen)
   - Registro de riesgos (elementos de alta prioridad resaltados)
   - Checklist de documentos (referencia cruzada a check-relocation-documents)
   - Lista de contactos (oficinas relevantes, teléfonos, URLs de citas)
2. Formatear cada elemento del checklist con:
   - Indicador de estado (no iniciado / en progreso / completado / bloqueado)
   - Plazo
   - Dependencias
   - Notas o consejos
3. Incluir una tarjeta de referencia rápida de "primeras 48 horas" para los pasos más críticos en tiempo después de la llegada
4. Agregar una sección "qué pasa si" para interrupciones comunes: el apartamento se cae, cambia la fecha de inicio laboral, documentos retrasados en el correo

**Esperado:** Un documento de plan de reubicación completo, estructurado y listo para ejecución, con todos los elementos rastreables hasta el grafo de dependencias y el registro de riesgos.

**En caso de fallo:** Si el plan es demasiado complejo para un único documento (ej., mudanza multi-país con dependientes que requieren vías de visa separadas), dividir en un cronograma maestro y sub-planes por persona.

## Validación

- [ ] Cada paso burocrático en el grafo de dependencias tiene al menos una fuente (sitio web gubernamental oficial, embajada o referencia legal)
- [ ] Todos los plazos legales están anotados con su base legal
- [ ] El cronograma tiene en cuenta fines de semana, días festivos y períodos de cierre de oficinas
- [ ] Ningún paso aparece antes de sus dependencias en el cronograma
- [ ] El registro de riesgos cubre como mínimo: Anmeldung, registro fiscal, seguro de salud y seguridad social
- [ ] El checklist de documentos tiene referencia cruzada con la salida de la habilidad check-relocation-documents
- [ ] Las fechas fijas (inicio laboral, inicio de alquiler) están reflejadas en el cronograma sin conflictos

## Errores Comunes

- **Asumir que todos los países de la UE tienen los mismos procedimientos**: Los plazos de registro, documentos requeridos y estructuras de oficinas varían significativamente incluso dentro de DACH
- **Subestimar los tiempos de anticipación para citas**: En Berlín, Hamburgo y Múnich, las citas del Buergeramt pueden estar reservadas con 4-6 semanas de anticipación; planificar en consecuencia o usar turnos sin cita
- **Olvidar el país de origen**: La baja, notificaciones fiscales y períodos de cancelación de seguros en el origen son tan importantes como los registros en el destino
- **Ignorar la regla fiscal de los 183 días**: Pasar más de 183 días en un país en un año calendario típicamente activa la residencia fiscal completa; coordinar la fecha de mudanza cuidadosamente
- **No llevar originales**: Muchas oficinas DACH requieren documentos originales (no copias) y algunas requieren traducciones certificadas; las copias digitales a menudo no son aceptadas
- **Tratar a Suiza como un país de la UE**: Suiza no está en la UE; aplican reglas diferentes para permisos de residencia, seguro de salud y seguridad social, incluso para nacionales de la UE
- **Perder la brecha del seguro de salud**: Entre dejar el seguro del país de origen e inscribirse en el seguro del país de destino, puede haber un período sin cobertura; contratar seguro de viaje o salud internacional para cubrir la brecha
- **Pasar por alto las regulaciones de mascotas**: Pasaportes de mascotas, títulos de rabia y reglas de importación por raza específica pueden agregar semanas al cronograma

## Habilidades Relacionadas

- `check-relocation-documents` -- verificar la completitud de documentos para cada paso burocrático
- `navigate-dach-bureaucracy` -- guía detallada para procedimientos gubernamentales específicos de DACH
