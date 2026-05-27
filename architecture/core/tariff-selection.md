# Tariff Selection

## Input
- id_plan
- destination (E.164)

## Strategy
- Longest Prefix Match
- ORDER BY LENGTH(prefix) DESC LIMIT 1

## Tables Involved
- pkg_plan
- pkg_rate
- pkg_prefix
- pkg_trunk_group

## Failure Condition
- No matching prefix
- Call terminated