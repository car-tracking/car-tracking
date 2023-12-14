import torch
from ultralytics import YOLO
import supervision as sv
from tqdm import tqdm
import cv2 as cv


def track(
    source: str,
    lines: list[list[float]],
    output: str = None,
    no_show: bool = False,
):
    """
    トラッキングを実行
    """

    # 動画の読み込み
    video = sv.get_video_frames_generator(source)
    video_info = sv.VideoInfo.from_video_path(source)
    (width, height) = video_info.resolution_wh

    # モデルの初期化
    model = create_yolo_model()
    byte_tracker = sv.ByteTrack(frame_rate=video_info.fps)
    classes = [2, 3, 5, 7]
    class_names = model.model.names
    num_classes = len(classes)

    # ラインゾーンを設定
    line_zones = [
        sv.LineZone(
            sv.Point(x2 * width, y2 * height),
            sv.Point(x1 * width, y1 * height),
        )
        for [x1, y1, x2, y2] in lines
    ]

    num_lines = len(line_zones)

    # 線を越えた数を格納するリスト
    inout_num = []
    # 線を越えた数を車種別に格納するリスト
    inout_class_num = []

    for i in range(num_lines):
        inout_num.append([0, 0])
        inout_class_num.append([])
        for j in range(num_classes):
            inout_class_num[i].append([0, 0])

    # アノテーターの設定
    colors = sv.ColorPalette.default().colors
    box_annotator = sv.BoxAnnotator(thickness=1, text_scale=0.25, text_padding=5)
    trace_annotator = sv.TraceAnnotator(trace_length=30)
    line_zone_annotators = [
        sv.LineZoneAnnotator(
            color=colors[i], text_scale=0.4, text_thickness=1, text_padding=5
        )
        for i, _ in enumerate(lines)
    ]

    # (optional) 結果の出力先ファイルを作成
    if output is not None:
        codec = cv.VideoWriter_fourcc(*"X264")
        writer = cv.VideoWriter(output, codec, video_info.fps, video_info.resolution_wh)

    # 動画の各フレームに対して処理を実行
    for frame in tqdm(video, total=video_info.total_frames):
        # YOLOで物体検出
        results = model(frame, classes=classes, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(results)

        # Bytetrackでトラッキング
        detections = byte_tracker.update_with_detections(detections)

        count = 0
        # 線分を通過した車両をカウント
        for line_zone, line_zone_annotator in zip(line_zones, line_zone_annotators):
            cross_in, cross_out = line_zone.trigger(detections)
            if inout_num[count][0] != line_zone.in_count:
                inout_num[count][0] = line_zone.in_count

            if inout_num[count][1] != line_zone.out_count:
                inout_num[count][1] = line_zone.out_count

            # class:numpy.ndarray
            class_ids = detections.class_id
            tracker_ids = detections.tracker_id

            n = len(class_ids)

            for k in range(n):
                if class_ids[k] in classes:
                    if cross_in[k]:
                        key = classes.index(class_ids[k])
                        inout_class_num[count][key][0] += 1
                    if cross_out[k]:
                        key = classes.index(class_ids[k])
                        inout_class_num[count][key][1] += 1

            count += 1
            count %= num_lines

            print(inout_num)
            print(inout_class_num)

        # アノテーション処理
        labels = [
            f"{tracker_id} {class_names[class_id]}"
            for xyxy, mask, confidence, class_id, tracker_id in detections
        ]
        frame = box_annotator.annotate(frame, detections, labels)
        frame = trace_annotator.annotate(frame, detections)

        for line_zone, line_zone_annotator in zip(line_zones, line_zone_annotators):
            line_zone_annotator.annotate(frame, line_zone)

        # (optional) リアルタイムで結果を描画する
        if not no_show:
            cv.imshow("track", frame)
            keyboard = cv.waitKey(1)
            if keyboard == "q" or keyboard == 27:
                break

        # (optional) 動画を書き出し
        if output is not None:
            writer.write(frame)

    # (optional) 出力ファイルの開放
    if output:
        writer.release()


def create_yolo_model() -> YOLO:
    """YOLOモデルの作成"""

    # GPUが使用可能ならGPUを使用
    device = torch.device("cpu")
    if torch.backends.mps.is_available():
        device = torch.device("mps")
    elif torch.cuda.is_available():
        device = torch.device("cuda")

    model = YOLO("yolov8m.pt")
    model.fuse()
    model.to(device)

    return model
