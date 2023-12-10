import numpy as np
import supervision as sv
from ultralytics import YOLO

device="mps"
model = YOLO("yolov8x.pt")
model.to(device)

SOURCE_VIDEO_PATH = "data/test5.mp4"
TARGET_VIDEO_PATH = "testresult.mp4"

#classIDと名前
CLASS_NAMES_DICT = model.model.names
#検出物の指定。car, motorcycle, bus, truck
selected_classes = [2, 3, 5, 7]

#ラインを引く座標の指定。[[start],[end]]の配列。任意長
pointlist=[[[1000,0],[1000,1500]],[[1500,0],[1500,1500]], [[500,0],[500,1500]],[[0,300],[3000,300]]]

#おまじない
sv.VideoInfo.from_video_path(SOURCE_VIDEO_PATH)
# create BYTETracker instance
byte_tracker = sv.ByteTrack(track_thresh=0.25, track_buffer=30, match_thresh=0.8, frame_rate=30)
# create VideoInfo instance
video_info = sv.VideoInfo.from_video_path(SOURCE_VIDEO_PATH)
# create frame generator
generator = sv.get_video_frames_generator(SOURCE_VIDEO_PATH)
# create instance of BoxAnnotator
box_annotator = sv.BoxAnnotator(thickness=4, text_thickness=4, text_scale=2)
# create instance of TraceAnnotator
trace_annotator = sv.TraceAnnotator(thickness=4, trace_length=50)
# create LineZoneAnnotator instance, it is previously called LineCounterAnnotator class
line_zone_annotator = sv.LineZoneAnnotator(thickness=4, text_thickness=4, text_scale=2)
#おまじないここまで

#線を詰め込んだリストを作成。任意の数・任意の点のline_annotatorを生成可能に。
line_list=[]
for i in range(len(pointlist)):
    start=pointlist[i][0]
    end=pointlist[i][1]

    LINE_START=sv.Point(start[0],start[1])
    LINE_END=sv.Point(end[0],end[1])

    #lineを生成し、listにつっこむ
    line_list.append(sv.LineZone(start=LINE_START, end=LINE_END))

# define call back function to be used in video processing
def callback(frame: np.ndarray, index:int) -> np.ndarray:
    # model prediction on single frame and conversion to supervision Detections
    results = model(frame, show=True, verbose=False)[0]
    detections = sv.Detections.from_ultralytics(results)
    # only consider class id from selected_classes define above
    detections = detections[np.isin(detections.class_id, selected_classes)]
    # tracking detections
    detections = byte_tracker.update_with_detections(detections)
    labels = [
        f"#{tracker_id} {model.model.names[class_id]} {confidence:0.2f}"
        for _, _, confidence, class_id, tracker_id
        in detections
    ]

    #annotated_frameをごちゃごちゃ加工。
    annotated_frame = trace_annotator.annotate(
        scene=frame.copy(),
        detections=detections
    )
    annotated_frame=box_annotator.annotate(
        scene=annotated_frame,
        detections=detections,
        labels=labels)
    
    #線でカウントする！
    for line_annotator in line_list:
        line_annotator.trigger(detections)
        annotated_frame=line_zone_annotator.annotate(annotated_frame, line_counter=line_annotator)

    #１フレームの画像データを返している
    return  annotated_frame

# process the whole video
sv.process_video(
    source_path = SOURCE_VIDEO_PATH,
    target_path = TARGET_VIDEO_PATH,
    callback=callback
)