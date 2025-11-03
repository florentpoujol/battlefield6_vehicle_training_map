#!/bin/bash

# This script build the 'portal/code.ts' file, from the files found in the 'src' folder.
# catenate all files in src and coment out the imports

## execute from the root folder, not from 'tools'

outputfilepath=./portal/concatenated.ts

rm -f $outputfilepath
touch $outputfilepath

# put a watermark at the top
currentdate=$(date)
cat ./tools/concatenated-watermark.ts >> $outputfilepath 
sed -i "s/{date}/$currentdate/g" $outputfilepath 

# concatenate all imported files
concatenatedFiles=()
function concatenateFile ()
{
	local filename=$1
	concatenatedFiles+=($filename)

	cat ./tools/concatenated-filenames.ts >> $outputfilepath 
	# using ~ as separator because filename may contain slashes
	sed -i "s~{filename}~$filename~g" $outputfilepath 

	cat "./$filename" >> $outputfilepath 
}

# if you add more files to the project, add more lines here
concatenateFile 'src/UIHelpers.ts'
concatenateFile 'src/DevTools.ts'
concatenateFile 'src/VehicleManager.ts'
concatenateFile 'src/AiPathManager.ts'

# this one must be the last one
concatenateFile 'src/main.ts'
sed -i 's/^import/\/\/ import/g' $outputfilepath 
sed -i "s/{script_build_time}/$currentdate/g" $outputfilepath 

# and at the end, the list of files for debug
echo "" >> $outputfilepath 
echo "// concatenated files:"  >> $outputfilepath 
for filename in "${concatenatedFiles[@]}"
do
	echo "// - $filename" >> $outputfilepath 
done

py ./tools/check-string-keys.py ./portal/strings.json $outputfilepath
py ./tools/check-callback-typo.py $outputfilepath

# then move the .tscn files so that all needed files are in the 'portal' folder
./tools/update-from-godot.sh
