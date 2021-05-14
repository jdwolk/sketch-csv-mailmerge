# Sketch CSV Mail Merge

A lightweight Sketch plugin for importing data from .csv files using "{}" text sections. Also supports image imports

![THE CSV MAIL MERGE PLUGIN IN USE](https://github.com/jdwolk/sketch-csv-mailmerge/raw/master/assets/csv-to-mailmerge.gif)


## Installing

1. Download and unzip [the .zip file](https://github.com/jdwolk/sketch-csv-mailmerge/releases/latest)
1. Double click the .sketchplugin file

## Using

(*NOTE*: I highly recommend you save a backup of your sketch file before you run the plugin. This hasn't been tested extensively and I have no idea if it'll destroy your precious project. Works like a charm for me though ;P)

1. Download a .csv file with your data. Make sure it includes a header row with field names. If you'd like to use a custom name for the generated artboards, include a column with name "artboard".
1. Create a sketch file
  * Wherever you want to substitute in data make a text layer like `{field}`.
  * When the plugin is run it will match the text area named `{field}` with a value from the "field" column in the .csv
1. In Sketch, click `Plugins -> CSV Mail Merge`
1. Click your .csv file
1. Voila! Done

### Images

You can also import images with almost no changes. Just make sure the data in your .csv for your image fields contains a full path to the image on your hard drive, i.e. `/Users/you/projects/an-image.png`.

Right now only `.png` and `.jpg` images are supported.

## Developing

### Setup
```bash
$ yarn install
```

### Run
```bash
$ yarn watch
```

### Debugging

```bash
$ skpm -f log
```

## To Do

* Make it work with groups - right now it only works w/ a flat hierarchy.
* Clean up the code. It's short, but it could look better.

This plugin was created using `skpm`. For a detailed explanation on how things work, checkout the [skpm Readme](https://github.com/skpm/skpm/blob/master/README.md).
