.. _asterisk-directmedia:

Directmedia
===========

In Asterisk, SIP signaling to establish a call always passes through the
Asterisk server. After the call is established, the RTP audio can also pass
through Asterisk or can flow directly between the endpoints in the call.

Both options have advantages and disadvantages.

* When RTP flows directly between endpoints, Asterisk does not need to process
  that audio traffic. This can reduce server load when there are many
  simultaneous calls.

* When RTP flows directly between endpoints, Asterisk cannot detect in-call
  feature codes after the call is established. Features that depend on DTMF or
  dialed codes, such as transfers, forwarding, do not disturb, and call
  recording control, may not work as expected.

Therefore, if call transfers or other features that depend on in-call codes
must work, the voice traffic must pass through Asterisk.

This behavior is controlled by the ``directmedia`` option in the SIP
configuration. With ``directmedia=yes``, RTP can flow directly between the
endpoints. With ``directmedia=no``, RTP remains bridged through Asterisk.

In MagnusBilling, this option is important when analyzing online calls,
re-invites, audio IPs, call recording, transfers, and other features that
depend on Asterisk staying in the media path.
