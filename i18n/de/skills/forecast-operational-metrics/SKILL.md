---
name: forecast-operational-metrics
description: >
  Infrastruktur- und Anwendungsmetriken mit Prophet oder statsmodels fuer
  Kapazitaetsplanung, Kostenoptimierung und proaktive Skalierung prognostizieren.
  Vorhersagen in Grafana visualisieren und Alarme fuer prognostizierte
  Ressourcenerschoepfung einrichten. Verwenden beim Prognostizieren von
  Infrastruktur-Kapazitaetsbedarf fuer CPU, Speicher oder Festplatte, beim
  Planen von Hardware-Beschaffung fuer das naechste Quartal, beim Vorhersagen
  von Kostentrends zur Optimierung von Cloud-Ausgaben oder beim Einrichten
  proaktiver Skalierungsrichtlinien basierend auf vorhergesagter Last.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mlops
  complexity: intermediate
  language: multi
  tags: forecasting, prophet, statsmodels, capacity, time-series, grafana
  locale: de
  source_locale: en
  source_commit: a87e5e03
  translator: claude
  translation_date: "2026-03-17"
---

# Betriebsmetriken prognostizieren

Zukuenftige Ressourcennutzung und Systemmetriken fuer Kapazitaetsplanung und Kostenoptimierung vorhersagen.

> Siehe [Erweiterte Beispiele](references/EXAMPLES.md) fuer vollstaendige Konfigurationsdateien und Vorlagen.

## Wann verwenden

- Infrastruktur-Kapazitaetsbedarf prognostizieren (CPU, Speicher, Festplatte, Netzwerk)
- Hardware-/Cloud-Ressourcenbeschaffung fuer das naechste Quartal planen
- Kostentrends vorhersagen und Cloud-Ausgaben optimieren
- Proaktive Skalierungsrichtlinien basierend auf vorhergesagter Last einrichten
- Benutzerverkehr fuer Veranstaltungsplanung prognostizieren
- Datenbank-Speicherwachstum fuer Backup-Planung vorhersagen
- API-Nutzung fuer Rate-Limiting-Konfiguration schaetzen

## Eingaben

- **Erforderlich**: Historische Zeitreihenmetriken (mindestens 3-12 Monate)
- **Erforderlich**: Metriktyp (CPU, Speicher, Anfragen/Sek., Kosten usw.)
- **Erforderlich**: Prognosehorizont (Tage, Wochen oder Monate voraus)
- **Optional**: Bekannte zukuenftige Ereignisse (Deployments, Marketing-Kampagnen, Feiertage)
- **Optional**: Saisonalitaetsinformationen (taegliche, woechentliche, jaehrliche Muster)
- **Optional**: Externe Regressoren (z.B. Marketing-Ausgaben, Benutzeranmeldungen)

## Vorgehensweise

### Schritt 1: Umgebung einrichten und Daten laden

Prognosebibliotheken installieren und Zeitreihendaten vorbereiten.

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install forecasting libraries
pip install prophet statsmodels pandas numpy
pip install plotly matplotlib seaborn
pip install prometheus-api-client influxdb-client
pip install grafana-api
```

Daten mit MetricsLoader laden und vorbereiten:

```python
# forecasting/data_loader.py (abbreviated)
import pandas as pd
from datetime import datetime, timedelta

class MetricsLoader:
    def load_from_prometheus(self, query: str, lookback_days: int = 90, step: str = "1h"):
        """Load historical metrics from Prometheus."""
        # ... implementation (see EXAMPLES.md for complete code)

    def resample_and_aggregate(self, df: pd.DataFrame, freq: str = "1H"):
        """Resample time series to regular intervals."""
        # ... implementation (see EXAMPLES.md)

# Example usage
loader = MetricsLoader(prometheus_url="http://prometheus:9090")
df = loader.load_from_prometheus(
    query='avg(rate(container_cpu_usage_seconds_total[5m]))',
    lookback_days=90,
)
df_daily = loader.resample_and_aggregate(df, freq="1D")
```

Siehe [EXAMPLES.md Schritt 1](references/EXAMPLES.md#step-1-data-loading--complete-metricsloader-class) fuer die vollstaendige MetricsLoader-Implementierung.

**Erwartet:** Zeitreihendaten mit regelmaessigen Intervallen geladen, fehlende Werte gefuellt, bereit fuer Prognose.

**Bei Fehler:** Bei Datenluecken Forward-Fill oder Interpolation verwenden, sicherstellen dass der Rueckblickzeitraum ausreichend Daten hat (90+ Tage empfohlen), Zeitstempel-Zeitzonenkonsistenz verifizieren, auf Ausreisser (>5 Sigma) pruefen die Prognosen verzerren koennten.

### Schritt 2: Prophet-Prognose implementieren

Facebook Prophet fuer automatische Saisonalitaetserkennung und Prognose verwenden.

```python
# forecasting/prophet_forecaster.py (abbreviated)
from prophet import Prophet

class ProphetForecaster:
    def __init__(self, growth: str = "linear", seasonality_mode: str = "multiplicative"):
        self.growth = growth
        self.prophet_params = {
            "growth": growth,
            "seasonality_mode": seasonality_mode,
            # ... additional parameters (see EXAMPLES.md)
        }

    def fit(self, df: pd.DataFrame, regressors=None, holidays=None):
        """Train Prophet model on historical data."""
        # ... implementation (see EXAMPLES.md)

    def forecast(self, periods: int, freq: str = "D"):
        """Generate forecast for future periods."""
        # ... implementation (see EXAMPLES.md)

# Example usage
forecaster = ProphetForecaster(growth="linear", seasonality_mode="multiplicative")
forecaster.fit(df_daily)
forecast = forecaster.forecast(periods=30, freq="D")
forecaster.plot_forecast(forecast, save_path="results/cpu_forecast.png")
```

Siehe [EXAMPLES.md Schritt 2](references/EXAMPLES.md#step-2-prophet-forecasting--complete-prophetforecaster-class) fuer die vollstaendige ProphetForecaster-Implementierung.

**Erwartet:** Prognose fuer 30+ Tage voraus mit Konfidenzintervallen generiert, saisonale Muster im Komponentendiagramm erfasst, Kreuzvalidierungs-MAPE < 15%.

**Bei Fehler:** Wenn die Prognose unrealistisch aussieht, ein anderes Wachstumsmodell versuchen (linear vs. logistisch); wenn Saisonalitaet fehlt, seasonality_mode anpassen; wenn die Genauigkeit schlecht ist (<70% MAPE), mehr historische Daten oder externe Regressoren hinzufuegen; auf Datenqualitaetsprobleme pruefen.

### Schritt 3: ARIMA/SARIMAX-Prognose implementieren (Alternative)

statsmodels fuer traditionelle Zeitreihenprognose verwenden.

```python
# forecasting/arima_forecaster.py (abbreviated)
from statsmodels.tsa.statespace.sarimax import SARIMAX

class ARIMAForecaster:
    def __init__(self, order: tuple = (1, 1, 1), seasonal_order: tuple = (1, 1, 1, 7)):
        self.order = order
        self.seasonal_order = seasonal_order

    def fit(self, df: pd.DataFrame, exog=None):
        """Train SARIMAX model."""
        series = df.set_index("timestamp")["value"]
        self.model = SARIMAX(series, exog=exog, order=self.order, seasonal_order=self.seasonal_order)
        self.fitted_model = self.model.fit(disp=False)
        # ... implementation (see EXAMPLES.md)

    def forecast(self, steps: int, exog_future=None):
        """Generate forecast for future periods."""
        # ... implementation (see EXAMPLES.md)

# Auto-select parameters
best_order, best_seasonal = auto_arima(series, seasonal=True)
forecaster = ARIMAForecaster(order=best_order, seasonal_order=best_seasonal)
forecaster.fit(df_hourly)
forecast = forecaster.forecast(steps=168)  # 7 days
```

Siehe [EXAMPLES.md Schritt 3](references/EXAMPLES.md#step-3-arima-forecasting--complete-arimaforecaster-class) fuer die vollstaendige ARIMAForecaster-Implementierung und auto_arima-Funktion.

**Erwartet:** ARIMA-Modell mit optimalen Parametern angepasst, Prognose mit Konfidenzintervallen generiert, Diagnosediagramme zeigen weisses Rauschen in den Residuen.

**Bei Fehler:** Wenn das Modell nicht konvergiert, Parameter vereinfachen (p, q, P, Q reduzieren); wenn die Prognose einen falschen Trend hat, Differenzierungsordnung pruefen (d, D); wenn Residuen kein weisses Rauschen sind, mehr AR/MA-Terme hinzufuegen; sicherstellen dass Reihenlaenge >2x saisonaler Periode ist.

### Schritt 4: Kapazitaetsschwellen und Alarme identifizieren

Prognose analysieren, um vorherzusagen, wann Ressourcen erschoepft sein werden.

```python
# forecasting/capacity_planning.py (abbreviated)
from datetime import datetime

class CapacityPlanner:
    def __init__(self, capacity_limit: float, warning_threshold: float = 0.8):
        self.capacity_limit = capacity_limit
        self.warning_threshold = warning_threshold

    def find_exhaustion_date(self, forecast: pd.DataFrame):
        """Find when forecast exceeds capacity limit."""
        exceeded = forecast[forecast["yhat"] >= self.capacity_limit]
        # ... implementation (see EXAMPLES.md)

    def generate_capacity_report(self, forecast: pd.DataFrame):
        """Generate comprehensive capacity planning report."""
        # ... implementation (see EXAMPLES.md)

# Example usage
planner = CapacityPlanner(capacity_limit=1000, warning_threshold=0.8)
report = planner.generate_capacity_report(forecast)
print(f"Warning Date: {report['warning_date']}")
print(f"Exhaustion Date: {report['exhaustion_date']}")
recommendation = planner.recommend_scaling_action(report)
```

Siehe [EXAMPLES.md Schritt 4](references/EXAMPLES.md#step-4-capacity-planning--complete-capacityplanner-class) fuer die vollstaendige CapacityPlanner-Implementierung.

**Erwartet:** Bericht zeigt, wann Kapazitaetsgrenzen erreicht werden, Empfehlungen mit Dringlichkeitsstufen bereitgestellt, Wachstumsraten berechnet.

**Bei Fehler:** Wenn das Erschoepfungsdatum unrealistisch ist, capacity_limit auf Richtigkeit pruefen; wenn die Wachstumsrate zu hoch ist, auf Ausreisser in historischen Daten pruefen; nichtlineare Wachstumsmodelle fuer ausgereifte Systeme in Betracht ziehen.

### Schritt 5: Prognosen in Grafana visualisieren

Prognosedaten fuer Echtzeit-Monitoring an Grafana uebertragen.

```python
# forecasting/grafana_integration.py (abbreviated)
import requests

class GrafanaForecaster:
    def __init__(self, grafana_url: str, api_key: str, dashboard_uid: str = None):
        self.grafana_url = grafana_url.rstrip("/")
        self.api_key = api_key
        self.dashboard_uid = dashboard_uid

    def create_annotation(self, text: str, tags: list, time: datetime = None):
        """Create annotation in Grafana for forecast events."""
        # ... implementation (see EXAMPLES.md)

    def create_capacity_alert_annotation(self, capacity_report: dict):
        """Create Grafana annotation for capacity warnings."""
        # ... implementation (see EXAMPLES.md)

# Export to CSV for Grafana datasource
def export_forecast_to_csv(forecast: pd.DataFrame, output_path: str):
    """Export forecast in format compatible with Grafana CSV datasource."""
    # ... implementation (see EXAMPLES.md)

# Example usage
grafana = GrafanaForecaster(
    grafana_url="http://grafana:3000",
    api_key="YOUR_API_KEY",
    dashboard_uid="your-dashboard-uid",
)
grafana.create_capacity_alert_annotation(report)
export_forecast_to_csv(forecast, "grafana/forecasts/cpu_forecast.csv")
```

Siehe [EXAMPLES.md Schritt 5](references/EXAMPLES.md#step-5-grafana-integration--complete-grafanaforecaster-class) fuer die vollstaendige GrafanaForecaster-Implementierung.

**Erwartet:** Prognoseannotationen erscheinen in Grafana-Dashboards, Kapazitaetswarnungen als vertikale Markierungen sichtbar, Prognosedaten ueber CSV-Datenquelle zugaenglich.

**Bei Fehler:** Grafana-API-Schluessel auf korrekte Berechtigungen verifizieren, Dashboard-UID auf Richtigkeit pruefen, sicherstellen dass Zeitstempel in Millisekunden fuer Annotationen vorliegen, API vor Integration mit curl testen.

### Schritt 6: Prognosegenerierung automatisieren

Geplante Jobs einrichten, um regelmaessig Prognosen zu generieren.

```python
# forecasting/scheduler.py (abbreviated)
import schedule
import time

def generate_daily_forecast():
    """Generate forecast for all monitored metrics."""
    logger.info("Starting daily forecast generation")

    metrics_config = [
        {"name": "cpu_usage", "query": "...", "capacity_limit": 0.8, "forecast_days": 30},
        {"name": "memory_usage", "query": "...", "capacity_limit": 32, "forecast_days": 30},
        {"name": "disk_usage", "query": "...", "capacity_limit": 500, "forecast_days": 90},
    ]

    loader = MetricsLoader(prometheus_url="http://prometheus:9090")

    for metric_config in metrics_config:
        df = loader.load_from_prometheus(query=metric_config["query"], lookback_days=90)
        forecaster = ProphetForecaster()
        forecaster.fit(df)
        forecast = forecaster.forecast(periods=metric_config["forecast_days"])

        planner = CapacityPlanner(capacity_limit=metric_config["capacity_limit"])
        report = planner.generate_capacity_report(forecast)

        export_forecast_to_csv(forecast, f"grafana/forecasts/{metric_config['name']}_forecast.csv")
        # ... (see EXAMPLES.md for complete implementation)

# Schedule daily at 2 AM
schedule.every().day.at("02:00").do(generate_daily_forecast)

while True:
    schedule.run_pending()
    time.sleep(60)
```

Siehe [EXAMPLES.md Schritt 6](references/EXAMPLES.md#step-6-automation-scheduler--complete-implementation) fuer die vollstaendige Scheduler-Implementierung.

**Erwartet:** Prognosen werden taeglich fuer alle Metriken generiert, Kapazitaetsberichte protokolliert, CSV-Dateien fuer Grafana exportiert, Alarme fuer kritische Kapazitaetswarnungen gesendet.

**Bei Fehler:** Verifizieren dass der Scheduler-Prozess kontinuierlich laeuft (systemd/supervisor verwenden), Prometheus-Konnektivitaet pruefen, ausreichend Festplattenspeicher fuer Prognose-Exporte sicherstellen, Wiederholungslogik fuer voruebergehende Fehler implementieren, Monitoring fuer den Scheduler selbst einrichten.

## Validierung

- [ ] Historische Daten mit 90+ Tagen kontinuierlicher Metriken geladen
- [ ] Prophet-Prognose erfasst taegliche/woechentliche Saisonalitaet im Komponentendiagramm
- [ ] Prognose-Konfidenzintervalle enthalten 85-95% der tatsaechlichen Werte in der Validierung
- [ ] Kapazitaetserschoepfungsdaten fuer bekannte Szenarien korrekt berechnet
- [ ] ARIMA-Modellresiduen erscheinen als weisses Rauschen in Diagnosediagrammen
- [ ] Grafana-Annotationen erscheinen an prognostizierten Warn-/Erschoepfungsdaten
- [ ] Automatisierte Prognose laeuft taeglich ohne manuellen Eingriff
- [ ] Prognosegenauigkeit (MAPE) < 15% auf Validierungsdatensatz

## Haeufige Stolperfallen

- **Unzureichende historische Daten**: 3-12 Monate fuer zuverlaessige Saisonalitaetserkennung benoetigt; Prognose mit <60 Tagen vermeiden
- **Bekannte Ereignisse ignorieren**: Feiertage, Deployments, Marketing-Kampagnen verzerren Prognosen; als externe Regressoren oder Feiertage hinzufuegen
- **Uebermaessiges Vertrauen in Langzeitprognosen**: Genauigkeit verschlechtert sich jenseits von 30-90 Tagen; als Richtungshinweis verwenden, nicht als exakte Vorhersagen
- **Statische Kapazitaetsgrenzen**: Infrastruktur aendert sich im Laufe der Zeit; capacity_limit bei Ressourcenerweiterung aktualisieren
- **Anomalien prognostizieren**: Ausreisser in Trainingsdaten pflanzen sich in die Prognose fort; Daten bereinigen oder robuste Methoden verwenden
- **Modelle nicht aktualisieren**: Prognosen veralten nach Systemaenderungen; woechentlich oder nach signifikanten Architekturaenderungen neu trainieren
- **Konfidenzintervalle ignorieren**: Punktprognosen sind irrefuehrend; immer untere/obere Grenzen fuer die Planung verwenden
- **Falsche Saisonalitaetsperiode**: Taeglich fuer stuendliche Daten, woechentlich fuer taegliche Daten; Nichtubereinstimmung verursacht schlechte Prognosen

## Verwandte Skills

- `detect-anomalies-aiops` — Anomalieerkennung ergaenzt Prognose fuer proaktives Monitoring
- `plan-capacity` — Infrastruktur-Kapazitaetsplanungs-Workflows
- `build-grafana-dashboards` — Prognosen und Kapazitaetstrends visualisieren
