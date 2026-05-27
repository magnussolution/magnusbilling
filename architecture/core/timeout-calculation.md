# Timeout Calculation

## Method
CalcAgi::calculateAllTimeout()

## Logic
- Check promotional packages
- Check prepaid balance
- Check postpaid limit
- Determine max session time

## Output
- Timeout (seconds)
- Authorization or rejection

## Financial Risk Point
- Incorrect timeout leads to overbilling risk