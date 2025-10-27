exports.transaction = false;

exports.up = (pgm) => {
  // Create the trades table (time-series base)
  pgm.createTable(
    "trades",
    {
      time: { type: "timestamp with time zone", notNull: true },
      symbol: { type: "text", notNull: true },
      price: { type: "decimal", notNull: true },
      quantity: { type: "decimal", notNull: true },
      tradeId: { type: "bigint", notNull: true },
    },
    {
      constraints: {
        primaryKey: ["time", "tradeId", "symbol"],
      },
    }
  );

  // Convert it into a Timescale hypertable
  pgm.sql(`SELECT create_hypertable('trades', 'time', if_not_exists => TRUE);`);

  // Index for faster symbol/time queries
  pgm.createIndex("trades", ["symbol", { name: "time", sort: "DESC" }]);

  // --- Continuous Aggregates (Materialized Views) ---

  // 1 Minute Candles
  pgm.sql(`
    CREATE MATERIALIZED VIEW candles_1m
    WITH (timescaledb.continuous) AS
    SELECT
        time_bucket('1 minute', time) AS bucket,
        symbol,
        first(price, time) AS open,
        last(price, time) AS close,
        min(price) AS low,
        max(price) AS high,
        sum(quantity) AS volume
    FROM trades
    GROUP BY bucket, symbol
    WITH NO DATA;
  `);

  // 5 Minute Candles
  pgm.sql(`
    CREATE MATERIALIZED VIEW candles_5m
    WITH (timescaledb.continuous) AS
    SELECT
        time_bucket('5 minutes', time) AS bucket,
        symbol,
        first(price, time) AS open,
        last(price, time) AS close,
        min(price) AS low,
        max(price) AS high,
        sum(quantity) AS volume
    FROM trades
    GROUP BY bucket, symbol
    WITH NO DATA;
  `);

  // 1 Hour Candles
  pgm.sql(`
    CREATE MATERIALIZED VIEW candles_1h
    WITH (timescaledb.continuous) AS
    SELECT
        time_bucket('1 hour', time) AS bucket,
        symbol,
        first(price, time) AS open,
        last(price, time) AS close,
        min(price) AS low,
        max(price) AS high,
        sum(quantity) AS volume
    FROM trades
    GROUP BY bucket, symbol
    WITH NO DATA;
  `);

  // 1 Day Candles
  pgm.sql(`
    CREATE MATERIALIZED VIEW candles_1d
    WITH (timescaledb.continuous) AS
    SELECT
        time_bucket('1 day', time) AS bucket,
        symbol,
        first(price, time) AS open,
        last(price, time) AS close,
        min(price) AS low,
        max(price) AS high,
        sum(quantity) AS volume
    FROM trades
    GROUP BY bucket, symbol
    WITH NO DATA;
  `);

  // --- Continuous Aggregate Policies ---

  pgm.sql(`
    SELECT add_continuous_aggregate_policy('candles_1m',
      start_offset => INTERVAL '20 minutes',
      end_offset => INTERVAL '1 minute',
      schedule_interval => INTERVAL '1 minute');
  `);

  pgm.sql(`
    SELECT add_continuous_aggregate_policy('candles_5m',
      start_offset => INTERVAL '1 hour',
      end_offset => INTERVAL '10 minutes',
      schedule_interval => INTERVAL '5 minutes');
  `);

  pgm.sql(`
    SELECT add_continuous_aggregate_policy('candles_1h',
      start_offset => INTERVAL '3 hours',
      end_offset => INTERVAL '30 minutes',
      schedule_interval => INTERVAL '30 minutes');
  `);

  pgm.sql(`
    SELECT add_continuous_aggregate_policy('candles_1d',
      start_offset => INTERVAL '3 days',
      end_offset => INTERVAL '1 hour',
      schedule_interval => INTERVAL '1 hour');
  `);
};

exports.down = (pgm) => {
  // Drop aggregate views first (reverse order)
  pgm.dropMaterializedView("candles_1m");
  pgm.dropMaterializedView("candles_5m");
  pgm.dropMaterializedView("candles_1h");
  pgm.dropMaterializedView("candles_1d");

  // Drop index & base table
  pgm.dropIndex("trades", ["symbol", "time"]);
  pgm.dropTable("trades");
};
