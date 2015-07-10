#!/bin/bash
FILES=/dataworks/results/*.csv
for f in $FILES
do
  echo "" >> $f
done
