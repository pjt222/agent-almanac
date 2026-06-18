use thiserror::Error;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, Error)]
pub enum Error {
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),

    #[error("yaml parse error: {0}")]
    Yaml(#[from] serde_yaml::Error),

    #[error("json error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("registry not found: {0}")]
    RegistryNotFound(String),

    #[error("content root not found; pass --root or set AGENT_ALMANAC_ROOT")]
    RootNotFound,

    #[error("unknown {0}")]
    UnknownItem(String),

    #[error("invalid item id `{0}`: must be a single path component (no `/`, `\\`, `..`, or absolute path)")]
    InvalidId(String),

    #[error("framework `{0}` does not support bundling")]
    BundleUnsupported(String),

    #[error("the `{0}` fire is not burning; nothing to scatter")]
    FireNotBurning(String),

    #[error("no `agent-almanac.yml` found; run `init` first")]
    ManifestMissing,

    #[error("not implemented yet: {0}")]
    Todo(&'static str),
}
