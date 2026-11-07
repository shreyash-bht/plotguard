import json
from pydantic import BaseModel
from pathlib import Path
import frontmatter

SCRIPT_DIR = Path(__file__).resolve().parent.parent


class Content(BaseModel):
    content_id: str
    title: str
    content_type: str


class Season(BaseModel):
    season_id: str
    content_id: str
    season_number: int
    title: str

class StoryUnit(BaseModel):
    story_unit_id: str
    content_id: str
    season_id: str
    story_unit_text: str
    story_order: int
    unit_type: str
    unit_number: int
    title: str


def get_contents_data() -> list[Content]:
    with open(f"{SCRIPT_DIR}/resources/contents.json", "r") as file:
        data = json.load(file)
        contents = []
        for entry in data:
            contents.append(
                Content(content_id=entry["content_id"], title=entry["title"], content_type=entry["content_type"])
            )
        return contents


def get_seasons_data() -> list[Season]:
    with open(f"{SCRIPT_DIR}/resources/contents.json", "r") as file:
        data = json.load(file)
        seasons = []
        for content in data:
            for season in content["seasons"]:
                seasons.append(
                    Season(season_id=season["season_id"], content_id=content["content_id"],
                            season_number=season["season_number"], title=season["title"])
                )
        return seasons


def get_story_units_data() -> list[StoryUnit]:
    contents_dir = Path(f"{SCRIPT_DIR}/resources/contents")
    files = sorted(contents_dir.rglob("*.md"))
    story_units = []
    for file_path in files:
        data = frontmatter.load(file_path)
        metadata = data.metadata
        story_unit = StoryUnit(
            story_unit_id=metadata["story_unit_id"],
            content_id=metadata["content_id"],
            season_id=metadata["season_id"],
            story_unit_text=data.content,
            story_order=metadata["story_order"],
            unit_type=metadata["unit_type"],
            unit_number=metadata["unit_number"],
            title=metadata["episode_title"]
        )
        story_units.append(story_unit)

    return story_units