curl -XPUT 'http://es-server:9200/yelp'
curl -XPUT 'http://es-server:9200/yelp/yelps/_mapping' -d '
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
