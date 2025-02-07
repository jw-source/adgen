from deepface import DeepFace
import cv2
import time

class AdGen():
    def __init__(self, img_path):
        self.img_path = img_path

    def crop_face(self):
        detected_faces = DeepFace.extract_faces(img_path=self.img_path)
        cv_img = cv2.imread(self.img_path)
        face_data = detected_faces[0]['facial_area']
        
        x1 = face_data['x']
        y1 = face_data['y']
        width = face_data['w']
        height = face_data['h']
        
        cropped_face = cv_img[y1:y1+height, x1:x1+width]
        cv2.imwrite("imgs/cropped_face.png", cropped_face)
        self.img_path = "imgs/cropped_face.png"
        return

    def analyze_face(self):
        face_analysis = DeepFace.analyze(img_path=self.img_path)
        if face_analysis[0]['dominant_gender'] == "Man":
            gender = "He"
        else:
            gender = "She"
        output = f"{gender} is a {face_analysis[0]['age']} year old {face_analysis[0]['dominant_gender'].lower()} of {face_analysis[0]['dominant_race'].lower()} descent who seems to be {face_analysis[0]['dominant_emotion'].lower()}."
        print(output)
        return output

if __name__ == "__main__":
    start = time.time()
    new_ad = AdGen("imgs/lebron.png")
    new_ad.crop_face()
    new_ad.analyze_face()
    end = time.time()
    print(f"Time elapsed: {end-start} seconds")