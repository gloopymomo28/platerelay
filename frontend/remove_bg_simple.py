from PIL import Image

def remove_solid_bg(input_path, output_path, tolerance=30):
    img = Image.open(input_path).convert("RGBA")
    data = img.load()
    width, height = img.size
    
    # Get top-left pixel as the background color
    bg_color = data[0, 0]
    
    # We will just iterate over all pixels. If they match the bg_color within tolerance, make them transparent.
    # But since it's a logo with holes, floodfill is better. Let's try simple tolerance first since it's an AI generated logo without much anti-aliasing issues?
    # Actually floodfill is safer. Let's do a simple BFS floodfill.
    visited = set()
    queue = [(0, 0), (width-1, 0), (0, height-1), (width-1, height-1)]
    
    def color_distance(c1, c2):
        return sum(abs(a - b) for a, b in zip(c1[:3], c2[:3]))
        
    while queue:
        x, y = queue.pop(0)
        if (x, y) in visited:
            continue
        visited.add((x, y))
        
        current_color = data[x, y]
        if color_distance(current_color, bg_color) <= tolerance:
            data[x, y] = (0, 0, 0, 0) # Make transparent
            # Add neighbors
            for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    queue.append((nx, ny))
                    
    # Also do the same for the inner loop of the 'P' and 'R'
    # Actually, floodfill might not reach inner loops. 
    # Let's just do a global replace for any pixel very close to bg_color, but only if it's not too dark.
    # The logo is green/brown/food. The bg is light cream.
    for y in range(height):
        for x in range(width):
            c = data[x,y]
            if color_distance(c, bg_color) <= tolerance:
                data[x, y] = (0, 0, 0, 0)
                
    img.save(output_path, "PNG")

remove_solid_bg('public/pr-logo-original.png', 'public/pr-logo.png', tolerance=40)
print("Done")
