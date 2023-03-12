# NBA Shot Prediction ML


## Prerequisites
1. This requires Python 3.9 or later. You can download it from the [Python website](https://www.python.org/downloads/) or use Homebrew on macOS (`brew install python3`). If you are using Windows, you may need to use `python` instead of `python3` in the following steps
2. In the `ml` folder, run `python3 -m venv venv` to create a virtualenv
3. Run `source venv/bin/activate` to activate the virtualenv
4. Install the dependencies by running `pip3 install -r requirements.txt`

## Getting the data
Because the SportVU data is large and it takes a while to process, the partially preprocessed files are stored on S3 instead of GitHub. They are originally from [linouk/NBA-Player-Movements](https://github.com/linouk23/NBA-Player-Movements) and were partially preprocessed with [`preprocess_sportvu.py`](./preprocess_sportvu.py). To download the partially preprocessed files, run [`download_preproccessed_sportvu.py`](./download_preprocessed_sportvu.py).
