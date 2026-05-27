# Outbound Call Flow

## 1. Entry Point
- Context: billing
- AGI: mbilling.php

## 2. Bootstrap Phase
- load_conf()
- get_agi_request_parameter()

## 3. Mode Detection
- standard mode

## 4. Authentication
- AuthenticateAgi::authenticateUser()
- setMagnusAttributes()

## 5. Number Processing
- checkNumber()
- normalization (E.164)
- number_translation
- PortabilidadeAgi (optional)
- checkRestrictPhoneNumber()

## 6. Tariff Selection
- SearchTariff::find()
- Longest Prefix Match
- Plan-based filtering

## 7. Timeout Calculation
- CalcAgi::calculateAllTimeout()
- Package check
- Prepaid / Postpaid logic
- Max session time definition

## 8. Trunk Selection
- trunk_group_type (1,2,3)
- Fallback logic

## 9. Dial Execution
- run_dial()
- DIALSTATUS handling

## 10. Settlement
- updateSystem()
- Insert pkg_cdr
- MySQL Trigger
- Credit deduction

## Financial Responsibility Points
- Timeout calculation
- pkg_cdr insertion
- MySQL trigger execution