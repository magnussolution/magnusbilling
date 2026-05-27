# Call Duration Limit - MagnusBilling

## Question
**Does MagnusBilling have a configuration that terminates calls after 1 hour duration?**

## Answer

**YES.** MagnusBilling has a default configuration that automatically terminates calls after **1 hour (3600 seconds)** of duration.

---

## Configuration

### Global Parameter
- **Configuration Name:** `max_call_duration`
- **Description:** Maximum call duration in seconds
- **Default Value:** `3600` (1 hour)
- **Scope:** Global (applies to the entire system)
- **Storage Location:** `pkg_configuration` table in the database
- **Introduced in Version:** 7.8.4.4 (January 22, 2024)

```sql
INSERT INTO pkg_configuration VALUES
(NULL, 'Max call duration', 'max_call_duration', '3600', 'Maximum call duration in seconds', 'global', '1');
```

### Where to Configure
The configuration can be accessed from:
- **Admin Panel → Settings → Configuration**
- **Property:** `$MAGNUS->config['global']['max_call_duration']`

---

## How It Works

### 1. Timeout Calculation in CalcAgi Class

When a call starts, the `CalcAgi` class (responsible for billing calculations) calculates the maximum allowed call duration through the `calculateTimeout()` method:

**File:** `resources/asterisk/CalcAgi.php` (lines 106-248)

```php
public function calculateTimeout(&$MAGNUS, $agi)
{
    // ... various calculations ...
    
    // If the calculated timeout is greater than max_call_duration,
    // limit it to the configured maximum value
    if ($TIMEOUT > $MAGNUS->config['global']['max_call_duration']) {
        $agi->verbose('TIMEOUT1 use max_call_duration ' . $MAGNUS->config['global']['max_call_duration'], 5);
        $TIMEOUT = $MAGNUS->config['global']['max_call_duration'];
    }
    
    $this->tariffObj[0]['timeout'] = $TIMEOUT + $this->freetimetocall_left[0];
    return $TIMEOUT;
}
```

#### Scenarios Where Limit is Applied:

1. **Calls with Zero Tariff**
   - If the initial rate is ≤ 0 (free calls)
   - Timeout is set to `max_call_duration` (3600 seconds)

2. **Calls with Free Plan**
   - If the user has a free plan/credit
   - Timeout is limited to `max_call_duration`

3. **Calls with Limited Credit**
   - Calculate how many minutes the user can talk with available credit
   - If the result is greater than `max_call_duration`, the limit is reduced to 3600 seconds

### 2. Applying Timeout to Dial

When the call is actually made, the calculated timeout is passed to the `run_dial()` function:

**File:** `resources/asterisk/CalcAgi.php` (lines 820-835)

```php
$MAGNUS->run_dial(
    $agi,
    $dialstr,
    $MAGNUS->agiconfig['dialcommand_param'] . $addparameter,
    $this->tariffObj[0]['rc_directmedia'],
    $timeout  // ← Maximum timeout value
);
```

### 3. Integration with Asterisk Dial Command

**File:** `resources/asterisk/Magnus.php` (lines 636-672)

The `run_dial()` function substitutes the `%timeout%` placeholder in the Asterisk DIAL command parameters:

```php
public function run_dial($agi, $dialstr, $dialparams = "", $trunk_directmedia = 'no', 
                         $timeout = 3600, $max_long = 2147483647)
{
    // Converts seconds to milliseconds and substitutes in dialparams
    $dialparams = str_replace("%timeout%", min($timeout * 1000, $max_long), $dialparams);
    
    // ... additional processing ...
    
    // Executes the DIAL command with the timeout
    return $agi->execute("DIAL $dialstr" . $dialparams);
}
```

Example of substitution:
- **Input value:** `$timeout = 3600` seconds (1 hour)
- **Substituted value:** `%timeout%` → `3600000` (milliseconds)
- **Asterisk command:** `DIAL SIP/provider/number,L(3600000:...)`

---

## Dial Parameters Formatting

Dial parameters are configured in:
- `dialcommand_param` - Standard parameters for normal calls
- `dialcommand_param_sipiax_friend` - Parameters for internal calls between users
- `dialcommand_param_call_2did` - Parameters for calls to DID

**Documentation found:**
```
'Dial parameter for calls between users.
By default (3600000 = 1 HOUR MAX CALL).'
```

---

## Where Timeout is Applied

### Affected Call Types

1. **SIP/IAX Calls** - `SipCallAgi.php`, `IaxCallAgi.php`
2. **Calls to DID** - `DidAgi.php`
3. **Callback Calls** - `CallbackAgi.php`
4. **Queue Calls** - `QueueAgi.php`
5. **IVR Calls** - `IvrAgi.php`
6. **Mass Calls** - `MassiveCall.php`
7. **SIP Transfers** - `SipTransferAgi.php`

All these modules use the same logic:
1. Call `CalcAgi->calculateTimeout()` or `calculateAllTimeout()`
2. Get the maximum timeout value
3. Pass it to `Magnus->run_dial()` with this timeout

---

## Limit Behavior

### When Call Reaches 1 Hour

When a call reaches the maximum time of 3600 seconds (1 hour):

1. Asterisk automatically terminates the call
2. The call is registered with a total duration of 3600 seconds
3. Billing is calculated based on the effective duration (up to 1 hour)
4. A CDR (Call Detail Record) entry is generated

### When Credit Runs Out Before 1 Hour

If the user exhausts their credit before reaching 1 hour:
- The recalculated timeout will be less than 3600 seconds
- The call will be terminated when credit ends or timeout expires (whichever comes first)

---

## Modifying the Configuration

### Changing the Default Limit

To change the limit from 1 hour to another value:

1. **Via Web Interface:**
   - Admin Panel → Settings → Configuration
   - Search for "Max call duration"
   - Change the value in seconds
   - Save

2. **Via Database:**
   ```sql
   UPDATE pkg_configuration 
   SET value = '7200' 
   WHERE variablename = 'max_call_duration';
   -- Changes to 2 hours (7200 seconds)
   ```

3. **Common Values:**
   - 1800 seconds = 30 minutes
   - 3600 seconds = 1 hour (default)
   - 5400 seconds = 1 hour 30 minutes
   - 7200 seconds = 2 hours

---

## Related Files

- `protected/commands/UpdateMysqlCommand.php` - Initial configuration definition
- `resources/asterisk/CalcAgi.php` - Timeout calculation
- `resources/asterisk/Magnus.php` - Timeout application to Dial
- `protected/controllers/ConfigurationController.php` - Configuration interface
- `resources/asterisk/*Agi.php` - Usage in different call types

---

## Conclusion

**YES**, MagnusBilling automatically terminates any call after **1 hour (3600 seconds)** of duration. This is a global safety limit that applies to all call types in the system. This limit can be modified through the administrator configuration interface by changing the `max_call_duration` parameter to a different value in seconds.
