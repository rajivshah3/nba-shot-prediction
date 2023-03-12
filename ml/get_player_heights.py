import pandas as pd
from time import sleep
from nba_api.stats.endpoints import commonplayerinfo
import os

TEAMS_CSV_DIR = "./data/csv/teams"

heights_not_in_api = {
    # Tyler Hansbrough
    201946: "6-9"
}

def get_height_for_player(player_row):
    id = player_row["playerid"]
    # NBA API will block the IP if we request too quickly
    # https://github.com/swar/nba_api/issues/176#issuecomment-771991604
    sleep(0.6)
    player_info = commonplayerinfo.CommonPlayerInfo(player_id=id)
    height_str = player_info.get_normalized_dict()["CommonPlayerInfo"][0]["HEIGHT"]
    if height_str.strip() == "":
        if id in heights_not_in_api:
            height_str = heights_not_in_api[id]
        else:
            raise ValueError(f"No height info for player {id}")
    height_ft, height_in = height_str.split("-")
    height = int(height_ft) * 12 + int(height_in)
    return height

def get_heights_for_team(team_df: pd.DataFrame):
    if "height" not in team_df.columns:
        team_df["height"] = team_df.apply(get_height_for_player, axis="columns")
    return team_df

for team_file in list(filter(lambda f: ".csv" in f, os.listdir(TEAMS_CSV_DIR))):
    path = f"{TEAMS_CSV_DIR}/{team_file}"
    print(path)
    team_df = pd.read_csv(path)
    team_df = get_heights_for_team(team_df)
    team_df.to_csv(path, index=False)
