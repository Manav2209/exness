```
 Whenever running or restart the timescaledb server 

1 go inside the db instance for the instance command is docker exec -it contianer_id postgres -U muyser -d timseries

2 Refresh materialized views manually

CALL refresh_continuous_aggregate('candles_1m', NULL, NULL);
CALL refresh_continuous_aggregate('candles_5m', NULL, NULL);
CALL refresh_continuous_aggregate('candles_1h', NULL, NULL);
CALL refresh_continuous_aggregate('candles_1d', NULL, NULL);

```