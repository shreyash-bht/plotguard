import os
import re
from pathlib import Path
from dataclasses import dataclass

import yaml
from dotenv import load_dotenv


# Project root:
# ai-service/
# ├── app/
# ├── evaluator/
# └── config/
BASE_DIR = Path(__file__).resolve().parents[2]

CONFIG_DIR = BASE_DIR / "config"

load_dotenv(BASE_DIR / ".env")


@dataclass(frozen=True)
class Settings:
    database_url: str
    ollama_base_url: str

    embedding_model: str
    embedding_interval_seconds: int

    gemini_llm_model: str
    gemini_api_key: str | None

    qwen_llm_model: str


_ENV_PATTERN = re.compile(
    r"\$\{([A-Za-z_][A-Za-z0-9_]*)(?::([^}]*))?\}"
)


def _resolve_env(value):
    """
    Resolve values such as:

        ${DATABASE_URL}
        ${DATABASE_URL:postgresql://localhost:5432/postgres}

    Environment variables take precedence over YAML defaults.
    """

    if not isinstance(value, str):
        return value

    def replace(match):
        variable_name = match.group(1)
        default_value = match.group(2)

        environment_value = os.getenv(variable_name)

        if environment_value is not None:
            return environment_value

        if default_value is not None:
            return default_value

        raise RuntimeError(
            f"Required environment variable '{variable_name}' "
            f"is not set and no default value was provided."
        )

    return _ENV_PATTERN.sub(replace, value)


def _resolve_config(config):
    """
    Recursively resolve environment variables inside
    dictionaries and lists.
    """

    if isinstance(config, dict):
        return {
            key: _resolve_config(value)
            for key, value in config.items()
        }

    if isinstance(config, list):
        return [
            _resolve_config(value)
            for value in config
        ]

    return _resolve_env(config)


def _load_yaml(profile: str) -> dict:
    config_path = CONFIG_DIR / f"{profile}.yaml"

    if not config_path.exists():
        raise FileNotFoundError(
            f"Configuration profile '{profile}' not found: "
            f"{config_path}"
        )

    with config_path.open("r", encoding="utf-8") as file:
        config = yaml.safe_load(file) or {}

    return _resolve_config(config)


def _build_settings(config: dict) -> Settings:
    return Settings(
        database_url=config["database"]["url"],
        ollama_base_url=config["ollama"]["base_url"],

        embedding_model=config["embedding"]["model"],
        embedding_interval_seconds=int(
            config["embedding"].get("interval_seconds", 0)
        ),

        gemini_llm_model=config["llm"]["gemini"]["model"],
        gemini_api_key=config["llm"]["gemini"].get("api_key"),

        qwen_llm_model=config["llm"]["qwen"]["model"],
    )


def get_settings(profile: str | None = None) -> Settings:
    """
    Load application configuration.

    Profile can be supplied explicitly:

        get_settings("local")
        get_settings("evaluator")
        get_settings("prod")

    Or through:

        APP_PROFILE=evaluator
    """

    profile = profile or os.getenv("APP_PROFILE", "local")
    config = _load_yaml(profile)
    return _build_settings(config)