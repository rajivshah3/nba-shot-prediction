import pandas as pd
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pymongo.operations import ReplaceOne
from pprint import pprint
import os

MONGODB_USERNAME = ""
MONGODB_PASSWORD = ""

SPORTVU_PARQUET_DIR = "./data/parquet/sportvu-filtered"

try:
    MONGODB_USERNAME = os.environ["MONGODB_USERNAME"]
    MONGODB_PASSWORD = os.environ["MONGODB_PASSWORD"]
except KeyError:
    raise KeyError("MONGODB_USERNAME or MONGODB_PASSWORD environment variables not set")

connection_string = f"mongodb+srv://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@cluster0.mepcupu.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(connection_string, server_api=ServerApi('1'))
db = client.nbadb
collection = db.gamesEvents

def transform_lists_in_records(record: dict):
    columns = ["player_id", "player_x", "player_y"]
    for key, value in record.items():
        if key in columns:
            record[key] = value.tolist()
    return record


def transform_game_data(game_id, df: pd.DataFrame):
    ops = []
    events = df.set_index("event_id").groupby("event_id")
    for event_id, group in events:
        group.drop(["period", "moment_id"], axis="columns", inplace=True)
        doc = ({
            "game_id": game_id,
            "event_id": event_id,
            "movements": [transform_lists_in_records(record) for record in group.to_dict("records")]
        })
        ops.append(ReplaceOne({ "game_id": game_id, "event_id": event_id }, doc, upsert=True))
    
    return ops

for game_file in list(filter(lambda f: ".parquet" in f, os.listdir(SPORTVU_PARQUET_DIR))):
    path = f"{SPORTVU_PARQUET_DIR}/{game_file}"
    print(path)
    game_df = pd.read_parquet(path)
    game_df = game_df.reset_index(drop=True)
    game_ops = transform_game_data(game_file.removesuffix(".parquet"), game_df)

    result = collection.bulk_write(game_ops, ordered=False)
    pprint(result.bulk_api_result)
