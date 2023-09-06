require('dotenv').config();

module.exports = {
    settings: {
        success_log_on_message: true,
        output_raw_messages: true,
        output_influx_points: true,
        write_to_influx: false
    },
    influx: {
        host: process.env.INFLUX_HOST,
        port: process.env.INFLUX_PORT,
        username: process.env.INFLUX_USERNAME,
        password: process.env.INFLUX_PASSWORD,
        database: "SOLAR"
    },
    mqtt: {
        host: process.env.MQTT_HOST,
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        protocol: process.env.MQTT_PROTOCOL
    },
    topicMapping: [
        {
            topic: "shellyplus1pm_solar/status/switch:0",
            mappings: [
                {
                    schema: "temperature.tC",
                    column: "temperature",
                    transform: (value) =>
                    {
                        return value;
                    }
                },
                {
                    schema: "aenergy.total",
                    column: "energy_total",
                    transform: (value) =>
                    {
                        return value;
                    }
                }
            ]
        }
    ]
};
