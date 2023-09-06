const mqtt = require("mqtt");
const Influx = require("influx");

let config;

// Versuche die Konfigurationsdatei zu laden, deren Pfad als Kommandozeilenargument übergeben wurde.
try
{
    config = require(process.argv[2]);
}
catch (error)
{
    console.error("Die Konfigurationsdatei konnte nicht geladen werden");
    process.exit(1);
}

// Initialisiere eine neue InfluxDB-Client-Instanz mit den Konfigurationsparametern.
const influx = new Influx.InfluxDB({
    host: config.influx.host,
    port: config.influx.port,
    username: config.influx.username,
    password: config.influx.password,
    database: config.influx.database,
    schema: [
        {
            measurement: "parameter",
            fields: {
                value: Influx.FieldType.FLOAT,
            },
            tags: ["topic"],
        },
    ],
});

// Überprüfe, ob die InfluxDB-Datenbank bereits existiert.
influx.getDatabaseNames()
    .then(names => 
    {
        if (!names.includes(config.influx.database))
        {
            // Wenn die Datenbank nicht existiert, erstelle sie.
            return influx.createDatabase(config.influx.database)
                .then(() =>
                {
                    console.log(`Datenbank ${config.influx.database} wurde erstellt`);
                })
                .catch(err =>
                {
                    console.log(`Datenbank konnte nicht erstellt werden. Fehler: ${err.stack}`);
                });
        }
        else
        {
            console.log(`Datenbank ${config.influx.database} wurde gefunden`);
        }
    })
    .then(() => 
    {
        // Logge eine erfolgreiche Verbindung zur Datenbank.
        console.log("InfluxDB wurde verbunden");
    })
    .catch(err => 
    {
        console.log(`Es konnte keine Verbindung mit der InfluxDB aufgebaut werden. Fehler: ${err.stack}`);
        process.exit(1);
    });


const processMessage = (topic, message) =>
{
    const data = [];
    const topicConfig = config.topicMapping.find(t => t.topic === topic);

    if (topicConfig)
    {
        for (const mapping of topicConfig.mappings)
        {
            const { schema, column, transform } = mapping;
            let value = getValueFromSchema(message, schema);

            // Wert transformieren, falls eine Transformationsfunktion definiert ist
            if (transform)
            {
                value = transform(value);
            }

            if (value !== undefined)
            {
                data.push({
                    measurement: column,
                    fields: { value },
                });
            }
        }
    }

    return data;
};

const getValueFromSchema = (message, schema) =>
{
    const keys = schema.split(".");
    let value = message;
    for (const key of keys)
    {
        if (value.hasOwnProperty(key))
        {
            value = value[key];
        }
        else
        {
            return undefined;
        }
    }
    if (value === undefined)
    {
        return undefined;
    }
    return value;
};

const client = mqtt.connect(config.mqtt);

client.on("connect", () =>
{
    console.log("Connected to MQTT broker");

    const topicsToSubscribe = config.topicMapping.map(t => t.topic);

    client.subscribe(topicsToSubscribe, (err, granted) =>
    {
        if (err)
        {
            console.log(`Failed to subscribe: ${err.message}`);
            return;
        }
    });
});

client.on("offline", () =>
{
    console.log("MQTT broker connection failed");
    process.exit(1);
});

client.on("error", (error) =>
{
    console.log("MQTT Client Error:", error);
    process.exit(1);
});

client.on("close", () =>
{
    console.log("MQTT connection closed");
    process.exit(1);
});

client.on("message", (topic, message) =>
{
    const messageString = message.toString();
    let parsedMessage;
    try
    {
        parsedMessage = JSON.parse(messageString);
    } catch (e)
    {
        console.log(`MQTT Message konnte nicht geparst werden: ${e.message}`);
        return;
    }

    if (config.settings.success_log_on_message)
    {
        console.log("Success");
    }

    if (config.settings.output_raw_messages)
    {
        console.log("Neue MQTT Nachricht:", JSON.stringify(parsedMessage));
    }

    const data = processMessage(topic, parsedMessage);

    if (config.settings.output_influx_points)
    {
        console.log("Neuer InfluxDB Eintrag", JSON.stringify(data));
    }

    // Überprüfe, ob die Daten in die InfluxDB geschrieben werden kann
    if (config.settings.write_to_influx && data.length > 0)
    {
        influx.writePoints(data).catch((err) =>
        {
            console.log(`Error saving data to InfluxDB! ${err.stack}`);
        });
    }

});
