#!/usr/bin/python

import json
import requests

url = 'http://localhost:9200/tweets/japan/'

#!/usr/bin/python
with open('japanRows.json', 'r') as input:
  for line in input:
    parse = json.loads(line)
    result = requests.post(url, json.dumps(parse))
    print json.dumps(result.json())
