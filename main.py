import fire
from pathlib import Path
import json
import car_tracking
import sys
import numpy as np


def cli(
    source: str,
    regions: str = None,
    output: str = None,
    no_show: bool = False,
    bench: str = None,
):
    if regions is None:
        regions = Path(source).with_suffix(".json")

    with open(regions) as f:
        lines: list[list[float]] = json.load(f)

    if bench is not None:
        with open(bench) as f:
            bench = json.load(f)

    car_tracking.track(source, lines, output, no_show, bench)


if __name__ == "__main__":
    fire.Fire(cli)
