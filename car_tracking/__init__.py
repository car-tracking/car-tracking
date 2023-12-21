import torch
from ultralytics import YOLO
import supervision as sv
from tqdm import tqdm
import cv2 as cv
import numpy as np


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

    # ラインゾーンを設定
    line_zones = [
        sv.LineZone(
            sv.Point(x2 * width, y2 * height),
            sv.Point(x1 * width, y1 * height),
        )
        for [x1, y1, x2, y2] in lines
    ]

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

    # 車両の流入・流出を記録するためのdictionary
    flow_ins = dict()
    counts = np.zeros((len(lines), len(lines)), dtype=np.int16)

    # 車種ごとのin/out
    counts_in_for_types = {class_id: np.zeros(len(lines)) for class_id in classes}
    counts_out_for_types = {class_id: np.zeros(len(lines)) for class_id in classes}

    # 動画の各フレームに対して処理を実行
    for frame in tqdm(video, total=video_info.total_frames):
        # YOLOで物体検出
        results = model(frame, classes=classes, verbose=False)[0]
        detections = sv.Detections.from_ultralytics(results)

        # Bytetrackでトラッキング
        detections = byte_tracker.update_with_detections(detections)

        # 線分を通過した車両をカウント
        for i, line_zone in enumerate(line_zones):
            flow_in, flow_out = line_zone.trigger(detections)

            # 流入車両の処理
            for detect, tracker_id, class_id in zip(
                flow_in,
                detections.tracker_id,
                detections.class_id,
            ):
                if detect:
                    flow_ins[tracker_id] = i
                    counts_in_for_types[class_id][i] += 1

            # 流出車両の処理
            for detect, tracker_id, class_id in zip(
                flow_out,
                detections.tracker_id,
                detections.class_id,
            ):
                if detect and tracker_id in flow_ins:
                    from_line = flow_ins[tracker_id]
                    to_line = i
                    counts[to_line][from_line] += 1
                if detect:
                    counts_out_for_types[class_id][i] += 1

        # アノテーション処理
        labels = [
            f"{tracker_id} {class_names[class_id]}"
            for xyxy, mask, confidence, class_id, tracker_id in detections
        ]
        frame = box_annotator.annotate(frame, detections, labels)
        frame = trace_annotator.annotate(frame, detections)
        for line_zone, line_zone_annotator in zip(line_zones, line_zone_annotators):
            line_zone_annotator.annotate(frame, line_zone)

        # draw_textでカウントを表示
        for to_line, line_zone in enumerate(line_zones):
            x1, y1, x2, y2 = lines[to_line]
            # print(lines[to_line])
            for from_line, line_zone in enumerate(line_zones):
                count = counts[to_line][from_line]
                text_anchor = sv.Point(
                    x=int(x1 * width), y=int(y1 * height) + 20 * from_line
                )
                frame = sv.draw_text(
                    scene=frame,
                    text=str(count),
                    text_padding=5,
                    text_scale=0.5,
                    text_anchor=text_anchor,
                    background_color=colors[from_line],
                )
        # (optional) リアルタイムで結果を描画する
        if not no_show:
            cv.imshow("track", frame)
            keyboard = cv.waitKey(1)
            if keyboard == "q" or keyboard == 27:  # esc
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
