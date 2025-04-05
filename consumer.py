from kafka import KafkaConsumer
import json
import logging
import psycopg2
from psycopg2.extras import execute_batch
import os
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Supabase PostgreSQL connection info
SUPABASE_DB_HOST = os.getenv("SUPABASE_DB_HOST")
SUPABASE_DB_PORT = os.getenv("SUPABASE_DB_PORT", "5432")
SUPABASE_DB_NAME = os.getenv("SUPABASE_DB_NAME", "postgres")
SUPABASE_DB_USER = os.getenv("SUPABASE_DB_USER")
SUPABASE_DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD")
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")  # Direct connection URL if available

# Kafka settings
KAFKA_BOOTSTRAP_SERVERS = 'localhost:9092'
PROCESSED_TWEETS_TOPIC = 'processed_tweets_topic'
PERFORMANCE_METRICS_TOPIC = 'performance_metrics_topic'
CONSUMER_GROUP = 'postgres_consumer_group'

def create_tables(conn):
    """Create necessary tables if they don't exist"""
    try:
        with conn.cursor() as cur:
            # Create tweets table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS tweets (
                    id TEXT PRIMARY KEY,
                    text TEXT,
                    created_at TIMESTAMP,
                    month TEXT,
                    user_id TEXT,
                    lang TEXT,
                    retweet_count INTEGER,
                    reply_count INTEGER,
                    like_count INTEGER,
                    quote_count INTEGER,
                    sentiment TEXT,
                    sentiment_score FLOAT,
                    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            # Create summary tables for analytics
            cur.execute("""
                CREATE TABLE IF NOT EXISTS month_summary (
                    month TEXT PRIMARY KEY,
                    count INTEGER,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            cur.execute("""
                CREATE TABLE IF NOT EXISTS language_summary (
                    lang TEXT PRIMARY KEY,
                    count INTEGER,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            cur.execute("""
                CREATE TABLE IF NOT EXISTS sentiment_summary (
                    sentiment TEXT PRIMARY KEY,
                    count INTEGER,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            # Create performance comparison table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS performance (
                    id SERIAL PRIMARY KEY,
                    execution_type TEXT,
                    processing_time FLOAT,
                    records_per_second FLOAT,
                    accuracy FLOAT,
                    batch_id TEXT,
                    records_processed INTEGER,
                    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            
            conn.commit()
            logger.info("Database tables created successfully")
            
    except Exception as e:
        logger.error(f"Error creating tables: {e}")
        conn.rollback()

def connect_to_database():
    """Connect to PostgreSQL database"""
    try:
        # Try to connect using direct URL if available
        if SUPABASE_DB_URL:
            logger.info(f"Connecting using DB URL")
            conn = psycopg2.connect(SUPABASE_DB_URL)
        else:
            # Connect using separate parameters
            conn = psycopg2.connect(
                host=SUPABASE_DB_HOST,
                port=SUPABASE_DB_PORT,
                dbname=SUPABASE_DB_NAME,
                user=SUPABASE_DB_USER,
                password=SUPABASE_DB_PASSWORD
            )
        
        logger.info("Connected to PostgreSQL database")
        return conn
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        raise

def store_tweets(conn, tweets):
    """Store tweets in PostgreSQL database"""
    try:
        with conn.cursor() as cur:
            # Prepare tweets data
            tweets_data = [(
                tweet['id'],
                tweet['text'],
                tweet['created_at'],
                tweet['month'],
                tweet['user']['id'],
                tweet['lang'],
                tweet.get('retweet_count', 0),
                tweet.get('reply_count', 0),
                tweet.get('like_count', 0),
                tweet.get('quote_count', 0),
                tweet.get('sentiment', 'neutral'),
                tweet.get('sentiment_score', 0.0)
            ) for tweet in tweets]
            
            # Insert tweets with upsert (update on conflict)
            execute_batch(cur, """
                INSERT INTO tweets (
                    id, text, created_at, month, user_id, lang,
                    retweet_count, reply_count, like_count, quote_count,
                    sentiment, sentiment_score
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    text = EXCLUDED.text,
                    retweet_count = EXCLUDED.retweet_count,
                    reply_count = EXCLUDED.reply_count,
                    like_count = EXCLUDED.like_count,
                    quote_count = EXCLUDED.quote_count,
                    sentiment = EXCLUDED.sentiment,
                    sentiment_score = EXCLUDED.sentiment_score,
                    processed_at = CURRENT_TIMESTAMP
            """, tweets_data)
            
            # Update summary tables
            # Months
            cur.execute("""
                INSERT INTO month_summary (month, count, last_updated)
                SELECT month, COUNT(*), CURRENT_TIMESTAMP
                FROM tweets
                GROUP BY month
                ON CONFLICT (month) DO UPDATE SET
                    count = EXCLUDED.count,
                    last_updated = CURRENT_TIMESTAMP
            """)
            
            # Languages
            cur.execute("""
                INSERT INTO language_summary (lang, count, last_updated)
                SELECT lang, COUNT(*), CURRENT_TIMESTAMP
                FROM tweets
                GROUP BY lang
                ON CONFLICT (lang) DO UPDATE SET
                    count = EXCLUDED.count,
                    last_updated = CURRENT_TIMESTAMP
            """)
            
            # Sentiment
            cur.execute("""
                INSERT INTO sentiment_summary (sentiment, count, last_updated)
                SELECT sentiment, COUNT(*), CURRENT_TIMESTAMP
                FROM tweets
                GROUP BY sentiment
                ON CONFLICT (sentiment) DO UPDATE SET
                    count = EXCLUDED.count,
                    last_updated = CURRENT_TIMESTAMP
            """)
            
            conn.commit()
            logger.info(f"Stored {len(tweets)} tweets in database")
            
    except Exception as e:
        logger.error(f"Error storing tweets: {e}")
        conn.rollback()

def store_performance_metrics(conn, metrics):
    """Store performance metrics in PostgreSQL database"""
    try:
        with conn.cursor() as cur:
            # Prepare performance metrics data
            performance_data = [(
                metric['execution_type'],
                metric['processing_time'],
                metric['records_per_second'],
                metric['accuracy'],
                metric['batch_id'],
                metric['records_processed']
            ) for metric in metrics]
            
            # Insert performance metrics
            execute_batch(cur, """
                INSERT INTO performance (
                    execution_type, processing_time, records_per_second, 
                    accuracy, batch_id, records_processed
                ) VALUES (%s, %s, %s, %s, %s, %s)
            """, performance_data)
            
            conn.commit()
            logger.info(f"Stored {len(metrics)} performance metrics in database")
            
    except Exception as e:
        logger.error(f"Error storing performance metrics: {e}")
        conn.rollback()

def main():
    try:
        # Connect to PostgreSQL
        conn = connect_to_database()
        
        # Create tables if they don't exist
        create_tables(conn)
        
        # Initialize Kafka consumer for processed tweets
        tweets_consumer = KafkaConsumer(
            PROCESSED_TWEETS_TOPIC,
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            group_id=f"{CONSUMER_GROUP}_tweets",
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            value_deserializer=lambda x: json.loads(x.decode('utf-8')),
            max_poll_interval_ms=300000,  # 5 minutes
            max_poll_records=100
        )
        
        # Initialize Kafka consumer for performance metrics
        performance_consumer = KafkaConsumer(
            PERFORMANCE_METRICS_TOPIC,
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            group_id=f"{CONSUMER_GROUP}_performance",
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            value_deserializer=lambda x: json.loads(x.decode('utf-8')),
            max_poll_interval_ms=300000,  # 5 minutes
            max_poll_records=100
        )
        
        logger.info(f"Kafka consumers started. Listening to topics: {PROCESSED_TWEETS_TOPIC}, {PERFORMANCE_METRICS_TOPIC}")
        
        # Process tweets in a separate thread
        from threading import Thread
        
        def process_tweets():
            # Process messages in batches
            batch_size = 50
            tweets_batch = []
            
            for message in tweets_consumer:
                try:
                    tweet = message.value
                    tweets_batch.append(tweet)
                    
                    # Process in batches for efficiency
                    if len(tweets_batch) >= batch_size:
                        store_tweets(conn, tweets_batch)
                        tweets_batch = []
                        
                except Exception as e:
                    logger.error(f"Error processing tweet message: {e}")
                    
                # Simulate some delay to prevent overloading (for development only)
                time.sleep(0.01)
                
            # Process any remaining tweets
            if tweets_batch:
                store_tweets(conn, tweets_batch)
        
        def process_performance():
            # Process messages in batches
            batch_size = 1
            metrics_batch = []
            
            for message in performance_consumer:
                try:
                    metric = message.value
                    metrics_batch.append(metric)
                    
                    # Process in batches for efficiency
                    if len(metrics_batch) >= batch_size:
                        store_performance_metrics(conn, metrics_batch)
                        metrics_batch = []
                        
                except Exception as e:
                    logger.error(f"Error processing performance message: {e}")
                    
                # Simulate some delay to prevent overloading (for development only)
                time.sleep(0.01)
                
            # Process any remaining metrics
            if metrics_batch:
                store_performance_metrics(conn, metrics_batch)
        
        # Start processing threads
        tweets_thread = Thread(target=process_tweets)
        performance_thread = Thread(target=process_performance)
        
        tweets_thread.daemon = True
        performance_thread.daemon = True
        
        tweets_thread.start()
        performance_thread.start()
        
        # Keep main thread running
        while True:
            time.sleep(1)
                
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
    finally:
        # Clean up resources
        if 'tweets_consumer' in locals():
            tweets_consumer.close()
            logger.info("Tweets consumer closed")
            
        if 'performance_consumer' in locals():
            performance_consumer.close()
            logger.info("Performance consumer closed")
            
        if 'conn' in locals() and conn:
            conn.close()
            logger.info("Database connection closed")

if __name__ == "__main__":
    main()