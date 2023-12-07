from ultralytics import YOLO

source='data/blackcar.jpg'
model=YOLO('yolov8x.pt')

results=model.predict(source, save=True, imgsz=320,conf=0.5)
