---
name: deploy-shiny-app
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

Deploy a Shiny application to shinyapps.io, Posit Connect, or a Docker container.

## When to Use

- Publishing a Shiny app for external or internal users
- Moving from local development to a hosted environment
- Containerizing a Shiny app for Kubernetes or Docker deployment
- Setting up automated deployment pipelines

## Inputs

- **Required**: Path to the Shiny application
- **Required**: Deployment target (shinyapps.io, Posit Connect, or Docker)
- **Optional**: Account name and token (for shinyapps.io/Connect)
- **Optional**: Instance size preference
- **Optional**: Custom domain or URL path

## Procedure

### Step 1: Prepare the Application

Ensure the app is self-contained and deployable:

```r
# Check for missing dependencies
rsconnect::appDependencies("path/to/app")

# For golem apps, ensure DESCRIPTION lists all Imports
devtools::check()

# Verify the app runs cleanly
shiny::runApp("path/to/app")
```

Verify these files exist:
- `app.R` (or `ui.R` + `server.R`)
- `renv.lock` (recommended for reproducible deployments)
- `.Rprofile` does NOT call `mcptools::mcp_session()` in production

**Expected:** App runs locally without errors and all dependencies are captured.

**On failure:** If `appDependencies()` reports missing packages, install them and update `renv.lock`. If the app uses system libraries (e.g., gdal, curl), note them for the Docker path.

### Step 2a: Deploy to shinyapps.io

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

Store credentials in `.Renviron` (never in code):

```bash
# .Renviron
SHINYAPPS_TOKEN=your_token_here
SHINYAPPS_SECRET=your_secret_here
```

**Expected:** App deployed and accessible at `https://your-account.shinyapps.io/my-app/`.

**On failure:** If authentication fails, regenerate tokens at shinyapps.io dashboard > Account > Tokens. If package installation fails on the server, check that all packages are available on CRAN — shinyapps.io cannot install from GitHub by default.

### Step 2b: Deploy to Posit Connect

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

**Expected:** App deployed and accessible on the Posit Connect instance.

**On failure:** If the server rejects the connection, verify the API key and server URL. If packages fail to install, check that Connect has access to the required repositories (CRAN, internal CRAN-like repos).

### Step 2c: Deploy with Docker

Create a `Dockerfile`:

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

Create `shiny-server.conf`:

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

Build and run:

```bash
docker build -t myapp:latest .
docker run -p 3838:3838 myapp:latest
```

**Expected:** App accessible at `http://localhost:3838`.

**On failure:** If the build fails on package installation, add missing system libraries to the `apt-get install` line. If the app doesn't load, check Shiny Server logs: `docker exec <container> cat /var/log/shiny-server/*.log`.

### Step 3: Verify Deployment

```r
# Check the deployed URL responds
response <- httr::GET("https://your-app-url/")
httr::status_code(response)  # Should be 200

# For Docker
response <- httr::GET("http://localhost:3838/")
httr::status_code(response)
```

Manual verification checklist:
1. App loads without errors
2. All interactive elements respond
3. Data connections work in the deployed environment
4. Authentication/authorization works (if applicable)

**Expected:** App responds with HTTP 200 and all features work.

**On failure:** Check server logs for the specific deployment platform. Common issues: environment variables not set in production, database connections using localhost instead of production URLs, or file paths that only exist locally.

### Step 4: Configure Monitoring (Optional)

#### shinyapps.io

Monitor via the dashboard at `https://www.shinyapps.io/admin/#/applications`.

#### Posit Connect

```r
# Check deployment status via API
connectapi::connect(
  server = "https://connect.example.com",
  api_key = Sys.getenv("CONNECT_API_KEY")
)
```

#### Docker

Add health check to Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3838/ || exit 1
```

**Expected:** Monitoring configured for the deployment target.

**On failure:** If health checks fail intermittently, increase timeout values. Shiny apps can be slow to respond during initial load.

## Validation

- [ ] App deploys without errors
- [ ] Deployed URL responds with HTTP 200
- [ ] All interactive features work in production
- [ ] Environment variables/secrets are configured (not hardcoded)
- [ ] Credentials stored in `.Renviron` or CI secrets, not in code
- [ ] renv.lock committed for reproducible dependency resolution

## Common Pitfalls

- **Hardcoded file paths**: Replace absolute paths with `system.file()` (for package data) or environment variables (for external resources).
- **Development-only dependencies**: Don't deploy `.Rprofile` that loads `mcptools::mcp_session()` or `devtools`. Use conditional loading or separate profiles.
- **Missing system libraries in Docker**: R packages like sf, curl, and xml2 need system libraries. Add them to the Dockerfile's `apt-get install`.
- **CRAN-only packages on shinyapps.io**: shinyapps.io only installs from CRAN by default. GitHub-only packages need the `remotes` package and explicit installation in the deployment.
- **Forgotten environment variables**: Database credentials, API keys, and other secrets must be configured in the deployment environment separately from code.

## Related Skills

- `scaffold-shiny-app` — create app structure before deployment
- `create-r-dockerfile` — detailed Docker configuration for R projects
- `setup-docker-compose` — multi-container setups for Shiny with databases
- `setup-github-actions-ci` — CI/CD including automated deployment
- `optimize-shiny-performance` — performance tuning before deploying to production
