Troubleshooting calls with no audio
===================================

When the call connects but no sound/audio passes, in most cases the issue is related to **RTP/NAT/firewall configuration**, not the billing itself.

Please check the following:

1. **Open the RTP ports on the server firewall**
   MagnusBilling by default has these ports open, but if you have a custom firewall configuration, please make sure the following ports are open:

```bash
10000:60000/udp
```

Check if they are open in your firewall, cloud provider firewall, router, or security group.

2. **Check Asterisk NAT settings**

Edit:

```bash
/etc/asterisk/sip.conf
```

Confirm that the server has the correct public IP configured, for example:


* externip=YOUR_SERVER_PUBLIC_IP
* localnet=YOUR_LOCAL_NETWORK/NETMASK
* nat=force_rport,comedia


Then reload Asterisk:

```bash
asterisk -rx "sip reload"
```

3. **Check if RTP packets are arriving**

Run this command during a test call:

```bash
tcpdump -n udp portrange 10000-60000
```

If you do not see RTP packets, the audio is being blocked before reaching the server.

4. **Disable direct media if needed**

If direct media is enabled, audio may try to pass directly between caller and provider, causing one-way audio or no audio depending on NAT.

In MagnusBilling / Asterisk options, test with **directmedia disabled**.

Documentation:
https://wiki.magnusbilling.org/en/source/get_started/first_call.html#directmedia

5. **Test with another provider or SIP account**

This helps confirm if the problem is on:

* the customer device/softphone,
* the provider trunk,
* firewall/NAT,
* or server configuration.

Useful documentation:
https://wiki.magnusbilling.org/en/source/get_started/first_call.html
https://wiki.magnusbilling.org/en/source/get_started/quick_install.html

If after checking this the issue continues, please send us:

* one example call date/time,
* caller number,
* destination number,
* provider used,
* and whether the issue is no audio both ways or only one-way audio.
