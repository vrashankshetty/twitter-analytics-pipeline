from kafka.admin import KafkaAdminClient, NewTopic
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_topics():
    """Create necessary Kafka topics if they don't exist"""
    try:
        # Connect to Kafka
        admin_client = KafkaAdminClient(
            bootstrap_servers="localhost:9092",
            client_id="kafka-admin"
        )
        
        # Define topics to create
        topics = [
            NewTopic(name="tweets_topic", num_partitions=3, replication_factor=1),
            NewTopic(name="processed_tweets_topic", num_partitions=3, replication_factor=1),
            NewTopic(name="performance_metrics_topic", num_partitions=3, replication_factor=1)
        ]
        
        # Check existing topics
        existing_topics = admin_client.list_topics()
        logger.info(f"Existing topics: {existing_topics}")
        
        # Filter out topics that already exist
        topics_to_create = [topic for topic in topics if topic.name not in existing_topics]
        
        if topics_to_create:
            # Create new topics
            admin_client.create_topics(new_topics=topics_to_create)
            logger.info(f"Created topics: {[topic.name for topic in topics_to_create]}")
        else:
            logger.info("All topics already exist.")
            
    except Exception as e:
        logger.error(f"Error creating Kafka topics: {e}")
    finally:
        if 'admin_client' in locals():
            admin_client.close()
            logger.info("Kafka admin client closed")

if __name__ == "__main__":
    create_topics()