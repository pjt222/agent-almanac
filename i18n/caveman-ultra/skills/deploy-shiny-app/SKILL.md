---
name: deploy-shiny-app
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
description: >
  Deploy Shiny applications to shinyapps.io, Posit Connect, or Docker
  containers. Covers rsconnect configuration, manifest generation,
  Dockerfile creation, and deployment verification. Use when publishing a
  Shiny app for external or internal users, moving from local development to
  a hosted environment, containerizing a Shiny app for Kubernetes or Docker
  deployment, or setting up automated deployment pipelines.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: shiny
  complexity: basic
  language: R
  tags: shiny, deployment, shinyapps-io, posit-connect, docker, rsconnect
---

# Deploy Shiny App

Shiny app → shinyapps.io / Posit Connect / Docker.

## Use When

- Publish Shiny → users
- Local → hosted env
- Containerize → K8s/Docker
- Auto deploy pipelines

## In

- **Required**: App path
- **Required**: Target (shinyapps.io / Posit Connect / Docker)
- **Optional**: Account + token
- **Optional**: Instance size
- **Optional**: Custom domain/URL

## Do

### Step 1: Prep app

Self-contained + deployable:

```r
# Check for missing dependencies
rsconnect::appDependencies("path/to/app")

# For golem apps, ensure DESCRIPTION lists all Imports
devtools::check()

# Verify the app runs cleanly
shiny::runApp("path/to/app")
```

Files:
- `app.R` (or `ui.R` + `server.R`)
- `renv.lock` (recommend reproducible)
- `.Rprofile` does NOT call `mcptools::mcp_session()` in prod

→ App runs locally clean + all deps captured.

If err: `appDependencies()` missing pkgs → install + update `renv.lock`. Sys libs (gdal, curl) → note for Docker path.

### Step 2a: shinyapps.io

```r
# One-time account setup
rsconnect::setAccountInfo(
  name = "your-account",
  token = Sys.getenv("SHINYAPPS_TOKEN"),
  secret = Sys.getenv("SHINYAPPS_SECRET")
)

# Deploy
rsconnect::deployApp(
  appDir = "path/to/app",
  appName = "my-app",
  appTitle = "My Application",
  account = "your-account",
  forceUpdate = TRUE
)
```

Creds → `.Renviron` (never code):

```bash
# .Renviron
SHINYAPPS_TOKEN=your_token_here
SHINYAPPS_SECRET=your_secret_here
```

→ Deployed at `https://your-account.shinyapps.io/my-app/`.

If err: Auth fail → regen tokens at dashboard > Account > Tokens. Pkg install fail → CRAN only default, not GitHub.

### Step 2b: Posit Connect

```r
# Register server (one-time)
rsconnect::addServer(
  url = "https://connect.example.com",
  name = "production"
)

# Authenticate (one-time)
rsconnect::connectApiUser(
  account = "your-username",
  server = "production",
  apiKey = Sys.getenv("CONNECT_API_KEY")
)

# Deploy
rsconnect::deployApp(
  appDir = "path/to/app",
  appName = "my-app",
  server = "production",
  account = "your-username"
)
```

→ Deployed on Connect instance.

If err: Server rejects → verify API key + URL. Pkg install fail → check Connect repo access (CRAN, internal).

### Step 2c: Docker

`Dockerfile`:

```dockerfile
FROM rocker/shiny-verse:4.4.0

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install R packages
RUN R -e "install.packages(c('shiny', 'bslib', 'DT', 'plotly'))"

# Copy app
COPY . /srv/shiny-server/myapp/

# Configure Shiny Server
COPY shiny-server.conf /etc/shiny-server/shiny-server.conf

# Expose port
EXPOSE 3838

# Run
CMD ["/usr/bin/shiny-server"]
```

`shiny-server.conf`:

```
run_as shiny;

server {
  listen 3838;

  location / {
    site_dir /srv/shiny-server/myapp;
    log_dir /var/log/shiny-server;
    directory_index on;
  }
}
```

Build + run:

```bash
docker build -t myapp:latest .
docker run -p 3838:3838 myapp:latest
```

→ `http://localhost:3838`.

If err: Build fail on pkg install → add sys libs to `apt-get install`. App no load → `docker exec <container> cat /var/log/shiny-server/*.log`.

### Step 3: Verify

```r
# Check the deployed URL responds
response <- httr::GET("https://your-app-url/")
httr::status_code(response)  # Should be 200

# For Docker
response <- httr::GET("http://localhost:3838/")
httr::status_code(response)
```

Manual checklist:
1. Loads clean
2. Interactive els respond
3. Data conns work in prod
4. Auth works (if applicable)

→ HTTP 200 + all features work.

If err: Server logs per platform. Common: env vars not set in prod, DB conns using localhost, local-only file paths.

### Step 4: Monitoring (optional)

#### shinyapps.io

Dashboard: `https://www.shinyapps.io/admin/#/applications`.

#### Posit Connect

```r
# Check deployment status via API
connectapi::connect(
  server = "https://connect.example.com",
  api_key = Sys.getenv("CONNECT_API_KEY")
)
```

#### Docker

Health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3838/ || exit 1
```

→ Monitoring configured.

If err: Health intermittent → increase timeout. Shiny slow initial load.

## Check

- [ ] Deploys clean
- [ ] URL HTTP 200
- [ ] Interactive features work
- [ ] Env vars/secrets config'd (not hardcoded)
- [ ] Creds → `.Renviron` / CI secrets
- [ ] renv.lock committed

## Traps

- **Hardcoded paths**: → `system.file()` or env vars
- **Dev-only deps**: Don't deploy `.Rprofile` w/ `mcptools::mcp_session()` or `devtools`. Conditional load or separate profiles.
- **Missing sys libs in Docker**: sf, curl, xml2 need sys libs → `apt-get install`
- **CRAN-only on shinyapps.io**: GH pkgs need `remotes` + explicit install
- **Forgotten env vars**: DB creds, API keys config'd in deploy env separate from code

## →

- `scaffold-shiny-app` — app structure before deploy
- `create-r-dockerfile` — Docker config for R
- `setup-docker-compose` — multi-container w/ DBs
- `setup-github-actions-ci` — CI/CD auto deploy
- `optimize-shiny-performance` — perf tune pre-prod
