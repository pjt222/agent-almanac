---
name: add-rcpp-integration
description: >
  Añadir integración con Rcpp o RcppArmadillo a un paquete R para código
  C++ de alto rendimiento. Cubre la configuración, la escritura de funciones
  C++, la generación de RcppExports, las pruebas del código compilado y la
  depuración. Usar cuando una función R es demasiado lenta y la elaboración
  de perfiles confirma un cuello de botella, cuando se necesita interactuar
  con bibliotecas C/C++ existentes, o al implementar algoritmos (bucles,
  recursión, álgebra lineal) que se benefician del código compilado.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: advanced
  language: R
  tags: r, rcpp, cpp, performance, compiled-code
---

# Añadir Integración con Rcpp

Integrar código C++ en un paquete R usando Rcpp para operaciones críticas de rendimiento.

## Cuándo Usar

- La función R es demasiado lenta y la elaboración de perfiles confirma un cuello de botella
- Se necesita interactuar con bibliotecas C/C++ existentes
- Implementar algoritmos que se benefician del código compilado (bucles, recursión)
- Añadir RcppArmadillo para operaciones de álgebra lineal

## Entradas

- **Obligatorio**: Paquete R existente
- **Obligatorio**: Función R a reemplazar o complementar con C++
- **Opcional**: Biblioteca C++ externa con la que interactuar
- **Opcional**: Si usar RcppArmadillo (predeterminado: Rcpp simple)

## Procedimiento

### Paso 1: Configurar la Infraestructura de Rcpp

```r
usethis::use_rcpp()
```

Esto:
- Crea el directorio `src/`
- Añade `Rcpp` a LinkingTo e Imports en DESCRIPTION
- Crea `R/packagename-package.R` con `@useDynLib` y `@importFrom Rcpp sourceCpp`
- Actualiza `.gitignore` para los archivos compilados

Para RcppArmadillo:

```r
usethis::use_rcpp_armadillo()
```

**Esperado:** Directorio `src/` creado, DESCRIPTION actualizado con `Rcpp` en LinkingTo e Imports, y `R/packagename-package.R` contiene la directiva `@useDynLib`.

**En caso de fallo:** Si `usethis::use_rcpp()` falla, crear manualmente `src/`, añadir `LinkingTo: Rcpp` e `Imports: Rcpp` a DESCRIPTION, y añadir `#' @useDynLib packagename, .registration = TRUE` y `#' @importFrom Rcpp sourceCpp` al archivo de documentación a nivel de paquete.

### Paso 2: Escribir la Función C++

Crear `src/my_function.cpp`:

```cpp
#include <Rcpp.h>
using namespace Rcpp;

//' Compute cumulative sum efficiently
//'
//' @param x A numeric vector
//' @return A numeric vector of cumulative sums
//' @export
// [[Rcpp::export]]
NumericVector cumsum_cpp(NumericVector x) {
  int n = x.size();
  NumericVector out(n);
  out[0] = x[0];
  for (int i = 1; i < n; i++) {
    out[i] = out[i - 1] + x[i];
  }
  return out;
}
```

Para RcppArmadillo:

```cpp
#include <RcppArmadillo.h>
// [[Rcpp::depends(RcppArmadillo)]]

//' Matrix multiplication using Armadillo
//'
//' @param A A numeric matrix
//' @param B A numeric matrix
//' @return The matrix product A * B
//' @export
// [[Rcpp::export]]
arma::mat mat_mult(const arma::mat& A, const arma::mat& B) {
  return A * B;
}
```

**Esperado:** Archivo fuente C++ en `src/my_function.cpp` con anotación `// [[Rcpp::export]]` válida y comentarios de documentación estilo roxygen `//'`.

**En caso de fallo:** Verificar que el archivo usa `#include <Rcpp.h>` (o `<RcppArmadillo.h>` para Armadillo), que la anotación de exportación está en su propia línea directamente encima de la firma de la función, y que los tipos de retorno se corresponden con tipos válidos de Rcpp.

### Paso 3: Generar RcppExports

```r
Rcpp::compileAttributes()
devtools::document()
```

**Esperado:** `R/RcppExports.R` y `src/RcppExports.cpp` generados automáticamente.

**En caso de fallo:** Revisar los errores de sintaxis C++. Asegurarse de que la etiqueta `// [[Rcpp::export]]` está presente encima de cada función exportada.

### Paso 4: Verificar la Compilación

```r
devtools::load_all()
```

**Esperado:** El paquete compila y carga sin errores.

**En caso de fallo:** Revisar la salida del compilador para detectar errores. Problemas frecuentes:
- Cabeceras de sistema faltantes: Instalar las bibliotecas de desarrollo
- Errores de sintaxis: Los mensajes del compilador C++ apuntan a la línea
- Falta el atributo `Rcpp::depends` para RcppArmadillo

### Paso 5: Escribir Pruebas para el Código Compilado

```r
test_that("cumsum_cpp matches base R", {
  x <- c(1, 2, 3, 4, 5)
  expect_equal(cumsum_cpp(x), cumsum(x))
})

test_that("cumsum_cpp handles edge cases", {
  expect_equal(cumsum_cpp(numeric(0)), numeric(0))
  expect_equal(cumsum_cpp(c(NA_real_, 1)), c(NA_real_, NA_real_))
})
```

**Esperado:** Las pruebas pasan, confirmando que la función C++ produce resultados idénticos al equivalente R y gestiona los casos límite (vectores vacíos, valores NA) correctamente.

**En caso de fallo:** Si las pruebas fallan con la gestión de NA, añadir comprobaciones explícitas de NA en el código C++ usando `NumericVector::is_na()`. Si las pruebas fallan con entrada vacía, añadir una cláusula de guarda para vectores de longitud cero al inicio de la función.

### Paso 6: Añadir Script de Limpieza

Crear `src/Makevars`:

```makefile
PKG_CXXFLAGS = -O2
```

Crear `cleanup` en la raíz del paquete (para CRAN):

```bash
#!/bin/sh
rm -f src/*.o src/*.so src/*.dll
```

Hacer ejecutable: `chmod +x cleanup`

**Esperado:** `src/Makevars` establece los indicadores del compilador y el script `cleanup` elimina los objetos compilados. Ambos archivos existen en el nivel raíz del paquete.

**En caso de fallo:** Verificar que `cleanup` tiene permisos de ejecución (`chmod +x cleanup`) y que `Makevars` usa tabulaciones (no espacios) para la sangría si se añaden reglas estilo Makefile.

### Paso 7: Actualizar .Rbuildignore

Asegurarse de que los artefactos compilados se gestionan correctamente:

```
^src/.*\.o$
^src/.*\.so$
^src/.*\.dll$
```

**Esperado:** Los patrones de `.Rbuildignore` evitan que los archivos objeto compilados se incluyan en el tarball del paquete, preservando los archivos fuente y Makevars.

**En caso de fallo:** Ejecutar `devtools::check()` y buscar NOTEs sobre archivos inesperados en `src/`. Ajustar los patrones de `.Rbuildignore` para excluir solo los archivos `.o`, `.so` y `.dll`.

## Validación

- [ ] `devtools::load_all()` compila sin advertencias
- [ ] La función compilada produce resultados correctos
- [ ] Las pruebas pasan para casos límite (NA, vacío, entradas grandes)
- [ ] `R CMD check` pasa sin advertencias de compilación
- [ ] Los archivos RcppExports están generados y confirmados
- [ ] La mejora de rendimiento se confirma con benchmarks

## Errores Comunes

- **Olvidar `compileAttributes()`**: Hay que regenerar RcppExports tras modificar archivos C++
- **Desbordamiento de enteros**: Usar `double` en lugar de `int` para valores numéricos grandes
- **Gestión de memoria**: Rcpp gestiona la memoria automáticamente para los tipos Rcpp; no usar `delete` manualmente
- **Gestión de NA**: C++ no conoce los NA de R. Comprobar con `Rcpp::NumericVector::is_na()`
- **Portabilidad entre plataformas**: Evitar características C++ específicas de una plataforma. Probar en Windows, macOS y Linux.
- **Falta `@useDynLib`**: La documentación a nivel de paquete debe incluir `@useDynLib packagename, .registration = TRUE`

## Habilidades Relacionadas

- `create-r-package` - configuración del paquete antes de añadir Rcpp
- `write-testthat-tests` - probar las funciones compiladas
- `setup-github-actions-ci` - CI debe tener la cadena de herramientas C++
- `submit-to-cran` - los paquetes compilados necesitan verificaciones adicionales de CRAN
