---
name: add-rcpp-integration
description: >
  Rcpp- oder RcppArmadillo-Integration zu einem R-Paket fuer
  hochperformanten C++-Code hinzufuegen. Behandelt Einrichtung,
  Schreiben von C++-Funktionen, RcppExports-Generierung, Tests fuer
  kompilierten Code und Debugging. Verwenden, wenn eine R-Funktion
  zu langsam ist und Profiling einen Engpass bestaetigt, wenn eine
  Schnittstelle zu bestehenden C/C++-Bibliotheken benoetigt wird,
  oder beim Implementieren von Algorithmen (Schleifen, Rekursion,
  lineare Algebra), die von kompiliertem Code profitieren.
locale: de
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

# Rcpp-Integration hinzufuegen

C++-Code mit Rcpp fuer leistungskritische Operationen in ein R-Paket integrieren.

## Wann verwenden

- R-Funktion ist zu langsam und Profiling bestaetigt einen Engpass
- Schnittstelle zu bestehenden C/C++-Bibliotheken wird benoetigt
- Algorithmen implementieren, die von kompiliertem Code profitieren (Schleifen, Rekursion)
- RcppArmadillo fuer lineare Algebra-Operationen hinzufuegen

## Eingaben

- **Erforderlich**: Bestehendes R-Paket
- **Erforderlich**: Zu ersetzende oder zu ergaenzende R-Funktion durch C++
- **Optional**: Externe C++-Bibliothek fuer die Schnittstelle
- **Optional**: Ob RcppArmadillo verwendet werden soll (Standard: einfaches Rcpp)

## Vorgehensweise

### Schritt 1: Rcpp-Infrastruktur einrichten

```r
usethis::use_rcpp()
```

Dies:
- Erstellt `src/`-Verzeichnis
- Fuegt `Rcpp` zu LinkingTo und Imports in DESCRIPTION hinzu
- Erstellt `R/packagename-package.R` mit `@useDynLib` und `@importFrom Rcpp sourceCpp`
- Aktualisiert `.gitignore` fuer kompilierte Dateien

Fuer RcppArmadillo:

```r
usethis::use_rcpp_armadillo()
```

**Erwartet:** `src/`-Verzeichnis erstellt, DESCRIPTION mit `Rcpp` in LinkingTo und Imports aktualisiert, und `R/packagename-package.R` enthaelt `@useDynLib`-Direktive.

**Bei Fehler:** Wenn `usethis::use_rcpp()` fehlschlaegt, manuell `src/` erstellen, `LinkingTo: Rcpp` und `Imports: Rcpp` zu DESCRIPTION hinzufuegen und `#' @useDynLib packagename, .registration = TRUE` sowie `#' @importFrom Rcpp sourceCpp` zur Paket-Level-Dokumentationsdatei hinzufuegen.

### Schritt 2: C++-Funktion schreiben

`src/my_function.cpp` erstellen:

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

Fuer RcppArmadillo:

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

**Erwartet:** C++-Quelldatei existiert unter `src/my_function.cpp` mit gueltiger `// [[Rcpp::export]]`-Annotation und Roxygen-artigen `//'`-Dokumentationskommentaren.

**Bei Fehler:** Pruefen, ob die Datei `#include <Rcpp.h>` (oder `<RcppArmadillo.h>` fuer Armadillo) verwendet, dass die Export-Annotation in einer eigenen Zeile direkt oberhalb der Funktionssignatur steht und die Rueckgabetypen auf gueltige Rcpp-Typen abgebildet sind.

### Schritt 3: RcppExports generieren

```r
Rcpp::compileAttributes()
devtools::document()
```

**Erwartet:** `R/RcppExports.R` und `src/RcppExports.cpp` automatisch generiert.

**Bei Fehler:** Auf C++-Syntaxfehler pruefen. Sicherstellen, dass das `// [[Rcpp::export]]`-Tag oberhalb jeder exportierten Funktion vorhanden ist.

### Schritt 4: Kompilierung verifizieren

```r
devtools::load_all()
```

**Erwartet:** Paket kompiliert und wird ohne Fehler geladen.

**Bei Fehler:** Compiler-Ausgabe auf Fehler pruefen. Haeufige Probleme:
- Fehlende System-Header: Entwicklungsbibliotheken installieren
- Syntaxfehler: C++-Compiler-Meldungen zeigen auf die Zeile
- Fehlendes `Rcpp::depends`-Attribut fuer RcppArmadillo

### Schritt 5: Tests fuer kompilierten Code schreiben

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

**Erwartet:** Tests bestehen und bestaetigen, dass die C++-Funktion identische Ergebnisse wie das R-Aequivalent liefert und Grenzfaelle (leere Vektoren, NA-Werte) korrekt behandelt.

**Bei Fehler:** Wenn Tests bei der NA-Behandlung fehlschlagen, explizite NA-Pruefungen im C++-Code mit `NumericVector::is_na()` hinzufuegen. Wenn Tests bei leerer Eingabe fehlschlagen, am Anfang der Funktion eine Schutzklausel fuer Vektoren der Laenge Null hinzufuegen.

### Schritt 6: Bereinigungsskript hinzufuegen

`src/Makevars` erstellen:

```makefile
PKG_CXXFLAGS = -O2
```

`cleanup` im Paketstammverzeichnis erstellen (fuer CRAN):

```bash
#!/bin/sh
rm -f src/*.o src/*.so src/*.dll
```

Ausfuehrbar machen: `chmod +x cleanup`

**Erwartet:** `src/Makevars` setzt Compiler-Flags und das `cleanup`-Skript entfernt kompilierte Objekte. Beide Dateien existieren auf Paketstamm-Ebene.

**Bei Fehler:** Pruefen, ob `cleanup` Ausfuehrungs-Berechtigungen hat (`chmod +x cleanup`) und dass `Makevars` Tabs (keine Leerzeichen) fuer Einrueckungen verwendet, wenn Makefile-Regeln hinzugefuegt werden.

### Schritt 7: .Rbuildignore aktualisieren

Sicherstellen, dass kompilierte Artefakte korrekt behandelt werden:

```
^src/.*\.o$
^src/.*\.so$
^src/.*\.dll$
```

**Erwartet:** `.Rbuildignore`-Muster verhindern, dass kompilierte Objektdateien in das Paket-Tarball aufgenommen werden, waehrend Quelldateien und Makevars erhalten bleiben.

**Bei Fehler:** `devtools::check()` ausfuehren und nach Hinweisen zu unerwarteten Dateien in `src/` suchen. `.Rbuildignore`-Muster anpassen, um nur `.o`-, `.so`- und `.dll`-Dateien auszuschliessen.

## Validierung

- [ ] `devtools::load_all()` kompiliert ohne Warnungen
- [ ] Kompilierte Funktion liefert korrekte Ergebnisse
- [ ] Tests bestehen fuer Grenzfaelle (NA, leer, grosse Eingaben)
- [ ] `R CMD check` besteht ohne Kompilierungswarnungen
- [ ] RcppExports-Dateien sind generiert und eingecheckt
- [ ] Leistungsverbesserung mit Benchmarks bestaetigt

## Haeufige Stolperfallen

- **`compileAttributes()` vergessen**: RcppExports nach Aenderungen an C++-Dateien neu generieren
- **Integer-Ueberlauf**: `double` statt `int` fuer grosse numerische Werte verwenden
- **Speicherverwaltung**: Rcpp verwaltet Speicher fuer Rcpp-Typen automatisch; nicht manuell `delete` aufrufen
- **NA-Behandlung**: C++ kennt Rs NA nicht. Mit `Rcpp::NumericVector::is_na()` pruefen
- **Plattformportabilitaet**: Plattformspezifische C++-Funktionen vermeiden. Auf Windows, macOS und Linux testen.
- **Fehlendes `@useDynLib`**: Die Paket-Level-Dokumentation muss `@useDynLib packagename, .registration = TRUE` enthalten

## Verwandte Skills

- `create-r-package` - Paketeinrichtung vor dem Hinzufuegen von Rcpp
- `write-testthat-tests` - kompilierte Funktionen testen
- `setup-github-actions-ci` - CI muss C++-Toolchain haben
- `submit-to-cran` - kompilierte Pakete benoetigen zusaetzliche CRAN-Pruefungen
