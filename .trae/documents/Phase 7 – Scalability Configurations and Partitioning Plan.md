## Objectives
- Scale reads/writes for high-traffic features (PIN analytics, matching, messaging).
- Reduce latency and contention via partitions, indexes, caches and queues.
- Add autoscaling and observability guardrails.

## Data Partitioning
### pin_analytics (hot writes, time-series)
- Strategy: native Postgres partitioned table by month on `created_at` with primary key `(id)` and local indexes on each partition.
- Implementation:
  1. Create parent `pin_analytics` partitioned by RANGE (`created_at`).
  2. Create partitions for current + next 6 months; attach trigger to auto-create next partition monthly.
  3. Local indexes: `(pin_id)`, `(event_type)`, `(created_at DESC)`. Keep summarized materialized view for last 30/90 days.
- Rationale: bulk insert performance, faster pruning, cheaper retention (drop old partitions).

### messaging & matches (KV-backed + periodic Postgres flush)
- Keep realtime chat and match state primarily in KV for low-latency writes.
- Batched Postgres persistence via cron/worker every N minutes; separate table partitions by `created_at` for `messages` if/when volume demands.

### professional_pins and related tables
- No partitioning needed initially; add composite indexes:
  - `professional_pins(pin_number)` unique and `user_id` index already present.
  - Ensure `pin_experiences(pin_id)` and `pin_skills(pin_id, skill_name)` have covering indexes.

## Indexing & Query Optimization
- Verify and add:
  - `profiles(user_id)` BTREE; partial index for active users if needed.
  - `pin_analytics(pin_id, created_at DESC)` (local per partition) for dashboard queries.
  - `pin_analytics(event_type)` for filtering series.
- Use server-side function `get_pin_analytics_summary(pin_id)` to fetch rollups; refresh materialized view on schedule.

## Caching & Queueing
- KV tiers:
  - Hot keys: `pin:<pinNumber>`, `user:<userId>`, analytics rollups `pin:analytics:<pinNumber>:<day>` with TTL.
  - Audit logs via append-only KV with bounded retention.
- Edge queue for analytics writes:
  - Accept events into an in-memory buffer/queue (Deno runtime) and batch insert every 500ms or when buffer size reaches threshold to reduce contention.
- CDN caching:
  - Public endpoints (`GET /pin/public/:number`) cache via CDN for 60s; add `ETag`/`Cache-Control` headers.

## Connection & Concurrency
- Enable pgBouncer (transaction pooling) on Supabase; raise pool to match concurrent edge function workers.
- Use `prepared statements` for frequent queries.
- Avoid long transactions; insert analytics with single-column defaults; defer constraints where safe.

## Horizontal Scaling
- Edge Functions:
  - Scale out via Supabase autoscaling; set max concurrency and cold start mitigations (keep minimal imports; reuse single supabase client; reuse KV client).
- Database:
  - Read replicas for analytics dashboards; direct summary queries to replica.
  - Consider Logical Replication to analytics warehouse (e.g., ClickHouse/BigQuery) for large-scale aggregations.

## Retention & Archival
- `pin_analytics`: keep 12 months online; drop older partitions monthly; archive to storage (CSV/Parquet) if compliance requires.
- KV audits: retain 90 days; summarize daily counts to Postgres table `pin_audit_daily`.

## Observability & Autoscaling Triggers
- Metrics:
  - DB: connections, lock waits, slow queries, partition sizes.
  - Edge: function latency, error rate, queue backlog.
  - Frontend: `navigator.connection` metrics already collected; extend to send window-load and main chunk sizes.
- Alerts:
  - p95 API latency > 800ms for 5 minutes.
  - `pin_analytics` insert failures or queue backlog > threshold.
  - Partition missing for current month.

## Supabase Policies & RLS
- Maintain RLS on partitioned child tables (inherit via parent policies).
- Ensure realtime subscription filter `pin_number=eq.<value>` is backed by an index on the publised column (store `pin_number` on analytics rows to avoid joins for realtime events).

## Rollout Plan
1. Create partitioned `pin_analytics` table and backfill existing data.
2. Add local indexes per partition and materialized view `pin_analytics_mv` for recent windows.
3. Introduce analytics write buffer in edge function; feature flag for batch writes.
4. Enable pgBouncer and tune pool sizes; validate with K6 load (existing workflows).
5. Add CDN caching headers to public endpoints.
6. Add monitoring dashboards and alerts.

## Risks & Mitigations
- Partition misconfiguration causing inserts to fail: add default catch-all partition with trigger to auto-create next.
- RLS inheritance pitfalls: validate child partitions accept parent policies in Supabase.
- Queue loss on edge restarts: use short flush intervals and small thresholds; optionally use a durable queue (Supabase Queue/Storage) for critical paths.

## Deliverables
- Partitioned analytics with local indexes and monthly rotation.
- KV cache policy for hot reads; batch insert buffer for analytics.
- Connection pooling and read replicas for dashboards.
- Monitoring/alerts based on latency, failures, and partition health.
