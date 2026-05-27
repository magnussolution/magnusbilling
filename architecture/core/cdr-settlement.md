# CDR & Financial Settlement

## Trigger
AFTER INSERT ON pkg_cdr

## Logic
IF sessionbill > 0:
  Deduct credit

## Agent Scenario
- agent_bill > 0
- Hierarchical deduction

## Failed Calls
- Stored in pkg_cdr_failed