# MagnusBilling 7

> [!WARNING]
> MagnusBilling 7 entered maintenance mode on July 18, 2026. No new features
> will be added. Critical bug, security, and compatibility fixes continue
> through December 31, 2026. Regular maintenance ends on January 1, 2027.
> New deployments and new feature development must use
> [MagnusBilling 8](https://github.com/magnussolution/magnusbilling8).

MagnusBilling 7 is the legacy Asterisk 13 and `chan_sip` release. Read the
[lifecycle policy](LIFECYCLE.md) and plan a
[side-by-side migration to MagnusBilling 8](https://github.com/magnussolution/magnusbilling8/blob/source/wiki/en/get_started/migrate_from_mb7.rst).

Do you like this software? Star the project and become a
[stargazer](https://github.com/magnussolution/magnusbilling7/stargazers).

## Getting Started

Video:

* [How to install MagnusBilling](https://www.youtube.com/watch?v=X3cj-dZPZHU)
* [How to set-up basic configuration and make your first call](https://www.youtube.com/watch?v=7r1XCJnfdZA&t=73s)

### Prerequisites

MagnusBilling 7 supports only:

* Debian 11 (Bullseye)
* Debian 12 (Bookworm)

Debian 13 is not supported by MagnusBilling 7. Use MagnusBilling 8 on Debian 13.

CentOS 7 is end-of-life and is not supported. Existing CentOS 7 installations
must be migrated to a new Debian server; an in-place upgrade is not supported.

### Installing

New installations are not recommended. MagnusBilling 7 remains available only
for legacy maintenance and controlled recovery work through December 31, 2026.

```

curl -O https://raw.githubusercontent.com/magnussolution/magnusbilling7/source/script/install.sh
bash install.sh

```


## Built With

* [YiiFramework](http://www.yiiframework.com) - The BackEnd framework used
* [EXTJS6](https://www.sencha.com/products/extjs) - The FrontEnd framework used
* [Asterisk](https://www.asterisk.org) - Telephony framework

## Contributing

Please read [CONTRIBUTING.md](https://github.com/magnussolution/magnusbilling7/blob/source/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

MagnusBilling uses the 7.x version series and is in maintenance mode.

## Authors

* **Adilson Magnus** - *Initial work* - [MagnusSolution](https://magnussolution.com)

See also the list of [contributors](https://github.com/magnussolution/magnusbilling7/contributors) who participated in this project.

## License

This project is licensed under the GPL3 License

Free Support
--------------------------------------
We provide several avenues for you to get your system up and running on your own and learn the basics of the system.

1. [Youtube Channel](https://www.youtube.com/channel/UCish_6Lxfkh29n4CLVEd90Q)
2. [Documentation](https://magnusbilling.org) Menu Documentation
3. [Telegram Group(English)](https://t.me/joinchat/NXwoZRPGpG6rPqp3yssLzQ)
4. [Telegram Grupo(Spanish)](https://t.me/joinchat/NXwoZRXQbjokWrliVGObkQ)
5. [Telegram Grupo(Português)](https://t.me/joinchat/NXwoZQtJRKN-5e03uY6_XQ)


## AI Documentation

This repository contains AI-optimized documentation for LLMs and coding agents:

- **[llms.txt](llms.txt)** - Quick start index for LLMs (high-priority docs, retrieval policy, discovery keywords)
- **[llms-full.txt](llms-full.txt)** - Complete catalog for RAG ingestion (all domains, playbooks, indexes, entry points)
- **[/ia-docs/](ia-docs/)** - Machine-oriented knowledge base (domains, playbooks, sources, indexes)
