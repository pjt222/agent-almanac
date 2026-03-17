---
name: review-software-architecture
description: >
  Revisar la arquitectura de software en cuanto a acoplamiento, cohesión,
  principios SOLID, diseño de API, escalabilidad y deuda técnica. Cubre la
  evaluación a nivel de sistema, la revisión de registros de decisiones
  arquitectónicas y recomendaciones de mejora. Usar al evaluar una arquitectura
  propuesta antes de su implementación, valorar un sistema existente en cuanto
  a escalabilidad o seguridad, revisar ADRs, realizar una evaluación de deuda
  técnica, o evaluar la preparación para un escalado significativo.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: advanced
  language: multi
  tags: architecture, solid, coupling, cohesion, api-design, scalability, tech-debt, adr
---

# Revisar Arquitectura de Software

Evaluar la arquitectura de software a nivel de sistema en cuanto a atributos de calidad, adhesión a principios de diseño y mantenibilidad a largo plazo.

## Cuándo Usar

- Evaluar una arquitectura propuesta antes de comenzar la implementación
- Valorar un sistema existente en cuanto a escalabilidad, mantenibilidad o seguridad
- Revisar Registros de Decisiones Arquitectónicas (ADR) de un proyecto
- Realizar una evaluación de deuda técnica
- Evaluar si un sistema está listo para un escalado significativo o una expansión de funcionalidades
- Diferenciar de la revisión de código a nivel de línea (que se enfoca en cambios a nivel de PR)

## Entradas

- **Obligatorio**: Base de código del sistema o documentación arquitectónica (diagramas, ADRs, README)
- **Obligatorio**: Contexto sobre el propósito, la escala y las restricciones del sistema
- **Opcional**: Requisitos no funcionales (objetivos de latencia, rendimiento, disponibilidad)
- **Opcional**: Tamaño del equipo y composición de habilidades
- **Opcional**: Restricciones o preferencias tecnológicas
- **Opcional**: Puntos problemáticos conocidos o áreas de preocupación

## Procedimiento

### Paso 1: Comprender el Contexto del Sistema

Mapear los límites e interfaces del sistema:

```markdown
## Contexto del Sistema
- **Nombre**: [Nombre del sistema]
- **Propósito**: [Descripción en una línea]
- **Usuarios**: [Quién lo usa y cómo]
- **Escala**: [Solicitudes/seg, volumen de datos, número de usuarios]
- **Antigüedad**: [Años en producción, versiones principales]
- **Equipo**: [Tamaño, composición]

## Dependencias Externas
| Dependencia | Tipo | Criticidad | Notas |
|------------|------|------------|-------|
| PostgreSQL | Base de datos | Crítica | Almacén de datos principal |
| Redis | Caché | Alta | Almacén de sesiones + caché |
| Stripe | API externa | Crítica | Procesamiento de pagos |
| S3 | Almacenamiento de objetos | Alta | Subida de archivos |
```

**Esperado:** Imagen clara de qué hace el sistema y de qué depende.
**En caso de fallo:** Si falta documentación arquitectónica, derive el contexto de la estructura del código, configuraciones y archivos de despliegue.

### Paso 2: Evaluar la Calidad Estructural

#### Evaluación del Acoplamiento
Examinar cómo dependen entre sí los módulos:

- [ ] **Dirección de dependencias**: ¿Fluyen las dependencias en una dirección (en capas) o son circulares?
- [ ] **Límites de interfaz**: ¿Los módulos están conectados a través de interfaces/contratos definidos o referencias directas a implementaciones?
- [ ] **Estado compartido**: ¿Se comparte estado mutable entre módulos?
- [ ] **Acoplamiento de base de datos**: ¿Múltiples servicios leen/escriben directamente en las mismas tablas?
- [ ] **Acoplamiento temporal**: ¿Las operaciones deben ocurrir en un orden específico sin orquestación explícita?

```bash
# Detectar dependencias circulares (JavaScript/TypeScript)
npx madge --circular src/

# Detectar patrones de importación (Python)
# Buscar importaciones profundas entre paquetes
grep -r "from app\." --include="*.py" | sort | uniq -c | sort -rn | head -20
```

#### Evaluación de la Cohesión
Evaluar si cada módulo tiene una responsabilidad única y clara:

- [ ] **Nomenclatura del módulo**: ¿El nombre describe con precisión lo que hace el módulo?
- [ ] **Tamaño de archivos**: ¿Son los archivos o clases excesivamente grandes (>500 líneas sugiere múltiples responsabilidades)?
- [ ] **Frecuencia de cambios**: ¿Requieren características no relacionadas cambios en el mismo módulo?
- [ ] **Objetos dios**: ¿Hay clases/módulos de los que todo depende?

| Nivel de Acoplamiento | Descripción | Ejemplo |
|----------------------|-------------|---------|
| Bajo (bueno) | Los módulos se comunican a través de interfaces | El Servicio A llama a la API del Servicio B |
| Medio | Los módulos comparten estructuras de datos | Biblioteca compartida de DTO/modelos |
| Alto (preocupación) | Los módulos referencian los internos del otro | Acceso directo a base de datos entre módulos |
| Patológico | Los módulos modifican el estado interno del otro | Estado mutable global |

**Esperado:** Acoplamiento y cohesión evaluados con ejemplos específicos de la base de código.
**En caso de fallo:** Si la base de código es demasiado grande para revisión manual, muestree 3-5 módulos clave y los archivos con más cambios.

### Paso 3: Evaluar los Principios SOLID

| Principio | Pregunta | Señales de Alerta |
|-----------|---------|-----------------|
| **S**ingle Responsibility (Responsabilidad Única) | ¿Tiene cada clase/módulo una razón para cambiar? | Clases con >5 métodos públicos sobre preocupaciones no relacionadas |
| **O**pen/Closed (Abierto/Cerrado) | ¿Puede extenderse el comportamiento sin modificar el código existente? | Modificaciones frecuentes a clases principales para cada nueva característica |
| **L**iskov Substitution (Sustitución de Liskov) | ¿Pueden los subtipos reemplazar a sus tipos base sin romper el comportamiento? | Comprobaciones de tipo (`instanceof`) dispersas en el código consumidor |
| **I**nterface Segregation (Segregación de Interfaces) | ¿Son las interfaces enfocadas y mínimas? | Interfaces "gordas" donde los consumidores implementan métodos no utilizados |
| **D**ependency Inversion (Inversión de Dependencias) | ¿Dependen los módulos de alto nivel de abstracciones, no de detalles? | Instanciación directa de clases de infraestructura en la lógica empresarial |

```markdown
## Evaluación SOLID
| Principio | Estado | Evidencia | Impacto |
|-----------|--------|----------|---------|
| SRP | Preocupación | UserService maneja autenticación, perfil, notificaciones y facturación | Alto — cambios en facturación pueden romper la autenticación |
| OCP | Bien | Sistema de plugins para proveedores de pago | Bajo |
| LSP | Bien | No se encontraron antipatrones de comprobación de tipos | Bajo |
| ISP | Preocupación | IRepository tiene 15 métodos, la mayoría de implementadores usa 3-4 | Medio |
| DIP | Preocupación | Los controladores instancian directamente repositorios de base de datos | Medio |
```

**Esperado:** Cada principio evaluado con al menos un ejemplo específico.
**En caso de fallo:** No todos los principios aplican igualmente a cada estilo arquitectónico. Anote cuándo un principio es menos relevante (p. ej., ISP importa menos en bases de código funcionales).

### Paso 4: Revisar el Diseño de API

Para sistemas que exponen APIs (REST, GraphQL, gRPC):

- [ ] **Consistencia**: Convenciones de nomenclatura, formatos de error, patrones de paginación uniformes
- [ ] **Versionado**: Existe una estrategia y se aplica (URL, encabezado, negociación de contenido)
- [ ] **Manejo de errores**: Las respuestas de error son estructuradas, consistentes y no filtran datos internos
- [ ] **Autenticación/Autorización**: Correctamente aplicada en la capa de API
- [ ] **Limitación de velocidad**: Protección contra abuso
- [ ] **Documentación**: OpenAPI/Swagger, esquema GraphQL o definiciones protobuf mantenidas
- [ ] **Idempotencia**: Las operaciones de mutación (POST/PUT) gestionan los reintentos de forma segura

```markdown
## Revisión del Diseño de API
| Aspecto | Estado | Notas |
|---------|--------|-------|
| Consistencia de nomenclatura | Bien | Nomenclatura de recursos RESTful en todo |
| Versionado | Preocupación | Sin estrategia de versionado — los cambios disruptivos afectan a todos los clientes |
| Formato de error | Bien | RFC 7807 Problem Details usado consistentemente |
| Autenticación | Bien | JWT con ámbitos basados en roles |
| Limitación de velocidad | Ausente | Sin limitación de velocidad en ningún endpoint |
| Documentación | Preocupación | Existe especificación OpenAPI pero con 6 meses de desactualización |
```

**Esperado:** Diseño de API revisado con respecto a estándares comunes con hallazgos específicos.
**En caso de fallo:** Si no se expone ninguna API, omita este paso y enfóquese en las interfaces internas de los módulos.

### Paso 5: Evaluar Escalabilidad y Fiabilidad

- [ ] **Sin estado**: ¿Puede la aplicación escalar horizontalmente (sin estado local)?
- [ ] **Escalabilidad de base de datos**: ¿Están las consultas indexadas? ¿Es el esquema adecuado para el volumen de datos?
- [ ] **Estrategia de caché**: ¿Se aplica el caché en las capas apropiadas (base de datos, aplicación, CDN)?
- [ ] **Gestión de fallos**: ¿Qué ocurre cuando una dependencia no está disponible (interruptor de circuito, reintento, alternativa)?
- [ ] **Observabilidad**: ¿Están implementados registros, métricas y trazas?
- [ ] **Consistencia de datos**: ¿Es aceptable la consistencia eventual o se requiere consistencia fuerte?

**Esperado:** Escalabilidad y fiabilidad evaluadas en relación con los requisitos no funcionales declarados.
**En caso de fallo:** Si los requisitos no funcionales no están documentados, recomiende definirlos como primer paso.

### Paso 6: Evaluar la Deuda Técnica

```markdown
## Inventario de Deuda Técnica
| Elemento | Gravedad | Impacto | Esfuerzo Estimado | Recomendación |
|---------|---------|---------|-----------------|---------------|
| Sin migraciones de base de datos | Alta | Los cambios de esquema son manuales y propensos a errores | 1 sprint | Adoptar Alembic/Flyway |
| Suite de pruebas monolítica | Media | Las pruebas toman 45 min, los desarrolladores las omiten | 2 sprints | Dividir en unit/integration/e2e |
| Valores de configuración hardcodeados | Media | Valores específicos del entorno en código fuente | 1 sprint | Extraer a variables de entorno/servicio de configuración |
| Sin canalización CI/CD | Alta | Despliegue manual propenso a errores | 1 sprint | Configurar GitHub Actions |
```

**Esperado:** Deuda técnica catalogada con gravedad, impacto y estimaciones de esfuerzo.
**En caso de fallo:** Si el inventario de deuda es abrumador, priorice los 5 elementos principales por ratio impacto/esfuerzo.

### Paso 7: Revisar los Registros de Decisiones Arquitectónicas (ADRs)

Si existen ADRs, evaluar:
- [ ] Las decisiones tienen contexto claro (qué problema se estaba resolviendo)
- [ ] Las alternativas fueron consideradas y documentadas
- [ ] Los compromisos son explícitos
- [ ] Las decisiones siguen siendo actuales (no superadas sin documentación)
- [ ] Las nuevas decisiones significativas tienen ADRs

Si no existen ADRs, recomiende establecerlos para las decisiones clave.

### Paso 8: Redactar la Revisión Arquitectónica

```markdown
## Informe de Revisión Arquitectónica

### Resumen Ejecutivo
[2-3 oraciones: salud general, preocupaciones clave, acciones recomendadas]

### Fortalezas
1. [Fortaleza arquitectónica específica con evidencia]
2. ...

### Preocupaciones (por gravedad)

#### Críticas
1. **[Título]**: [Descripción, impacto, recomendación]

#### Mayores
1. **[Título]**: [Descripción, impacto, recomendación]

#### Menores
1. **[Título]**: [Descripción, recomendación]

### Resumen de Deuda Técnica
[Los 5 elementos de deuda principales con recomendaciones priorizadas]

### Próximos Pasos Recomendados
1. [Recomendación accionable con alcance claro]
2. ...
```

**Esperado:** El informe de revisión es accionable con recomendaciones priorizadas.
**En caso de fallo:** Si la revisión está limitada en tiempo, indique claramente qué se cubrió y qué queda sin evaluar.

## Validación

- [ ] Contexto del sistema documentado (propósito, escala, dependencias, equipo)
- [ ] Acoplamiento y cohesión evaluados con ejemplos de código específicos
- [ ] Principios SOLID evaluados donde aplica
- [ ] Diseño de API revisado (si aplica)
- [ ] Escalabilidad y fiabilidad evaluadas frente a los requisitos
- [ ] Deuda técnica catalogada y priorizada
- [ ] ADRs revisados o su ausencia anotada
- [ ] Las recomendaciones son específicas, priorizadas y accionables

## Errores Comunes

- **Revisar código en lugar de arquitectura**: Esta habilidad trata del diseño a nivel de sistema, no de la calidad del código a nivel de línea. Use `code-reviewer` para retroalimentación a nivel de PR.
- **Prescribir una tecnología específica**: Las revisiones arquitectónicas deben identificar problemas, no imponer herramientas específicas salvo que haya una razón técnica clara.
- **Ignorar el contexto del equipo**: La arquitectura "mejor" para un equipo de 3 personas difiere de la de un equipo de 30. Considere las restricciones organizacionales.
- **Perfeccionismo**: Todo sistema tiene deuda técnica. Enfóquese en la deuda que está causando dolor activamente o bloqueando trabajo futuro.
- **Asumir escala**: No recomiende sistemas distribuidos para una aplicación que sirve a 100 usuarios. Adecue la arquitectura a los requisitos reales.

## Habilidades Relacionadas

- `security-audit-codebase` — revisión de código y configuración centrada en seguridad
- `configure-git-repository` — estructura del repositorio y convenciones
- `design-serialization-schema` — diseño y evolución del esquema de datos
- `review-data-analysis` — revisión de corrección analítica (perspectiva complementaria)
