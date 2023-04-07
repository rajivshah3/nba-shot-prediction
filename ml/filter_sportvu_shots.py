from time import sleep
import pandas as pd
from nba_api.stats.endpoints import playbyplayv2
from nba_api.stats.library.eventmsgtype import EventMsgType
import os

SPORTVU_VALIDATED_PARQUET_DIR = "./data/parquet/sportvu-validated"
SPORTVU_FILTERED_PARQUET_DIR = "./data/parquet/sportvu-filtered"


for game_file in list(filter(lambda f: ".parquet" in f, os.listdir(SPORTVU_VALIDATED_PARQUET_DIR))):
    sleep(0.6)
    path = f"{SPORTVU_VALIDATED_PARQUET_DIR}/{game_file}"
    print(path)
    game_df = pd.read_parquet(path)
    game_df = game_df.reset_index(drop=True)
    pbp = playbyplayv2.PlayByPlayV2(game_id=game_file.removesuffix(".parquet"))
    pbp_df: pd.DataFrame = pbp.get_data_frames()[0]
    # Remove everything besides shots
    pbp_df = pbp_df[pbp_df["EVENTMSGTYPE"].isin([EventMsgType.FIELD_GOAL_MADE.value, EventMsgType.FIELD_GOAL_MISSED.value])]
    # Remove all non-shot events from the SportVU data
    game_df = game_df[game_df["event_id"].isin(pbp_df["EVENTNUM"])]
    game_df.reset_index(drop=True)
    game_df.to_parquet(f"{SPORTVU_FILTERED_PARQUET_DIR}/{game_file}")
