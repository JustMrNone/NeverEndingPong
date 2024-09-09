import os
from svgpathtools import svg2paths, svg2paths2, wsvg

def merge_svgs(input_folder, output_file):
    # Get list of SVG files
    svg_files = [f for f in os.listdir(input_folder) if f.endswith('.svg')]
    
    # Prepare to combine paths
    all_paths = []

    for svg_file in svg_files:
        paths, attributes = svg2paths(os.path.join(input_folder, svg_file))
        all_paths.extend(paths)
    
    # Write combined SVG
    wsvg(all_paths, filename=output_file)

# Usage
merge_svgs('pong_000', 'Pong.svg')