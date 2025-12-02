<?php

require_once(__DIR__ . "/../bootstrap.php");

try {
    // It if the data comes from the POST variable just leave it like this
    // If you are using some framework pass the data to the readNotification method
    $notification = placetopay()->readNotification();

    // Check if the notification its a valid one
    if ($notification->isValidNotification()) {
        // In order to use the functions please refer to the Notification class

        if ($notification->isApproved()) {
            // Realease the product
        } else {
            // Reject the order
        }

    } else {
        // There was some error or invalid structure
    }
} catch (Exception $e) {
    var_dump($e->getMessage());
}

