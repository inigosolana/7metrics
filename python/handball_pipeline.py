import os
import cv2
import numpy as np
import pandas as pd
import json
import argparse
import sys
from collections import deque

# Suppress TensorFlow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

# Lazy imports to speed up CLI response/help
# try:
#     from ultralytics import YOLO
# except ImportError:
#     ...

# from moviepy.video.io.VideoFileClip import VideoFileClip


# --- Configuration ---
# Models should be placed in python/models/
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
YOLO_MODEL_NAME = 'best.pt' # Or 'yolov8n.pt' if custom not available
LRCN_MODEL_NAME = 'lcrn_model.h5' # User must rename their downloaded file to this or update code

# Constants from thesis repo
SEQUENCE_LENGTH = 20
IMAGE_HEIGHT, IMAGE_WIDTH = 64, 64
CLASSES_LIST = ["jump-shot", "dribbling", "shot", "defence", "passing"]
CONFIDENCE_THRESHOLD = 0.5
PLAYER_CLASS_ID = 0 # YOLOv8 'person' class is 0. Thesis used 2? Let's assume standard COCO/YOLOv8 is 0.

def load_models():
    """Load YOLO and LRCN models."""
    # Lazy imports
    import sys
    sys.stderr.write("Importing libraries...\n")
    try:
        from ultralytics import YOLO
        import tensorflow as tf
        from tensorflow.keras.models import load_model # type: ignore
    except ImportError as e:
        sys.stderr.write(f"Import Error: {e}\n")
        raise e

    yolo_path = os.path.join(MODEL_DIR, YOLO_MODEL_NAME)
    lrcn_path = os.path.join(MODEL_DIR, LRCN_MODEL_NAME)
    
    # Fallback for YOLO
    if not os.path.exists(yolo_path):
        # sys.stderr.write(f"Warning: Custom YOLO model not found at {yolo_path}. Using yolov8n.pt\n")
        yolo_path = 'yolov8n.pt'
        
    yolo = YOLO(yolo_path)
    
    # LRCN is critical
    if not os.path.exists(lrcn_path):
        # Try to find any .h5 file in models dir
        h5_files = [f for f in os.listdir(MODEL_DIR) if f.endswith('.h5')]
        if h5_files:
            lrcn_path = os.path.join(MODEL_DIR, h5_files[0])
        else:
            raise FileNotFoundError(f"LRCN model not found in {MODEL_DIR}. Please download it.")

    lrcn = load_model(lrcn_path, compile=False) # compile=False avoids optimizer warning/error if mismatch
    
    return yolo, lrcn

def extract_sequences_and_predict(video_path, yolo_model, lrcn_model, progress_callback=None):
    """
    Main pipeline:
    1. Detect/Track persons
    2. Extract sequences for active persons
    3. Run action classification
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Could not open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    # We will process in chunks or sliding windows
    # For simplicity in this v1, we'll try to find 'action segments' based on motion/detection
    # and then classify them. Alternatively, we frame-skip and classify every N seconds.
    
    # The thesis approach tracks players and extracts sequences per track.
    # That is computationally expensive for a web-demo without GPU.
    # Let's try a simplified approach:
    # 1. Detect person with ball (or just persons)
    # 2. If 'enough' motion, grab a sequence of 20 frames centered on the person
    # 3. Classify
    
    # Simpler approach matching 'predict.py' from thesis:
    # The thesis `predict.py` assumes ALREADY CROPPED sequences.
    # The `detect_track_crop_scenes.py` does the heavy lifting.
    # We need to reimplement a light version of `detect_track_crop_scenes.py`.
    
    events = []
    
    # Tracking state
    # We will use YOLOv8 built-in tracking
    
    # Processing parameters
    SKIP_FRAMES = 2 # Process every 2nd frame for tracking to save time? 
                    # Actually for simple tracking we need continuous frames or byte tracker gets lost.
                    # We'll use skip=0 (process all) but maybe resize frame.
    
    frames_buffer = deque(maxlen=SEQUENCE_LENGTH)
    
    # To avoid analyzing every single frame with the heavy LRCN,
    # we'll run YOLO to track, and collects crops.
    # Only if we have a valid 20-frame sequence for a track do we classify.
    
    # Tracks: { track_id: [ (frame_img, box), ... ] }
    tracks_buffer = {} 
    
    frame_idx = 0
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        # Optional: resize for speed
        # frame = cv2.resize(frame, (640, 640)) 
        
        # Run YOLO Tracking
        # persist=True is important for tracking
        results = yolo_model.track(frame, persist=True, verbose=False, classes=[PLAYER_CLASS_ID])
        
        # Store current frame for cropping (maybe resized to save ram)
        # The model needs 64x64 input.
        
        if results and results[0].boxes and results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.cpu().numpy()
            track_ids = results[0].boxes.id.int().cpu().numpy()
            
            for box, track_id in zip(boxes, track_ids):
                x1, y1, x2, y2 = map(int, box)
                
                # Crop person
                person_crop = frame[y1:y2, x1:x2]
                if person_crop.size == 0: continue
                
                # Preprocess for LRCN
                resized_crop = cv2.resize(person_crop, (IMAGE_HEIGHT, IMAGE_WIDTH))
                normalized_crop = resized_crop / 255.0
                
                if track_id not in tracks_buffer:
                    tracks_buffer[track_id] = deque(maxlen=SEQUENCE_LENGTH)
                
                tracks_buffer[track_id].append(normalized_crop)
                
                # If we have a full sequence, let's predict!
                # To avoid spamming predictions every frame for the same person, 
                # we can enforce a 'cooldown' or stride.
                if len(tracks_buffer[track_id]) == SEQUENCE_LENGTH:
                    # HEURISTIC: Only predict every 10 frames per person
                    if frame_idx % 10 == 0:
                        input_seq = np.expand_dims(np.array(tracks_buffer[track_id]), axis=0)
                        
                        preds = lrcn_model.predict(input_seq, verbose=0)
                        pred_idx = np.argmax(preds)
                        confidence = float(preds[0][pred_idx])
                        action_label = CLASSES_LIST[pred_idx]
                        
                        # Filter low confidence
                        if confidence > 0.6: # Thesis used 0.99 for highlights, 0.6 is safer for general
                            start_time = max(0, (frame_idx - SEQUENCE_LENGTH) / fps)
                            end_time = frame_idx / fps
                            
                            # Deduplicate: if last event was same action/person recently, update it?
                            # For now just append.
                            events.append({
                                "time_seconds": round(start_time, 2),
                                "end_time": round(end_time, 2),
                                "event_type": action_label,
                                "team_id": "auto",
                                "confidence_score": round(confidence, 2),
                                "track_id": int(track_id),
                                "tags": ["auto_detected", action_label]
                            })
                            
                            # Heuristic: Clear buffer to avoid detecting same shot 20 times in 1 second?
                            # tracks_buffer[track_id].clear() 
        
        frame_idx += 1
        if frame_idx % 20 == 0:
            sys.stderr.write(f"Processed {frame_idx} frames...\n")
            if progress_callback:
                percent = int((frame_idx / total_frames) * 100)
                progress_callback(percent)

    cap.release()
    return events

def merge_events(events):
    # Simple merger for consecutive same-action events
    if not events: return []
    
    merged = []
    current = events[0]
    
    for next_event in events[1:]:
        # If same action, same track (or close time), merge
        if (next_event['event_type'] == current['event_type'] and 
            next_event['time_seconds'] - current['end_time'] < 2.0):
            
            # Extend current
            current['end_time'] = next_event['end_time']
            current['confidence_score'] = max(current['confidence_score'], next_event['confidence_score'])
        else:
            merged.append(current)
            current = next_event
    
    merged.append(current)
    return merged

def export_clips(video_path, events, output_dir):
    """Cut and save clips for each event."""
    if not events: return
    
    # Lazy import
    from moviepy.video.io.VideoFileClip import VideoFileClip

    os.makedirs(output_dir, exist_ok=True)
    
    try:
        # Load video once to cut clips
        # Note: VideoFileClip can be slow to open on some systems
        with VideoFileClip(video_path) as video:
            duration = video.duration
            for event in events:
                start = max(0, event['time_seconds'] - 1.0) # Add padding
                end = min(duration, event['end_time'] + 1.0)
                
                # Clip name: event_{id}_{type}.mp4
                # We need a unique ID for the event, let's use timestamp
                timestamp_id = int(event['time_seconds'] * 1000)
                filename = f"event_{timestamp_id}_{event['event_type']}.mp4"
                filepath = os.path.join(output_dir, filename)
                
                # Cut
                clip = video.subclip(start, end)
                # Write file (using slower preset for better compression/compat if needed, or fast)
                # target_bitrate is optional, standard is fine
                clip.write_videofile(filepath, codec="libx264", audio_codec="aac", verbose=False, logger=None, preset='ultrafast')
                
                # Add file path to event object for frontend
                # Relative path for web
                event['clip_path'] = f"/clips/{os.path.basename(output_dir)}/{filename}"
                
    except Exception as e:
        sys.stderr.write(f"Error exporting clips: {e}\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", required=True)
    parser.add_argument("--export-clips", action='store_true', help="Export individual clips")
    parser.add_argument("--progress-file", required=False, help="Path to write progress json")
    args = parser.parse_args()
    
    def update_progress(p, s="analyzing"):
        if args.progress_file:
            try:
                with open(args.progress_file, 'w') as f:
                    json.dump({"progress": p, "status": s}, f)
            except: pass

    try:
        update_progress(1, "loading_models")
        yolo, lrcn = load_models()
        
        update_progress(5, "analyzing_video")
        raw_events = extract_sequences_and_predict(args.video, yolo, lrcn, progress_callback=lambda p: update_progress(5 + int(p * 0.8), "analyzing"))
        
        update_progress(90, "merging_events")
        final_events = merge_events(raw_events)
        
        update_progress(95, "exporting_clips")
        # Create a job ID or unique folder name based on video name or time
        import time
        job_id = f"job_{int(time.time())}"
        output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'clips', job_id)
        
        export_clips(args.video, final_events, output_dir)
        
        update_progress(100, "done")
        
        print(json.dumps({"success": True, "events": final_events, "job_id": job_id}))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

