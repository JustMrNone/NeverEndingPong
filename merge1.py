import os
from lxml import etree

def merge_svgs(input_folder, output_file):
    # Create an empty SVG root element
    svg_ns = 'http://www.w3.org/2000/svg'
    root = etree.Element('svg', xmlns=svg_ns)
    
    # Loop through all SVG files in the folder
    for filename in os.listdir(input_folder):
        if filename.endswith('.svg'):
            file_path = os.path.join(input_folder, filename)
            
            # Parse each SVG file
            tree = etree.parse(file_path)
            svg_element = tree.getroot()

            # Remove the XML declaration
            svg_element = etree.ElementTree(svg_element).getroot()

            # Append children of the current SVG to the root element
            for child in svg_element:
                if child.tag.endswith('svg'):
                    for grandchild in child:
                        root.append(grandchild)
                else:
                    root.append(child)

    # Create an SVG tree with the root element
    tree = etree.ElementTree(root)
    
    # Write the merged SVG to a file
    with open(output_file, 'wb') as f:
        tree.write(f, pretty_print=True, xml_declaration=True, encoding='UTF-8')

# Usage
merge_svgs('pong_000', 'Pong2.svg')