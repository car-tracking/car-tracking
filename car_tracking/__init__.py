def track(source: str, lines: list[list[float]], output: str = None):
    """
    トラッキングを実行
    """

    # 動画の読み込み

    # トラッキングする線分を設定
    for line in lines:
        [x1, y1, x2, y2] = line

    # 動画の各フレームに対して処理を実行
    print("run")
