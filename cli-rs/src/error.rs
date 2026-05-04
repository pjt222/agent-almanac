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

    #[error("not implemented yet: {0}")]
    Todo(&'static str),
}
