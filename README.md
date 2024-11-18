[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PyPI](https://img.shields.io/pypi/v/inventree-test-statistics)](https://pypi.org/project/inventree-test-statistics/)
![PEP](https://github.com/inventree/inventree-test-statistics/actions/workflows/pep.yaml/badge.svg)


# InvenTree Test Statistics Plugin

An [InvenTree](https://inventree.org) plugin for generating and viewing statistical test data.

## Description

The *Test Statistics* plugin provides a number of tools for generating and viewing statistical test data, which can be displayed dynamically in the user interface, or exported to a file for further processing.

Test statistics can be generated for a particular part, or for a selected build order.

| Context | Screenshot |
| --- | --- |
| Test for a part (including variants) | ![Part Test Statistics](docs/img/stats.png) |

## Installation

### Via User Interface

The simplest way to install this plugin is from the InvenTree plugin interface. Enter the plugin name (`inventree-test-statistics`) and click the `Install` button:

![Install Plugin](docs/img/install.png)

### Via Pip

Alternatively, the plugin can be installed manually from the command line via `pip`:

```bash
pip install -U inventree-test-statistics
```

*Note: After the plugin is installed, it must be activated via the InvenTree plugin interface.*

## Configuration

The plugin can be configured via the InvenTree plugin interface. The following settings are available:

*TODO: No plugin settings are currently available*

## Contributing

### Backend

Backend code is written in Python, and is located in the `test_statistics` directory.

### Frontend

Frontend code is written in JavaScript, and is located in the `frontend` directory. Read the [frontend README](frontend/README.md) for more information.
