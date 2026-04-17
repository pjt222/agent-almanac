---
name: shift-camouflage
description: >
  Implementar interfaces adaptativas inspiradas en la sepia — APIs polimórficas,
  comportamiento sensible al contexto, feature flags y reducción de superficie
  de ataque. Cubre evaluación ambiental, mapeo de cromatóforos, generación
  dinámica de interfaces, polimorfismo conductual y disrupción de patrones para
  sistemas que deben presentar diferentes caras a diferentes observadores. Usar
  cuando un sistema debe presentar diferentes interfaces a diferentes consumidores,
  al reducir la superficie de ataque exponiendo solo lo que cada observador
  necesita, al implementar feature flags o despliegues progresivos a nivel de
  interfaz, o al adaptar el comportamiento al contexto ambiental sin cambios
  en el núcleo.
license: MIT
allowed-tools: Read
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: morphic
  complexity: advanced
  language: natural
  tags: morphic, camouflage, polymorphism, feature-flags
  locale: es
  source_locale: en
  source_commit: a87e5e0380bbe51f65cb0662d60c10030a81f255
  translator: claude
  translation_date: "2026-03-17"
---

# Shift Camouflage

Implementar transformación adaptativa de superficie — interfaces polimórficas, comportamiento sensible al contexto y presentación dinámica — inspirada en los cromatóforos de la sepia. La superficie del sistema se adapta a su entorno mientras su núcleo permanece estable, reduciendo la superficie de ataque y optimizando la interacción con observadores diversos.

## Cuándo Usar

- Un sistema debe presentar diferentes interfaces a diferentes consumidores (versionado de API, multi-tenant, basado en roles)
- Reducir la superficie de ataque exponiendo solo lo que cada observador necesita ver
- Implementar feature flags, despliegues progresivos o pruebas A/B a nivel de interfaz
- Un sistema necesita adaptar su comportamiento al contexto ambiental sin cambios en el núcleo
- Proteger la arquitectura interna del acoplamiento externo (los observadores se acoplan a la superficie, no a la estructura)
- Complementar `adapt-architecture` cuando el cambio de superficie es suficiente y la transformación profunda es innecesaria

## Entradas

- **Requerido**: El sistema cuya superficie necesita adaptación
- **Requerido**: Los observadores/consumidores y sus diferentes necesidades de interfaz
- **Opcional**: Diseño de interfaz actual y sus limitaciones
- **Opcional**: Modelo de amenazas (qué debe ocultarse de qué observadores)
- **Opcional**: Sistema de feature flags o infraestructura de despliegue progresivo
- **Opcional**: Restricciones de rendimiento (la generación dinámica de superficie tiene sobrecarga)

## Procedimiento

### Paso 1: Mapear el Paisaje de Observadores

Identificar quién interactúa con el sistema y qué necesita ver cada observador.

1. Catalogar todos los observadores:
   - Usuarios externos (usuarios finales, consumidores de API, socios)
   - Servicios internos (microservicios, trabajos en segundo plano, herramientas de administración)
   - Adversarios (atacantes, scrapers, competidores)
   - Reguladores (auditores, verificaciones de cumplimiento)
2. Para cada observador, definir:
   - Lo que necesitan ver (superficie de interfaz requerida)
   - Lo que no deberían ver (superficie oculta)
   - Lo que esperan ver (superficie de compatibilidad — puede diferir de lo que necesitan)
   - Cómo interactúan (protocolo, frecuencia, sensibilidad)
3. Crear la matriz observador-superficie:

```
Observer-Surface Matrix:
┌──────────────┬────────────────────────┬─────────────────┬──────────────┐
│ Observer     │ Required Surface       │ Hidden Surface  │ Threat Level │
├──────────────┼────────────────────────┼─────────────────┼──────────────┤
│ End users    │ Public API v2, UI      │ Internal APIs,  │ Low          │
│              │                        │ admin endpoints │              │
├──────────────┼────────────────────────┼─────────────────┼──────────────┤
│ Partner API  │ Partner API, webhooks  │ Internal logic, │ Medium       │
│              │                        │ user data       │              │
├──────────────┼────────────────────────┼─────────────────┼──────────────┤
│ Admin tools  │ Full API, debug        │ Raw data store  │ Low          │
│              │ endpoints              │ access          │              │
├──────────────┼────────────────────────┼─────────────────┼──────────────┤
│ Adversaries  │ Nothing (minimal)      │ Everything      │ High         │
│              │                        │ possible        │              │
└──────────────┴────────────────────────┴─────────────────┴──────────────┘
```

**Esperado:** Un paisaje completo de observadores con requisitos de superficie por observador. Esto impulsa todo el diseño de camuflaje posterior.

**En caso de fallo:** Si la identificación de observadores es incompleta, comenzar con los dos extremos: el observador más privilegiado (admin) y el más restringido (adversario). Diseñar superficies para estos dos, luego interpolar para los observadores entre ellos.

### Paso 2: Diseñar el Mapeo de Cromatóforos

Crear el mapeo entre el contexto del observador y la presentación de superficie — la capa de "cromatóforos".

1. Definir señales de contexto:
   - Identidad de autenticación -> determina nivel de privilegio
   - Origen de la solicitud -> contexto geográfico, de red o de aplicación
   - Feature flags -> habilita/deshabilita elementos específicos de superficie
   - Tiempo/fase -> etapa de despliegue, horario laboral, ventanas de mantenimiento
   - Carga/salud -> el modo degradado puede presentar superficie reducida
2. Diseñar las reglas de generación de superficie:
   - Para cada combinación de señales de contexto, definir qué elementos de superficie son:
     - **Visibles**: incluidos en la respuesta/interfaz
     - **Ocultos**: excluidos completamente (ni siquiera los mensajes de error revelan su existencia)
     - **Transformados**: presentes pero modificados para este observador (esquema diferente, datos simplificados)
     - **Señuelo**: elementos de superficie deliberadamente engañosos para contextos adversariales
3. Implementar la capa de cromatóforos:
   - Un middleware/proxy delgado que se sitúa entre el sistema central y los observadores
   - Evalúa señales de contexto en cada solicitud
   - Aplica la configuración de superficie apropiada
   - Nunca modifica el comportamiento central — solo filtra y transforma la superficie

```
Chromatophore Architecture:
┌──────────────────────────────────────────────────────┐
│ Observer Request                                      │
│        │                                              │
│        ↓                                              │
│ ┌─────────────────┐                                   │
│ │ Context Extract  │ ← Auth, origin, flags, time      │
│ └────────┬────────┘                                   │
│          ↓                                            │
│ ┌─────────────────┐                                   │
│ │ Surface Select   │ ← Observer-surface matrix lookup  │
│ └────────┬────────┘                                   │
│          ↓                                            │
│ ┌─────────────────┐                                   │
│ │ Core System      │ ← Processes request normally      │
│ └────────┬────────┘                                   │
│          ↓                                            │
│ ┌─────────────────┐                                   │
│ │ Surface Filter   │ ← Remove/transform/add elements   │
│ └────────┬────────┘                                   │
│          ↓                                            │
│ Observer Response (adapted surface)                    │
└──────────────────────────────────────────────────────┘
```

**Esperado:** Un mapeo de cromatóforos que traduce el contexto del observador en configuración de superficie. El mapeo es explícito, auditable y separado de la lógica central.

**En caso de fallo:** Si el mapeo se vuelve demasiado complejo (demasiadas combinaciones de contexto), simplificar a superficies basadas en roles: definir 3-5 perfiles de superficie (público, socio, admin, interno, mínimo) y mapear cada observador a un perfil.

### Paso 3: Implementar Polimorfismo Conductual

Hacer que el comportamiento del sistema se adapte al contexto, no solo su apariencia superficial.

1. Identificar comportamientos dependientes del contexto:
   - Nivel de detalle de respuesta (verbose para admin, mínimo para público)
   - Limitación de tasa (generosa para socios, estricta para llamantes desconocidos)
   - Mensajes de error (detallados para internos, genéricos para externos)
   - Frescura de datos (tiempo real para premium, en caché para estándar)
   - Disponibilidad de funciones (completa para beta testers, solo estable para general)
2. Implementar variantes conductuales:
   - Cada variante es una ruta de comportamiento completa y probada
   - El contexto determina qué variante se ejecuta
   - Las variantes comparten lógica central pero difieren en presentación y política
3. Integración de feature flags:
   - Los feature flags controlan qué variantes conductuales están activas
   - Despliegue progresivo: exponer nuevo comportamiento a un porcentaje de observadores, incrementando con el tiempo
   - Circuit breakers: revertir automáticamente al comportamiento seguro si la nueva variante causa errores

**Esperado:** El comportamiento del sistema se adapta al contexto del observador — la misma lógica central produce respuestas apropiadas para diferentes audiencias. Los feature flags permiten el despliegue progresivo de nuevos comportamientos.

**En caso de fallo:** Si el polimorfismo conductual crea demasiadas rutas de código, consolidar a un modelo de pipeline: lógica central -> capa de política -> capa de presentación. El polimorfismo vive solo en las capas de política y presentación, manteniendo la lógica central singular.

### Paso 4: Reducir la Superficie de Ataque

Minimizar lo que los adversarios pueden observar e interactuar.

1. Aplicar el principio de superficie mínima:
   - Cada observador ve solo lo que necesita — nada más
   - Los observadores no autenticados ven la superficie mínima posible
   - Los mensajes de error nunca revelan estructura interna (sin trazas de pila, sin rutas internas, sin números de versión)
2. Implementar reducción activa de superficie:
   - Eliminar páginas por defecto, encabezados y endpoints que revelan la pila tecnológica
   - Aleatorizar características de respuesta no esenciales (jitter de temporización, orden de encabezados)
   - Deshabilitar endpoints de API no utilizados completamente (no solo ocultos — realmente desactivados)
3. Desplegar disrupción de patrones:
   - Variar características de respuesta para derrotar el fingerprinting
   - Introducir imprevisibilidad controlada en aspectos no funcionales
   - Asegurar que el comportamiento funcional permanezca determinístico mientras las características de superficie varían
4. Monitorear el reconocimiento:
   - Detectar patrones de solicitudes que sondean superficie oculta (ataques de enumeración)
   - Alertar sobre accesos repetidos a endpoints inexistentes (fuzzing de rutas)
   - Rastrear y correlacionar patrones de reconocimiento entre sesiones (ver `defend-colony`)

**Esperado:** Una superficie de ataque mínima donde los adversarios no pueden determinar fácilmente la pila tecnológica del sistema, su estructura interna o sus capacidades ocultas. Los intentos de reconocimiento son detectados y rastreados.

**En caso de fallo:** Si la reducción de superficie rompe consumidores legítimos, la matriz observador-superficie es incompleta — necesidades legítimas están siendo ocultadas. Revisar el Paso 1 y actualizar la matriz. Si la aleatorización causa problemas, reducir la aleatorización a aspectos solo no funcionales (temporización, encabezados) y mantener las respuestas funcionales determinísticas.

### Paso 5: Mantener la Coherencia de Superficie

Asegurar que la superficie dinámica permanezca consistente, depurable y mantenible.

1. Pruebas de superficie:
   - Probar cada perfil de observador explícitamente (¿admin ve la superficie admin? ¿público ve la superficie pública?)
   - Probar transiciones de superficie (¿qué pasa cuando el contexto de un observador cambia a mitad de sesión?)
   - Probar modos de falla de superficie (¿qué superficie aparece si la capa de cromatóforos falla?)
2. Documentación de superficie:
   - Documentar cada perfil de observador y su configuración de superficie
   - Documentar las señales de contexto y sus efectos en la selección de superficie
   - Mantener la documentación sincronizada con el comportamiento real (probar la documentación contra la realidad)
3. Soporte de depuración:
   - El modo admin/depuración revela qué perfil de superficie está activo y por qué
   - El logging captura qué configuración de superficie fue aplicada a cada solicitud
   - Capacidad de reproducir una solicitud a través de un perfil de superficie específico para depuración
4. Evolución de superficie:
   - Agregar nuevos elementos de superficie: agregar a los perfiles apropiados, probar, desplegar
   - Eliminar elementos de superficie: período de aviso de deprecación, luego eliminación
   - Cambiar comportamiento de superficie: controlado por feature flags, despliegue progresivo

**Esperado:** Un sistema de adaptación de superficie mantenible, testeable y bien documentado. La naturaleza dinámica no compromete la capacidad de depurar, documentar o evolucionar las interfaces.

**En caso de fallo:** Si la capa de cromatóforos se convierte en una pesadilla de depuración, agregar transparencia: cada respuesta incluye un encabezado de traza (visible solo para el perfil admin/depuración) indicando qué perfil de superficie fue aplicado y qué señales de contexto lo determinaron.

## Validación

- [ ] El paisaje de observadores está mapeado con requisitos de superficie por observador
- [ ] El mapeo de cromatóforos traduce contexto a configuración de superficie
- [ ] El polimorfismo conductual adapta respuestas al contexto del observador
- [ ] La superficie de ataque está minimizada para observadores adversariales
- [ ] Cada perfil de observador está explícitamente probado
- [ ] El modo de falla de superficie presenta un valor por defecto seguro (superficie mínima)
- [ ] El modo depuración/admin puede inspeccionar la configuración de superficie activa
- [ ] La documentación de superficie coincide con el comportamiento real

## Errores Comunes

- **Explosión de complejidad de superficie**: Demasiados perfiles de observador con demasiadas variaciones. Consolidar a un máximo de 3-5 perfiles. La mayoría de observadores encajan en categorías amplias
- **Contaminación del núcleo**: Dejar que la lógica de adaptación de superficie se filtre en la lógica de negocio central. La capa de cromatóforos debe ser separada — si estás agregando sentencias if sobre tipo de observador en código central, la arquitectura está mal
- **Seguridad solo por oscuridad**: La reducción de superficie es una capa de defensa en profundidad, no un reemplazo para controles de seguridad apropiados. Un endpoint oculto aún necesita autenticación y autorización
- **Superficies inconsistentes**: El observador A ve la versión 1 de una respuesta y el observador B ve la versión 2 — pero se supone que deben ver lo mismo. Probar superficies explícitamente y mantener la matriz observador-superficie como autoritativa
- **Olvidar la superficie de fallo**: Cuando la capa de cromatóforos misma falla, ¿qué superficie ve el observador? El valor por defecto debe ser seguro (superficie mínima) no abierto (superficie completa)

## Habilidades Relacionadas

- `assess-form` — la adaptación de superficie puede resolver presión identificada en la evaluación de forma sin requerir transformación profunda
- `adapt-architecture` — cambio estructural profundo para cuando la adaptación de superficie es insuficiente
- `repair-damage` — la adaptación de superficie puede enmascarar daño durante la reparación (con precaución — no ocultar problemas reales)
- `defend-colony` — la reducción de superficie de ataque es una capa de defensa; la detección de reconocimiento alimenta la defensa
- `coordinate-swarm` — el comportamiento sensible al contexto en sistemas distribuidos requiere adaptación de superficie coordinada
- `configure-api-gateway` — los API gateways implementan muchas funciones de la capa de cromatóforos en la práctica
- `deploy-to-kubernetes` — los servicios e ingress de Kubernetes permiten control de superficie a nivel de red
