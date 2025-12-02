# 3.0.0
- Added: api Pix
- Fix: updated dependencies

# 2.4.1

- Fix: Files with endpoint oneStep charge

# 2.4.0

- Added: new endpoint (oneStep charge)

# 2.3.0

- Added: new endpoint (settle charge)
- Added: new endpoint (settle carnet parcel)

# 2.2.0

- Added: new endpoint (create charge balance sheet)

# 2.1.0

- Added: new endpoint (update plan)
- Added: new endpoint (create subscription history)

# 2.0.0

- Breaking change: Drop PHP 5.4 support 
- Breaking change: Update Guzzle version

# 1.0.14

- Added: timeout option

# 1.0.13

- Fix: code climate on dev dependencies

# 1.0.12

- Added: new endpoint (update charge link)

# 1.0.11

- Added: new endpoint (charge link)
- Updated: docs

# 1.0.10

- Added: new endpoints (cancel carnet and cancel parcel)
- Updated: docs

# 1.0.9

- Fix: Tests.

# 1.0.8

- Updated: Request
- Added: User can define the certified path.

# 1.0.7

- Updated: ApiRequest
- Updated: Request
- Fix: Remove random number from detailSubscription example.

# 1.0.6

- Add: Add Support to PHP 5.4 and above

# 1.0.5

- Updated: ApiRequest

# 1.0.4

- Added: new endpoints (carnet history, resend parcel and resend carnet)
- Updated: docs

# 1.0.3

- Fix: endpoint charge history

# 1.0.2

- Added: new endpoint (charge history)
- Added: custom header
- Updated: docs

# 1.0.1

- Added: new endpoint (resend billet)
- Updated: docs

# 1.0.0

- First stable version

# 0.2.3

- Updated: docs
- Updated: code examples

# 0.2.2

- Changed: Gerenciant's urls for production and sandbox

# 0.2.1

- Refactored: now Gerencianet endpoints are restfull, which means that the sdk must consider sending also put and delete
- Refactored: each function now has two arguments: *params* and *body*.
              The *body* is meant to be sent in the request body as usual, whereas the *params* will be mapped to url params as defined in gn-constants. If the param is not present in the url, it will be sent as a query string
- Updated: docs

# 0.1.1

- Added: createPlan and deletePlan
- Updated: docs

# 0.1.0

- Initial release
