# Pairwise Comparison Method

Note: the following is adapted from evgeniy-khist's pairwise comparison work https://evgeniy-khist.github.io/pairwise-comparison.

Pairwise comparison (or paired comparison) is a process of comparing entities in pairs to judge which of each entity is preferred.

Sometimes it is hard to choose between multiple options.
Comparing each option with others in pairs simplifies the choice and helps to identify the most preferred option.

The pairwise comparison can be presented as a table.
Options are compared at the intersection of rows and columns.
If an option in a row is preferable to an option in a column, put **1** at the intersection and **0** otherwise.

Only comparisons of pairs above the diagonal line of the table are needed.
Values for pairs below the diagonal line can be calculated by simply inverting the corresponding values above the diagonal.

Finally, sum all the values in the row to get a score of the option.

Example 1:

|   | **A** | **B** | **C** | **D** | **Score** |
|---|---|---|---|---|---|
| **A** | - | 1 | 1 | 1 | **3** |
| **B** | 0 | - | 1 | 1 | **2** |
| **C** | 0 | 0 | - | 1 | **1** |
| **D** | 0 | 0 | 0 | - | **0** |

Example 2:

|   | **A** | **B** | **C** | **D** | **Score** |
|---|---|---|---|---|---|
| **A** | - | 1 | 1 | 0 | **2** |
| **B** | 0 | - | 0 | 1 | **1** |
| **C** | 0 | 1 | - | 1 | **2** |
| **D** | 1 | 0 | 0 | - | **1** |

## Image pairwise comparison

The pairwise comparison method can also be used for choosing the best image or photo.

https://afauci.github.io/image-pairwise-ucsf/image-pairwise-comparison.html

![Image pairwise comparison](image-pairwise-comparison.gif)

## Image pairwise group comparison

The pairwise comparison method can also be used for choosing between groups of images or photos.
To compare the groups of photos, upload a CSV file that contains metadata about the images. Then, upload the images and they will be grouped for voting based on the metadata provided.
To zoom in on a specific photo, right click on the image you want to view and select "Open in a new tab". The image will open by itself in a new tab in the browser.

There is an algorithm that is used to prevent redundant comparisons. It is similar logic to Comparison Sort, which relies on knowing that if A > B and A < C, then B < C without having to do the comparison manually.

https://afauci.github.io/image-pairwise-ucsf/image-pairwise-group-comparison.html

## Downloading results to a CSV

Once the images (or groups of images) are compared, you have the option of downloading the results as a CSV file.

## Offline use

To the use the program offline, you need to download the codebase from https://github.com/afauci/image-pairwise-ucsf (go to Code --> Download zip). Once the files are downloaded on your device, open the zip file and click on the image-pairwise-group-comparison.html file (or image-pairwise-comparison.html if using that comparison instead). This will launch them in your browser and allow them to be run locally.

## Saving your grading progress

If you are grading a set of photos and want to save your progress to come back to later, you can do that by hitting the "Save current progress" button above the images. This will download a file with data about the rankings you have done so far. When you wish to resume that grading set, reload the page and after uploading the metadata, choose "Upload saved progress (if needed)". When this prompts you to select a file, choose the CSV that was saved (default name is saved-grading-progress.csv). You will then continue to upload the images as usual, but the saved data will only present the images that you still need to grade, and use the saved data to keep track of existing rankings.

## Tests

There are tests for the comparison sort algorithm in the __tests__ directory.