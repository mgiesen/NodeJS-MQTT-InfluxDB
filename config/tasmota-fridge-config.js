require('dotenv').config();

module.exports = {
    settings: {
        success_log_on_message: true,
        output_raw_messages: false,
        output_influx_points: false,
        write_to_influx: false
    },
    influx: {
        host: process.env.INFLUX_HOST,
        port: process.env.INFLUX_PORT,
        username: process.env.INFLUX_USERNAME,
        password: process.env.INFLUX_PASSWORD,
        database: "FRIDGE"
    },
    mqtt: {
        host: process.env.MQTT_HOST,
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        protocol: process.env.MQTT_PROTOCOL
    },
    topicMapping: [
        {
            topic: "tasmota/discovery/34945491E10B/sensors",
            mappings: [
                {
                    schema: "sn.ENERGY.Power",
                    column: "power",
                    transform: (value) =>
                    {
                        return value;
                    }
                },
                {
                    schema: "sn.ENERGY.Today",
                    column: "energy_today",
                    transform: (value) =>
                    {
                        return value;
                    }
                }
            ]
        }
    ]
};
