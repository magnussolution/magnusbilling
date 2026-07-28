<?php

/**
 * English fallback for structured Call Diagnostic execution failures.
 *
 * Each locale may override any entry in its own zii.php catalog. Keeping the
 * fallback here guarantees that every supported backend language has the full
 * diagnostic contract while translations are completed incrementally.
 */
return [
    'The AGI script is not accessible.' => 'The AGI script is not accessible.',
    'The diagnostic process could not read the AGI script or access its directory.' => 'The diagnostic process could not read the AGI script or access its directory.',
    'Verify the MagnusBilling installation path and the file permissions shown below.' => 'Verify the MagnusBilling installation path and the file permissions shown below.',
    'PHP CLI was not found.' => 'PHP CLI was not found.',
    'The diagnostic requires an executable PHP command-line binary on the MagnusBilling server.' => 'The diagnostic requires an executable PHP command-line binary on the MagnusBilling server.',
    'Install or configure PHP CLI and run the diagnostic again.' => 'Install or configure PHP CLI and run the diagnostic again.',
    'The AGI diagnostic process could not be started.' => 'The AGI diagnostic process could not be started.',
    'The operating system rejected the attempt to start the isolated AGI diagnostic process.' => 'The operating system rejected the attempt to start the isolated AGI diagnostic process.',
    'Verify that proc_open is enabled and that the web server user can execute PHP CLI.' => 'Verify that proc_open is enabled and that the web server user can execute PHP CLI.',
    'The AGI diagnostic exceeded the safe time limit.' => 'The AGI diagnostic exceeded the safe time limit.',
    'The AGI did not finish within the diagnostic timeout.' => 'The AGI did not finish within the diagnostic timeout.',
    'Review the process errors below and any slow external routing checks, then try again.' => 'Review the process errors below and any slow external routing checks, then try again.',
    'The AGI produced more output than the diagnostic safety limit.' => 'The AGI produced more output than the diagnostic safety limit.',
    'The process was stopped because its output exceeded the maximum size accepted by the diagnostic.' => 'The process was stopped because its output exceeded the maximum size accepted by the diagnostic.',
    'Review the process output below for a repeated error or excessive debug logging.' => 'Review the process output below for a repeated error or excessive debug logging.',
    'The AGI rejected the diagnostic input.' => 'The AGI rejected the diagnostic input.',
    'One of the values sent to the AGI does not match the safe debug format.' => 'One of the values sent to the AGI does not match the safe debug format.',
    'Review the destination, account and CallerID values shown in the diagnostic form.' => 'Review the destination, account and CallerID values shown in the diagnostic form.',
    'The AGI stopped because of a PHP error.' => 'The AGI stopped because of a PHP error.',
    'PHP terminated the AGI before it could return the required diagnostic result.' => 'PHP terminated the AGI before it could return the required diagnostic result.',
    'Use the process error shown below to correct the code, dependency or configuration.' => 'Use the process error shown below to correct the code, dependency or configuration.',
    'The AGI process exited with an error.' => 'The AGI process exited with an error.',
    'The process returned a non-zero exit code before producing a diagnostic result.' => 'The process returned a non-zero exit code before producing a diagnostic result.',
    'Use the exit code and process output shown below to identify the failing dependency.' => 'Use the exit code and process output shown below to identify the failing dependency.',
    'The AGI generated invalid JSON.' => 'The AGI generated invalid JSON.',
    'The result marker was produced, but its JSON could not be decoded. Invalid text encoding is a common cause.' => 'The result marker was produced, but its JSON could not be decoded. Invalid text encoding is a common cause.',
    'Use the JSON error and process output shown below to correct the data or code that generated the result.' => 'Use the JSON error and process output shown below to correct the data or code that generated the result.',
    'The AGI ended without returning a diagnostic result.' => 'The AGI ended without returning a diagnostic result.',
    'The process did not produce the required MBILLING_RESULT marker.' => 'The process did not produce the required MBILLING_RESULT marker.',
    'Use the process output shown below to identify where the AGI stopped.' => 'Use the process output shown below to identify where the AGI stopped.',
    'The AGI diagnostic failed before routing was evaluated.' => 'The AGI diagnostic failed before routing was evaluated.',
    'The diagnostic process did not provide enough structured information to classify the failure.' => 'The diagnostic process did not provide enough structured information to classify the failure.',
    'Send the diagnostic ID and the technical evidence shown below to support.' => 'Send the diagnostic ID and the technical evidence shown below to support.',
    'The diagnostic stopped because of an application error.' => 'The diagnostic stopped because of an application error.',
    'MagnusBilling caught an unexpected code error before the diagnostic could finish.' => 'MagnusBilling caught an unexpected code error before the diagnostic could finish.',
    'Send the diagnostic ID and the application error shown below to support.' => 'Send the diagnostic ID and the application error shown below to support.',
];
