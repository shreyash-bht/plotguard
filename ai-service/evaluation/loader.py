import pandas as pd
from pydantic import BaseModel
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent


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
    title: str



def get_contents_data() -> list[Content]:
    df = pd.read_csv(f"{SCRIPT_DIR}/resources/contents.csv")
    contents = []
    for row in df.itertuples():
        contents.append(
            Content(content_id=row[2], title=row[3], content_type=row[4])
        )
    print(contents)
    return contents


def get_seasons_data() -> list[Season]:
    df = pd.read_csv(f"{SCRIPT_DIR}/resources/seasons.csv")
    seasons = []
    for row in df.itertuples():
        seasons.append(
            Season(season_id=row[2], content_id=row[3], season_number=row[4], title=row[5])
        )
    print(seasons)
    return seasons


def get_story_units_data() -> list[StoryUnit]:
    df = pd.read_csv(f"{SCRIPT_DIR}/resources/story_units.csv")
    story_units = []
    for row in df.itertuples():
        story_units.append(
            StoryUnit(story_unit_id=row[2], content_id=row[3], season_id=row[4], story_unit_text=row[5], story_order=row[6],
                      unit_type=row[7], title=row[8])
        )
    return story_units


