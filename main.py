import fire
from pathlib import Path
import json
import car_tracking


def cli(source: str, regions: str = None, output: str = None):
    if regions is None:
        regions = Path(source).with_suffix(".json")

    with open(regions) as f:
        lines: list[list[float]] = json.load(f)

    car_tracking.track(source, lines, output)


if __name__ == "__main__":
    fire.Fire(cli)
