#!/bin/bash
cd ${0%/*}
python dart.py -l password.csv -f TCX -o /dataworks/results -a /dataworks/archive
python dart.py -l password.csv -f CSV -o /dataworks/results -a /dataworks/archive
