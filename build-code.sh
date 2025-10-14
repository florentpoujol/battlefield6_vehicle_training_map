#!/bin/bash

# This script build the 'portal/code.ts' file, from the files found in the 'src' folder.
# catenate all files in src and coment out the imports

rm -f ./portal/code.ts
touch ./portal/code.ts

# put a watermark at the top
currentdate=$(date)
cat ./src/output-watermark.ts >> ./portal/code.ts 
sed -i "s/{date}/$currentdate/g" ./portal/code.ts 

# concatenate all imported files
concatenatedFiles=()
function concatenateFile ()
{
	local filename=$1
	concatenatedFiles+=($filename)

	cat ./src/output-filename.ts >> ./portal/code.ts 
	# using ~ as separator because filename may contain slashes
	sed -i "s~{filename}~$filename~g" ./portal/code.ts 

	cat "./$filename" >> ./portal/code.ts 
}

# if you add more files to the project, add more lines here
concatenateFile 'src/UIHelpers.ts'
concatenateFile 'src/DevTools.ts'

# this one must be the last one
concatenateFile 'src/code.ts'
sed -i 's/^import/\/\/ import/g' ./portal/code.ts 

# and at the end, the list of files for debug
echo "" >> ./portal/code.ts 
echo "// concatenated files:"  >> ./portal/code.ts 
for filename in "${concatenatedFiles[@]}"
do
	echo "// - $filename" >> ./portal/code.ts 
done
