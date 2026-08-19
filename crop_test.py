import os
from PIL import Image

image_path = "d:/anti_project/frontend/public/hero_aquarium.jpg"
output_dir = "d:/anti_project/frontend/public/fish"
os.makedirs(output_dir, exist_ok=True)

im = Image.open(image_path)

# Approximate coordinates of all fish from the 1024x682 reference image
fish_crops = {
  "left_blue_tang": (78, 108, 225, 192),      # w=147, h=84
  "left_yellow_tang": (244, 138, 314, 208),   # w=70,  h=70
  "left_clownfish_mid": (88, 303, 155, 348),   # w=67,  h=45
  "left_zebra": (162, 420, 248, 515),          # w=86,  h=95
  "left_discus": (180, 563, 292, 672),         # w=112, h=109
  "left_clownfish_bot": (96, 695, 200, 780),   # Wait! Let's check coordinate y limits
  "left_tiny_orange": (86, 68, 134, 114),      # w=48,  h=46
  
  "right_purple_tang": (856, 132, 926, 208),  # w=70,  h=76
  "right_clownfish_top": (754, 190, 832, 260), # w=78,  h=70
  "right_yellow_tang": (746, 318, 850, 422),   # w=104, h=104
  "right_zebra": (884, 228, 960, 328),        # w=76,  h=100
  "right_blue_small": (720, 516, 785, 562),    # w=65,  h=46
  "right_clownfish_bot": (764, 560, 866, 650),  # w=102, h=90
  "right_clownfish_tiny": (783, 690, 853, 750) # w=70,  h=60
}

# Wait, let's fix coordinates by checking limits:
# The image height is 682, so y coordinates must be < 682.
# Let's adjust bottom fish coordinates:
fish_crops = {
  "left_blue_tang": (78, 108, 225, 192),      # w=147, h=84
  "left_yellow_tang": (244, 138, 314, 208),   # w=70,  h=70
  "left_clownfish_mid": (88, 303, 155, 348),   # w=67,  h=45
  "left_zebra": (162, 420, 248, 515),          # w=86,  h=95
  "left_discus": (180, 563, 292, 672),         # w=112, h=109
  "left_clownfish_bot": (96, 495, 200, 555),   # w=104, h=60  (corrected y)
  "left_tiny_orange": (86, 68, 134, 114),      # w=48,  h=46
  
  "right_purple_tang": (856, 132, 926, 208),  # w=70,  h=76
  "right_clownfish_top": (754, 190, 832, 260), # w=78,  h=70
  "right_yellow_tang": (746, 318, 850, 422),   # w=104, h=104
  "right_zebra": (884, 228, 960, 328),        # w=76,  h=100
  "right_blue_small": (720, 516, 785, 562),    # w=65,  h=46
  "right_clownfish_bot": (764, 560, 866, 650),  # w=102, h=90
  "right_clownfish_tiny": (783, 485, 853, 545) # w=70,  h=60   (corrected y)
}

for name, box in fish_crops.items():
  # ensure box coordinates are within image boundaries
  box = (
    max(0, box[0]),
    max(0, box[1]),
    min(im.size[0], box[2]),
    min(im.size[1], box[3])
  )
  cropped = im.crop(box)
  
  # Remove blue backdrop by converting to RGBA and masking blue pixels
  rgba = cropped.convert("RGBA")
  datas = rgba.getdata()
  
  new_data = []
  for item in datas:
    r, g, b, a = item
    
    # We want to match blue/teal background water color.
    # The water is predominantly blue/green, so:
    # b > r and g > r are strong indicators of blue/cyan water.
    # Let's calculate the color distance to pure blue/cyan:
    # If the pixel is mostly blue/cyan, we key it out.
    is_blue_bg = False
    
    # In the reference image, the water ranges from light cyan to deep blue.
    # Typically:
    # - Cyan water: b > 140, g > 110, r < 120
    # - Deep blue water: b > 80, g > 40, r < 60
    # Let's check color distance:
    # A pixel is background if:
    # b > 75 and (b > r + 20) and (g > r - 10)
    # Let's test this chroma-key formula:
    if b > 70 and (b > r + 15) and (g > r - 15) and not (r > 160 and g > 100 and b < 50): # make sure we don't key yellow fish
      is_blue_bg = True
      
    # Special protections for yellow fish (r and g are high, b is low):
    if r > 180 and g > 150 and b < 100:
      is_blue_bg = False
      
    # Special protection for orange clownfish (r is very high, g is mid, b is low):
    if r > 160 and g > 60 and b < 70:
      is_blue_bg = False
      
    if is_blue_bg:
      # set alpha to 0 (transparent)
      new_data.append((r, g, b, 0))
    else:
      new_data.append((r, g, b, a))
      
  rgba.putdata(new_data)
  rgba.save(f"{output_dir}/{name}.png", "PNG")

print("Crops successfully generated.")
