curl -XPUT 'http://es-server:9200/twitter'
curl -XPUT 'http://es-server:9200/twitter/tweet/_mapping' -d '
{
 "tweet": {
   "properties": {
     "location": {
       "type": "geo_point",
       "store": "yes"
     }
   }
 }
}
'
