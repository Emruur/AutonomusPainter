import json
import random
import inspect
from palettable.colorbrewer import qualitative, sequential, diverging

# Function to collect all available palettes from a category
def collect_palettes_from_category(category):
    palettes = {}
    for name, palette in inspect.getmembers(category):
        if hasattr(palette, "colors"):  # Ensure it's a palette with colors
            palettes[name] = [
                [int(c[0]), int(c[1]), int(c[2])] for c in palette.colors
            ]
    return palettes

# Function to collect all palettes
def collect_all_palettes():
    all_palettes = {}
    all_palettes.update(collect_palettes_from_category(qualitative))
    all_palettes.update(collect_palettes_from_category(sequential))
    all_palettes.update(collect_palettes_from_category(diverging))
    return all_palettes

# Function to select 10 random palettes
def select_random_palettes(all_palettes, count=10):
    palette_names = random.sample(list(all_palettes.keys()), count)
    selected_palettes = {name: all_palettes[name] for name in palette_names}
    return selected_palettes

# Function to save palettes to a JSON file
def save_palettes_to_file(filename, palettes):
    with open(filename, 'w') as file:
        json.dump(palettes, file, indent=2)
    print(f"Saved {len(palettes)} palettes to {filename}")

if __name__ == "__main__":
    # Collect all available palettes
    all_palettes = collect_all_palettes()
    print(f"Total palettes available: {len(all_palettes)}")

    # Select 10 random palettes
    random_palettes = select_random_palettes(all_palettes, count=10)

    # Save selected palettes to a file
    save_palettes_to_file("palettes.json", random_palettes)
