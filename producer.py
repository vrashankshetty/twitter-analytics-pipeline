import json
import time
import logging
import os
import pandas as pd
from kafka import KafkaProducer
from datetime import datetime
import random

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Kafka settings
KAFKA_BOOTSTRAP_SERVERS = 'localhost:9092'
KAFKA_TOPIC = 'tweets_topic'
CSV_FILE = 'twitter_dataset.csv'

def process_csv_to_kafka(csv_file, producer, topic, batch_size=5000, delay=0.1):
    """
    Read tweets from CSV file and send to Kafka
    
    Args:
        csv_file (str): Path to CSV file
        producer (KafkaProducer): Kafka producer instance
        topic (str): Kafka topic to send tweets to
        batch_size (int): Number of tweets to process
        delay (float): Delay between sending tweets (simulates real-time)
    """
    try:
        # Check if file exists
        if not os.path.exists(csv_file):
            logger.error(f"CSV file not found: {csv_file}")
            return False
        
        # Read CSV file
        logger.info(f"Reading CSV file: {csv_file}")
        df = pd.read_csv(csv_file)
        
        # Check required columns
        required_columns = ['Tweet_ID', 'Username', 'Text', 'Timestamp']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            logger.error(f"Missing required columns in CSV: {missing_columns}")
            return False
        
        logger.info(f"Found {len(df)} tweets in CSV file")
        
        # Process tweets
        count = 0
        for _, row in df.iterrows():
            # Limit the number of processed tweets
            if count >= batch_size:
                logger.info(f"Reached batch size limit of {batch_size} tweets")
                break
                
            try:
                # Extract data from CSV
                tweet_id = str(row['Tweet_ID'])
                username = row['Username']
                text = row['Text']
                timestamp = row['Timestamp']
                
                # Handle optional columns
                retweets = int(row['Retweets']) if 'Retweets' in df.columns and not pd.isna(row['Retweets']) else 0
                likes = int(row['Likes']) if 'Likes' in df.columns and not pd.isna(row['Likes']) else 0
                
                # Parse timestamp (specifically for format: 2023-01-02 22:45:58)
                try:
                    if isinstance(timestamp, str):
                        tweet_timestamp = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
                    else:
                        # If not a string, use current time
                        tweet_timestamp = datetime.now()
                except Exception as e:
                    logger.warning(f"Error parsing timestamp {timestamp}: {e}")
                    tweet_timestamp = datetime.now()
                
                # Extract month from timestamp for analysis
                month = tweet_timestamp.strftime('%Y-%m')
                
                # Generate random language for demo purposes
                langs = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja']
                lang = random.choice(langs)
                
                # Prepare tweet data
                tweet_data = {
                    "id": tweet_id,
                    "text": text,
                    "created_at": tweet_timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                    "month": month,  # Add month for easier aggregation
                    "user": {
                        "id": f"user_{count}",  # Generate a fake user ID
                        "username": username,
                        "followers_count": random.randint(10, 10000),
                        "friends_count": random.randint(10, 1000),
                        "verified": random.choice([True, False])
                    },
                    "lang": lang,
                    "retweet_count": retweets,
                    "reply_count": random.randint(0, 50),  # Random reply count
                    "like_count": likes,
                    "quote_count": random.randint(0, 20),  # Random quote count
                    "hashtags": []  # Empty list since we don't have hashtags in the dataset
                }
                
                # Send to Kafka
                producer.send(topic, tweet_data)
                logger.info(f"Sent tweet to Kafka: {tweet_id} from month {month}")
                
                # Count tweets
                count += 1
                
                # Simulate real-time by adding delay
                # time.sleep(delay)
                
            except Exception as e:
                logger.error(f"Error processing tweet: {e}")
        
        # Wait for any outstanding messages to be delivered
        producer.flush()
        logger.info(f"Successfully processed {count} tweets from CSV file")
        return True
        
    except Exception as e:
        logger.error(f"Error processing CSV: {e}")
        return False

def main():
    try:
        # Initialize Kafka producer with proper serializer for dictionaries
        producer = KafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        
        logger.info(f"Connected to Kafka at {KAFKA_BOOTSTRAP_SERVERS}")
        
        # Process CSV file
        process_csv_to_kafka(CSV_FILE, producer, KAFKA_TOPIC)
                
    except Exception as e:
        logger.error(f"Error in main: {e}")
    finally:
        # Close Kafka producer
        if 'producer' in locals():
            producer.close()
        logger.info("Kafka producer closed")

if __name__ == "__main__":
    main()