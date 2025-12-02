
.. _callBack-id-user:

Username
--------

| Owner of the DID that received the CallBack request.




.. _callBack-exten:

Destination number
------------------

| Number of who called the DID requesting the CallBack




.. _callBack-status:

Status
------

| Status of the call
| The statuses are:
|     * Active
|         The CallBack still hasn't been processed.
|     * Pending
|         MagnusBilling processed the CallBack and sent it to the trunk.
|     * Sent
|         The CallBack has been processed successfully.
|     * Outside of the time range
|         The call was received outside of the time range configured in the DID menu, tab CallBack Pro.
|     .



