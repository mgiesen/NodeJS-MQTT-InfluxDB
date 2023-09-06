This Node.js script provides a solution for receiving MQTT messages, processing them, and writing them to an InfluxDB database. It is designed to be configurable and adaptable to various MQTT message structures.

## Motivation

I created this script because I want to collect data from various MQTT devices in my home network, store it in a database, and then visualize it using Grafana. While there are existing solutions like NodeRED for this purpose, I found them less intuitive and adaptable to my preferences.

## Features

- **Configurability**: The script reads configuration parameters from an external file, allowing you to define MQTT topics, InfluxDB connection details, and data mappings.
- **Dynamic Data Mapping**: You can define mappings for MQTT topics to InfluxDB measurements, including data transformation options.
- **Error Handling**: The script handles various error scenarios, such as MQTT connection issues or database creation failures.

## Prerequisites

Before using the script, make sure you have the following:

- Node.js installed on your system.
- MQTT broker credentials.
- InfluxDB credentials and database setup.

## Usage

1. Clone this repository to your local machine:

```bash
git clone https://github.com/mgiesen/NodeJS-MQTT-To-InfluxDB.git
```

2. Install the required Node.js packages:

```bash
npm install
```

3. Create a configuration file (e.g., `config.json`) with your MQTT and InfluxDB settings. Additionally, you can choose to exclude certain parts of the configuration and place them in a .env file for improved handling, especially when working with multiple configuration files.

4. Run the script with the configuration file as a command-line argument:

```bash
node mqtt-to-influx.js shelly-solar-config.js
```

## Template for the .env file

```bash
#InfluxDB
INFLUX_HOST=
INFLUX_PORT=
INFLUX_USERNAME=
INFLUX_PASSWORD=

#MQTT
MQTT_HOST=
MQTT_USERNAME=
MQTT_PASSWORD=
MQTT_PROTOCOL=
```

## Acknowledgments

- The script utilizes the "mqtt" and "influx" Node.js packages for MQTT communication and InfluxDB integration.

Feel free to contribute, report issues, or suggest improvements by creating issues or pull requests.
