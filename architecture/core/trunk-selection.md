# Trunk Selection

## trunk_group_type

1 - Sequential (ORDER BY id ASC)
2 - Random (ORDER BY RAND())
3 - Lowest cost (ORDER BY buyrate)

## Provider Balance Check
- Each trunk belongs to provider
- Provider credit validation

## Fallback Behavior
- CHANUNAVAIL / CONGESTION → next trunk
- BUSY / NOANSWER / CANCEL → stop