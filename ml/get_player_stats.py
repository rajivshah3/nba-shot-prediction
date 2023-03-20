import pandas as pd
from time import sleep
from nba_api.stats.endpoints import commonplayerinfo, playerprofilev2
import os

TEAMS_CSV_DIR = "./data/csv/teams"

heights_not_in_api = {
    # Tyler Hansbrough
    201946: "6-9"
}

def get_height_for_player(player_row):
    id = player_row["playerid"]
    # NBA API will block the IP if we request too quickly
    # We need to wait 600ms between requests
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

def get_stats_for_player(player_row: pd.DataFrame):
    id = player_row["playerid"]
    # NBA API will block the IP if we request too quickly
    # We need to wait 600ms between requests
    # https://github.com/swar/nba_api/issues/176#issuecomment-771991604
    sleep(0.6)
    all_seasons = playerprofilev2.PlayerProfileV2(player_id=id, per_mode36="PerGame").get_normalized_dict()["SeasonTotalsRegularSeason"]
    this_season = list(filter(lambda season_stats: season_stats['SEASON_ID'] == "2015-16", all_seasons))[0]
    return this_season["PTS"], this_season["AST"], this_season["REB"]

def get_stats_for_team(team_df: pd.DataFrame):
    if "height" not in team_df.columns:
        team_df["height"] = team_df.apply(get_height_for_player, axis="columns")
    if "points" not in team_df.columns and "assists" not in team_df.columns and "rebounds" not in team_df.columns:
        team_df[["points", "assists", "rebounds"]] = team_df.apply(get_stats_for_player, axis="columns", result_type="expand")
    return team_df

for team_file in list(filter(lambda f: ".csv" in f, os.listdir(TEAMS_CSV_DIR))):
    path = f"{TEAMS_CSV_DIR}/{team_file}"
    print(path)
    team_df = pd.read_csv(path)
    team_df = get_stats_for_team(team_df)
    team_df.to_csv(path, index=False)
