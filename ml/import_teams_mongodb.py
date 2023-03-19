from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pymongo.operations import ReplaceOne
from pprint import pprint
import pandas as pd
import os

MONGODB_USERNAME = ""
MONGODB_PASSWORD = ""
TEAMS_CSV_DIR = "./data/csv/teams"

try:
    MONGODB_USERNAME = os.environ["MONGODB_USERNAME"]
    MONGODB_PASSWORD = os.environ["MONGODB_PASSWORD"]
except KeyError:
    raise KeyError("MONGODB_USERNAME or MONGODB_PASSWORD environment variables not set")

connection_string = f"mongodb+srv://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@cluster0.mepcupu.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(connection_string, server_api=ServerApi('1'))
db = client.nbadb
collection = db.teams

def transform_team_data(df: pd.DataFrame):
    # Pick out the attributes for the entire team
    team_abbrev = df["abbreviation"][0]
    team_name = df["name"][0]
    # BSON won't encode numpy int64s
    team_id = int(df["teamid"][0])
    # The rest are player-specific
    players = df.drop(["abbreviation", "name", "teamid"], axis="columns")
    players["playerid"] = players["playerid"].astype("string")
    players.set_index("playerid", inplace=True)
    team_data = {
        "abbreviation": team_abbrev,
        "name": team_name,
        "team_id": team_id,
        "players": players.to_dict("index"),
    }
    return team_data


operations = []

for team_file in list(filter(lambda f: ".csv" in f, os.listdir(TEAMS_CSV_DIR))):
    path = f"{TEAMS_CSV_DIR}/{team_file}"
    print(path)
    team_df = pd.read_csv(path)
    team_data = transform_team_data(team_df)
    op = ReplaceOne({ "abbreviation": team_file.removesuffix(".csv") }, team_data, upsert=True)
    operations.append(op)

result = collection.bulk_write(operations, ordered=False)
pprint(result.bulk_api_result)
