SELECT COUNT(*),to_char(dtime,'yyyy-mm-dd') d from workabledata
GROUP BY to_char(dtime,'yyyy-mm-dd');
