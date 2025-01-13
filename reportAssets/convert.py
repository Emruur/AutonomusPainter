from PIL import Image
import os

def extract_frame_from_gifs(input_dir, output_dir):
    """
    Extracts the 5th frame before the last frame from all GIFs in the input directory 
    and saves them as PNGs in the output directory.
    
    Args:
        input_dir (str): Directory containing the GIF files.
        output_dir (str): Directory to save the extracted PNG files.
    """
    # Ensure the output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Iterate through all files in the input directory
    for file_name in os.listdir(input_dir):
        if file_name.lower().endswith('.gif'):
            gif_path = os.path.join(input_dir, file_name)
            try:
                with Image.open(gif_path) as gif:
                    # Get the total number of frames
                    total_frames = gif.n_frames
                    if total_frames < 5:
                        print(f"Skipping {file_name}: Not enough frames.")
                        continue
                    
                    # Calculate the frame index (5th before the last)
                    frame_index = total_frames - 5

                    # Extract the desired frame
                    gif.seek(frame_index)
                    frame = gif.convert("RGBA")  # Convert to RGBA for saving as PNG

                    # Save the frame as a PNG
                    output_file_name = os.path.splitext(file_name)[0] + "_frame.png"
                    output_path = os.path.join(output_dir, output_file_name)
                    frame.save(output_path, "PNG")

                    print(f"Saved frame {frame_index} of {file_name} as {output_path}")
            except Exception as e:
                print(f"Error processing {file_name}: {e}")

# Example usage
input_directory = "."
output_directory = "."
extract_frame_from_gifs(input_directory, output_directory)