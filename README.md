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

https://afauci.github.io/pairwise-comparison/image-pairwise-comparison.html

![Image pairwise comparison](image-pairwise-comparison.gif)

## Image pairwise group comparison

The pairwise comparison method can also be used for choosing between groups of images or photos.
To group the photos, upload a CSV file that contains metadata about the images. Then, upload the images and they will be grouped for voting based on the metadata provided.

https://afauci.github.io/pairwise-comparison/image-pairwise-group-comparison.html

## Downloading results to a CSV

Once the images (or groups of images) are compared, you have the option of downloading the results as a CSV file.

## Offline use

To the use the program offline, simply click on the image-pairwise-comparison.html or image-pairwise-group-comparison.html files from the codebase. This will launch them in your browser and allow them to be run locally.