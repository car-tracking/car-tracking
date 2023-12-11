# car-tracking

2023年度 応用プロジェクト 交通量分析

## 使い方
```
pip install -r requirements.txt
python3 main.py <SOURCE>
```

## オプション
```
実行形式
    main.py SOURCE <flags>

フラグ
    -r, --regions=REGIONS
        リージョン定義ファイルのパスを指定
        デフォルトはソースファイル名の拡張子を.jsonに置換したもの
    -o, --output=OUTPUT
        出力動画ファイルのパスを指定
        未指定時は動画を出力しない
    -n, --no_show
        リアルタイム出力をしない
```

## リージョン指定ツール
https://car-tracking.github.io/

## ライセンス
MIT