CREATE TABLE public.summary
(
  split character varying(200),
  "time" character varying(200),
  "Moving Time" character varying(200),
  distance numeric(17,2),
  "Elevation Gain" character varying(200),
  "Elevation Loss" character varying(200),
  "Avg Pace" character varying(200),
  "Avg Moving Pace" character varying(200),
  "Best Pace" character varying(200),
  calories bigint,
  runid double precision
)
WITH (
  OIDS=FALSE
);
GRANT ALL ON TABLE public.summary TO public;

CREATE TABLE public.workabledetails
(
  split character varying(200),
  "time" character varying(200),
  "Moving Time" character varying(200),
  distance numeric(17,2),
  "Elevation Gain" character varying(200),
  "Elevation Loss" character varying(200),
  "Avg Pace" character varying(200),
  "Avg Moving Pace" character varying(200),
  "Best Pace" character varying(200),
  calories bigint,
  filename character varying(200),
  runid double precision
)
WITH (
  OIDS=FALSE
);
GRANT ALL ON TABLE public.workabledetails TO public;

CREATE TABLE public.workabledata
(
  deviceid double precision,
  latitude double precision,
  longitude double precision,
  dtime timestamp without time zone,
  distancemeters double precision,
  filename character varying(200),
  runid double precision,
  dateinserted date,
)
WITH (
  OIDS=FALSE
);
GRANT ALL ON TABLE public.workabledata TO public;

