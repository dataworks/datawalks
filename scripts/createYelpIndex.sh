curl -XPUT 'http://es-server:9200/yelps'
curl -XPUT 'http://es-server:9200/yelps/yelp/_mapping' -d '
{
 "yelps": {
   "properties": {
     "location": {
       "type": "geo_point",
       "store": "yes"
     }
   }
 }
}
'
