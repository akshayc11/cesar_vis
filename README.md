speech_map_video
================

1. Requirement - Apache 

If you have it, place this folder inside the host folder. It should be in /var/www in Linux. 

2. You should have a local copy of all the annotations in a specific folder. Link that folder to here as data
ln -s <path to folder> data

3. If you do the linking, run ./prepare_annotations_and_gps_data.py

4. Run localhost/speech_map_video in Mozilla browser. 

5. TODO create a way of selecting which run in main.js
