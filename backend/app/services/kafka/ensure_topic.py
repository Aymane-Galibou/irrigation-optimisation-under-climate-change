import os
from confluent_kafka.admin import AdminClient, NewTopic

KAFKA_BROKER = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
TOPIC = os.getenv("KAFKA_TOPIC")


def ensure_topic_exists():
    # Confluent Cloud configuration for confluent_kafka (librdkafka wrapper)
    admin_config = {
        "bootstrap.servers": KAFKA_BROKER,
        "security.protocol": "SASL_SSL",
        "sasl.mechanism": os.getenv("KAFKA_SASL_MECHANISM", "PLAIN"),
        "sasl.username": os.getenv("KAFKA_SASL_USERNAME"),
        "sasl.password": os.getenv("KAFKA_SASL_PASSWORD"),
        'ssl.ca.location': '/etc/ssl/certs/ca-certificates.crt',

    }

    admin = AdminClient(admin_config)

    try:
        # Fetch metadata over TLS/SASL
        metadata = admin.list_topics(timeout=10)

        if TOPIC and TOPIC not in metadata.topics:
            print(f"🛠️ Creating missing topic: {TOPIC}")

            # Note: Confluent Cloud multi-AZ clusters default to replication_factor=3
            new_topic = NewTopic(TOPIC, num_partitions=1, replication_factor=3)

            futures = admin.create_topics([new_topic])

            for topic, future in futures.items():
                try:
                    future.result()
                    print(f"✅ Topic '{topic}' created successfully")
                except Exception as e:
                    print(f"⚠️ Could not create topic '{topic}': {e}")
        else:
            print(f"✅ Topic '{TOPIC}' already exists")

    except Exception as e:
        print(f"❌ Failed to query Confluent Cloud: {e}")
        raise e