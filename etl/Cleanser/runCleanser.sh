cd "$(dirname "$0")"
gradle -PSPARK_LIB=/dataworks/spark-1.4.0-bin-hadoop2.6/lib/spark-assembly-1.4.0-hadoop2.6.0.jar -PRUN_PROPERTIES=run.properties run
