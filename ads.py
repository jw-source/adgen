import cv2
import time
import numpy as np
from replicate import Client
from openai import OpenAI
import moondream as md
from PIL import Image
import base64
import easyocr
import os


class AdGen:
    def __init__(self):
        # Read the current ad image from current_ad.txt
        with open("imgs/current_ad.txt", "r") as f:
            self.ad_path = os.path.join("imgs", f.read().strip())
        
        self.img_path = "images/screenshot.png"  # Screenshot path
        self.openai_client = OpenAI(
            api_key="",
            )
        self.moondream_client = OpenAI(
            base_url="https://api.moondream.ai/v1",
            api_key=""
            )
        self.replicate_client = Client(api_token="")
        self.perplexity_client = OpenAI(
        base_url="https://api.perplexity.ai",
        api_key = ""
        )
        self.perplexity_on = True  # Initialize perplexity_on attribute

    def analyze_face(self):
        """Analyze the face in the screenshot using Moondream."""
        model = md.vl(api_key="")
        image = Image.open(self.img_path)
        self.facial_expression = model.caption(image)["caption"]
        print(f"Facial Expression: {self.facial_expression}")

    def detect_ad_elements(self):
        """Detect text elements in the ad image."""
        reader = easyocr.Reader(['en'])
        results = reader.readtext(self.ad_path)
        self.text_elements = []

        for (bbox, text, confidence) in results:
            if confidence > 0.1:
                (tl, tr, br, bl) = bbox
                x = int(min(tl[0], bl[0]))
                y = int(min(tl[1], tr[1]))
                w = int(max(tr[0], br[0]) - x)
                h = int(max(bl[1], br[1]) - y)

                self.text_elements.append({
                    'bbox': (x, y, w, h),
                    'confidence': confidence,
                    'type': 'text',
                    'text': text
                })

    def mask_ad(self):
        """Create a mask for the ad image."""
        image = cv2.imread(self.ad_path)
        mask = np.ones(image.shape[:2], dtype=np.uint8) * 255

        for element in self.text_elements:
            x, y, w, h = element['bbox']
            cv2.rectangle(mask, (x, y), (x + w, y + h), 0, -1)

        mask_path = "imgs/mask.png"
        cv2.imwrite(mask_path, mask)
        self.mask_path = mask_path

    def describe_ad(self):
        """Generate a description of the ad using Moondream."""
        with open(self.ad_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode("utf-8")

        completion = self.moondream_client.chat.completions.create(
            model="moondream-2B",
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}
                    },
                    {"type": "text", "text": "Describe this advertisement in detail."}
                ]
            }]
        )

        self.ad_description = completion.choices[0].message.content
        print(f"Ad Description: {self.ad_description}")

    def what_to_modify(self):
        if self.perplexity_on:
            completion = self.perplexity_client.chat.completions.create(
            model = "sonar",
            messages=[
            {"role": "system", "content": "I'm trying to think of current events that could be relavant to run ads around. Can you help me think of some based on the provided ad description."},
            {"role": "user", "content": f"Ad Description: {self.ad_description}"},])
            self.current_events = completion.choices[0].message.content
            completion = self.openai_client.chat.completions.create(
            model = "gpt-4o",
                messages=[
                {"role": "user", "content": "Replace the existing text, based on the viewer's facial expression, ad's description, and real-word current events. Return 3 different options following this format: 'It aint over till its over', 'Here we go again', 'The show must go on'. Don't add additional formatting."},
                {"role": "user", "content": f"Viewer: {self.facial_expression}\nAd Description: {self.ad_description}\nCurrent Events: {self.current_events}"},])
            self.ad_change = "Write this text:\n" + completion.choices[0].message.content
        else:
            completion = self.openai_client.chat.completions.create(
            model = "gpt-4o-mini",
            messages=[
            {"role": "user", "content": "Replace the existing text, based on the viewer's facial expression, ad's description. Return 3 different options following this format: 'It aint over till its over', 'Here we go again', 'The show must go on'. Don't add additional formatting."},
            {"role": "user", "content": f"Viewer: {self.facial_expression}\nAd Description: {self.ad_description}"},])
            self.ad_change = "Add this text here:\n" + completion.choices[0].message.content
        print(self.ad_change)
        return

    def generate_ad(self):
        self.what_to_modify()
        output_cleaned_ad = self.replicate_client.run(
            "ideogram-ai/ideogram-v2-turbo",
            input={
                "mask": open(self.mask_path, "rb"),
                "image": open(self.ad_path, "rb"),
                "prompt": "Remove this",
                "magic_prompt_option": "Auto",
                "style_type": "Auto",
            }
        )
        
        cleaned_ad_path = "imgs/cleaned_ad.png"
        
        with open(cleaned_ad_path, "wb") as file:
            file.write(output_cleaned_ad.read())
        
        output_final_ad = self.replicate_client.run(
            "ideogram-ai/ideogram-v2",
            input={
                "mask": open(self.mask_path, "rb"),
                "image": open(cleaned_ad_path, "rb"),
                "prompt": self.ad_change,
                "magic_prompt_option": "Auto",
                "style_type": "Auto",
            }
        )
        
        with open("imgs/generated_ad.png", "wb") as file:
            file.write(output_final_ad.read())

    def run_pipeline(self):
        """Run the entire pipeline."""
        start_time = time.time()

        print("Analyzing face...")
        self.analyze_face()

        print("Detecting ad elements...")
        self.detect_ad_elements()

        print("Creating mask...")
        self.mask_ad()

        print("Describing ad...")
        self.describe_ad()

        print("Generating new ad...")
        self.generate_ad()

        end_time = time.time()
        
        print(f"Pipeline completed in {end_time - start_time:.2f} seconds")


if __name__ == "__main__":
    generator = AdGen()
    generator.run_pipeline()
