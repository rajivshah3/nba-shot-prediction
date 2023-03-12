from pyunpack import Archive
import pandas as pd
import os
import shutil
import json
import simdjson
import time

SPORTVU_RAW_DIR = "./data/raw/sportvu"
SPORTVU_UNZIPPED_DIR = "./data/unzipped/sportvu"
SPORTVU_PARQUET_DIR = "./data/parquet/sportvu"
SPORTVU_CSV_DIR = "./data/csv/sportvu"

# Surprisngly, parquet files are bigger than CSVs for teams
TEAMS_CSV_DIR = "./data/csv/teams"

def preprocess_sportvu_file(file, csv=False):
    new_file_name = file.removeprefix("2016.NBA.Raw.SportVU.Game.Logs").removesuffix('.7z').replace('.', '_')
    folder_path = f"{SPORTVU_UNZIPPED_DIR}/{new_file_name}"
    os.makedirs(folder_path)
    Archive(f"{SPORTVU_RAW_DIR}/{file}").extractall(folder_path)

    if len(os.listdir(folder_path)) == 0:
        return None

    json_file = os.listdir(folder_path)[0]
    print(f"{folder_path}/{json_file}")
    f = open(f"{folder_path}/{json_file}")
    start_time = time.perf_counter()
    json_data = simdjson.load(f)
    f.close()
    df = pd.read_json(simdjson.dumps(json_data["events"]))

    home_team = pd.DataFrame(df.iloc[0]["home"])
    home_team = pd.concat([home_team.drop("players", axis="columns"), home_team["players"].apply(pd.Series)], axis="columns")
    home_team = home_team.convert_dtypes()
    visitor_team = pd.DataFrame(df.iloc[0]["visitor"])
    visitor_team = pd.concat([visitor_team.drop("players", axis="columns"), visitor_team["players"].apply(pd.Series)], axis="columns")
    visitor_team = visitor_team.convert_dtypes()
    df = df.drop(["home", "visitor"], axis="columns")
    
    home_team_abbrev = home_team["abbreviation"][0]
    visitor_team_abbrev = visitor_team["abbreviation"][0]
    if not os.path.exists(f"{TEAMS_CSV_DIR}/{home_team_abbrev}.csv"):
        home_team.to_csv(f"{TEAMS_CSV_DIR}/{home_team_abbrev}.csv", index=False)

    if not os.path.exists(f"{TEAMS_CSV_DIR}/{visitor_team_abbrev}.csv"):
        visitor_team.to_csv(f"{TEAMS_CSV_DIR}/{visitor_team_abbrev}.csv", index=False)

    # Based on https://github.com/gmf05/nba/blob/master/scripts/py/sloan1.py
    # Added workarounds where data is malformed
    # Can we vectorize/batch for better performance?
    def process_moment(moment_input):
        event_id = moment_input["eventId"]
        moment = moment_input["moments"]
        period, moment_id, sec_remain, shotclock_remain  = moment[0:4]
        # Rare instances where ball or player coordinates aren't there, not sure why
        ball_present = False
        players_present = False
        ball_x, ball_y, ball_z = (pd.NA, pd.NA, pd.NA)
        if moment[-1][0][0] == -1:
            ball_present = True
            ball_x, ball_y, ball_z = moment[-1][0][2:5]
        player_id = [0] * 10
        player_x = [0] * 10
        player_y = [0] * 10
        if len(moment[-1]) > 1:
            players_present = True
        if players_present:
            for i in range(len(moment[-1]) - 1):
                # Loop over players
                if ball_present:
                    player_id[i] = moment[-1][i + 1][1] # +1 bc ball is row 0!
                    player_x[i], player_y[i] = moment[-1][i + 1][2:4] # +1 bc ball is row 0!
                else:
                    player_id[i] = moment[-1][i][1]
                    player_x[i], player_y[i] = moment[-1][i][2:4]
        
        moment_output = {
            "event_id": event_id,
            "period": period,
            "moment_id": moment_id,
            "sec_remain": sec_remain,
            "shotclock_remain": shotclock_remain,
            "ball_x": ball_x,
            "ball_y": ball_y,
            "ball_z": ball_z,
            "player_id": player_id,
            "player_x": player_x,
            "player_y": player_y,
        }
        return pd.Series(moment_output)

    df = df.explode("moments", ignore_index=True)
    # No clue how NAs got here
    df = df.dropna()
    # Downsample by 5
    df = df.iloc[range(0, len(df.index), 5)]
    df = df.apply(process_moment, axis="columns")
    end_time = time.perf_counter()

    game_id = json_file.removesuffix(".json")
    df.to_parquet(f"{SPORTVU_PARQUET_DIR}/{game_id}.parquet")
    if csv:
        df.to_csv(f"{SPORTVU_CSV_DIR}/{game_id}.csv", index=False)
    shutil.rmtree(folder_path)
    print(f"Finished {game_id} in {end_time - start_time} sec")


# files = list(filter(lambda f: ".7z" in f, os.listdir(SPORTVU_RAW_DIR)))
# for file in files[:5]:
#     preprocess_sportvu_file(file, True)
