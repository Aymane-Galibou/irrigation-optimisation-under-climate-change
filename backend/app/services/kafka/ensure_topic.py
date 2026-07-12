from confluent_kafka.admin import AdminClient, NewTopic
import os

KAFKA_BROKER = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
TOPIC = os.getenv("KAFKA_TOPIC")


def ensure_topic_exists():
    admin = AdminClient({'bootstrap.servers': KAFKA_BROKER})

    # Check if exists
    metadata = admin.list_topics(timeout=10)

    if TOPIC not in metadata.topics:
        print(f"🛠️ Creating missing topic: {TOPIC}")

        new_topic = NewTopic(TOPIC, num_partitions=1, replication_factor=1)

        futures = admin.create_topics([new_topic])
        
        for topic, future in futures.items():
            try:
                future.result()
                print(f"✅ Topic '{topic}' created")
            except Exception as e:
                print(f"⚠️ Could not create topic '{topic}': {e}")