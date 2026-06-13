from rembg import remove
from PIL import Image

def process_logo():
    input_path = 'public/pr-logo-original.png'
    output_path = 'public/pr-logo.png'
    
    # 1. Open the original image
    img = Image.open(input_path).convert("RGBA")
    
    # 2. Crop the bottom 20% to remove the gold line and sparkle
    width, height = img.size
    cropped_img = img.crop((0, 0, width, int(height * 0.85)))
    
    # 3. Remove background using rembg
    no_bg_img = remove(cropped_img)
    
    # 4. Crop to the bounding box of non-transparent pixels to make it tight
    bbox = no_bg_img.getbbox()
    if bbox:
        no_bg_img = no_bg_img.crop(bbox)
        
    # 5. Save the final image
    no_bg_img.save(output_path, "PNG")
    print("Successfully processed logo")

if __name__ == "__main__":
    process_logo()
