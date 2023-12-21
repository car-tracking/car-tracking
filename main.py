import fire
from pathlib import Path
import json
import car_tracking
import sys


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

    car_tracking.track(source, lines, output, no_show)

    with open(bench) as f:
        bench_file = json.load(f)
        kind = bench_file["kind"]
        data = bench_file["data"]

        if kind == "line":
            pass
        elif kind == "from_to":
            pass
        elif kind == "type":
            pass
        else:
            print("error: kind is invalid.", file=sys.stderr)
            return


if __name__ == "__main__":
    fire.Fire(cli)
