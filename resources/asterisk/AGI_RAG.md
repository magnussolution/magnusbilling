# MagnusBilling AGI Retrieval-Augmented Generation (RAG) Reference

This document provides a structured overview of the AGI-related source code
in `resources/asterisk/`.  It is designed to support retrieval-augmented
generation (RAG) workflows, enabling an AI model or developer to quickly find
relevant modules, functions, and concepts when answering questions or
performing modifications.

Each subsection corresponds to a PHP file/class, with keywords and a brief
summary of its responsibilities.

---

## 📁 File Index

| File | Primary Class | Key Topics & Keywords |
|------|---------------|----------------------|
| `mbilling.php` | — | entry point, DNID handling, voucher, pickup, queue commands, mode dispatch |
| `AGI.Class.php` | `AGI` | AGI protocol, evaluate, get_data, execute, query, generic library |
| `AGI_AsteriskManager.Class.php` | `AGI_AsteriskManager` | AMI connection, core show channels, control commands |
| `Magnus.php` | `Magnus` | state container, configuration, request parsing, helpers, dialing,
| | | number translation, billing helpers, recording, prompts |
| `CalcAgi.php` | `CalcAgi` | billing engine, timeout/cost calculation, CDR saving, trunk selection |
| `AuthenticateAgi.php` | `AuthenticateAgi` | authentication chain (CallerID, accountcode, techprefix, SIP proxy,
| | | calling card, callshop), restriction checks |
| `DidAgi.php` | `DidAgi` | DID detection, inbound routing, limits, DID billing, destinations |
| `SipCallAgi.php` | `SipCallAgi` | SIP call processing, call forwarding, SMS forwarding |
| `IaxCallAgi.php` | `IaxCallAgi` | IAX2 call processing |
| `StandardCallAgi.php` | `StandardCallAgi` | PSTN outbound call handling |
| `SipTransferAgi.php` | `SipTransferAgi` | SIP transfer billing |
| `QueueAgi.php` | `QueueAgi` | queue integration, pause/resume, caller/agent events, CDR updates |
| `IvrAgi.php` | `IvrAgi` | IVR menu playback, option selection, direct dialing |
| `PickupAgi.php` | `PickupAgi` | call pickup via AMI |
| `PortabilidadeAgi.php` | `PortabilidadeAgi` | Brazilian portability lookup (portabilidade) |
| `PortalDeVozAgi.php` | `PortalDeVozAgi` | voice portal for SIP user dialing |
| `SearchTariff.php` | `SearchTariff` | rate lookup for destination prefixes |
| `MassiveCall.php` | `MassiveCall` | outbound campaign/click-to-call handling |
| `Tts.php` | `Tts` | text-to-speech provider integration |

---

## 🔍 How to Use This Reference

- **Search by filename** for direct code access.
- **Use keywords** (e.g. "voucher", "DID", "timeout") to locate modules
  responsible for a particular feature.
- **Trace call flow questions**: start at `mbilling.php` then follow dispatch
  into the appropriate `*Agi` class.
- **Billing/timeout inquiries** point to `CalcAgi` and `SearchTariff`.
- **Authentication or restrictions** reference `AuthenticateAgi` and
  `Magnus` helpers.

This document can be indexed by an AI retriever to answer questions about the
AGI codebase or to provide context during code generation.

---

## 🧠 Example Retrieval Prompts

- *"Which file handles voucher validation for *120?"* → `mbilling.php` (lines
  30–70).

- *"How does the system decide which trunk to use for a number?"* →
  `SearchTariff.php` → `CalcAgi->sendCalltoTrunk()` via `StandardCallAgi`.

- *"Where is the login via SIP header implemented?"* →
  `AuthenticateAgi::sipProxyAuthenticate()`.

- *"I need to add a new DNID command *199 to trigger a special script."*
  Modify `mbilling.php` along with any new AGI class.

---

Keep this file up‑to‑date as new AGI modules are added or existing ones
change.  It serves as the **RAG corpus index** for any downstream automation
or documentation generation tasks.