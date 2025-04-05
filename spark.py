from pyspark.sql import SparkSession
from pyspark.sql.functions import *
from pyspark.sql.types import StructType, StructField, StringType, IntegerType, ArrayType, FloatType
import json
import logging
import os
import time

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Define schema for tweets
tweet_schema = StructType([
    StructField("id", StringType(), True),
    StructField("text", StringType(), True),
    StructField("created_at", StringType(), True),
    StructField("month", StringType(), True),  # Added month field
    StructField("user", StructType([
        StructField("id", StringType(), True),
        StructField("username", StringType(), True),
        StructField("followers_count", IntegerType(), True),
        StructField("friends_count", IntegerType(), True),
        StructField("verified", StringType(), True)
    ]), True),
    StructField("lang", StringType(), True),
    StructField("retweet_count", IntegerType(), True),
])

# Function to process a batch of tweets in streaming mode
def process_batch(df, batch_id):
    try:
        # Start timing for performance measurement
        start_time = time.time()
        
        # Count by month
        month_counts = df.groupBy("month").count().orderBy("month")
        
        # Count by language
        lang_counts = df.groupBy("lang").count()
        
        # Calculate sentiment (simplified version)
        df_with_sentiment = df.withColumn("sentiment", 
            when(array_contains(split(lower(col("text")), " "), "good"), "positive")
            .when(array_contains(split(lower(col("text")), " "), "great"), "positive")
            .when(array_contains(split(lower(col("text")), " "), "awesome"), "positive")
            .when(array_contains(split(lower(col("text")), " "), "bad"), "negative")
            .when(array_contains(split(lower(col("text")), " "), "awful"), "negative")
            .when(array_contains(split(lower(col("text")), " "), "terrible"), "negative")
            .otherwise("neutral"))
            
        # Count by sentiment
        sentiment_counts = df_with_sentiment.groupBy("sentiment").count()
        
        # Track performance metrics
        records_processed = df.count()
        processing_time = time.time() - start_time
        records_per_second = records_processed / processing_time if processing_time > 0 else 0
        
        # Show results
        logger.info(f"Batch {batch_id} - Months:")
        month_counts.show(truncate=False)
        
        logger.info(f"Batch {batch_id} - Languages:")
        lang_counts.show(5, truncate=False)
        
        logger.info(f"Batch {batch_id} - Sentiment:")
        sentiment_counts.show(truncate=False)
        
        logger.info(f"Batch {batch_id} - Performance Metrics:")
        logger.info(f"  Records processed: {records_processed}")
        logger.info(f"  Processing time: {processing_time:.2f} seconds")
        logger.info(f"  Records per second: {records_per_second:.2f}")
        
        # Create performance metrics dataframe
        performance_metrics = df.sparkSession.createDataFrame([
            (
                "streaming", 
                processing_time, 
                records_per_second, 
                100.0,  # Assuming 100% accuracy for streaming
                batch_id,
                records_processed
            )
        ], ["execution_type", "processing_time", "records_per_second", "accuracy", "batch_id", "records_processed"])
        
        # Convert to format for Kafka
        processed_df = df_with_sentiment.withColumn(
            "sentiment_score", 
            when(col("sentiment") == "positive", 1.0)
            .when(col("sentiment") == "negative", -1.0)
            .otherwise(0.0))
        
        # Add performance metrics to Kafka
        performance_metrics.selectExpr(
            "to_json(struct(*)) AS value"
        ).write \
        .format("kafka") \
        .option("kafka.bootstrap.servers", "localhost:9092") \
        .option("topic", "performance_metrics_topic") \
        .save()
        
        # Write processed data to Kafka
        processed_df.selectExpr(
            "to_json(struct(*)) AS value"
        ).write \
        .format("kafka") \
        .option("kafka.bootstrap.servers", "localhost:9092") \
        .option("topic", "processed_tweets_topic") \
        .save()
        
        logger.info(f"Batch {batch_id} - Data written to Kafka topic 'processed_tweets_topic'")
        logger.info(f"Batch {batch_id} - Performance metrics written to Kafka topic 'performance_metrics_topic'")
        
    except Exception as e:
        logger.error(f"Error processing batch {batch_id}: {e}")

def batch_process_tweets(spark):
    """Process tweets in batch mode for comparison"""
    try:
        # Start timing for performance measurement
        start_time = time.time()
        
        # Read processed tweets from Kafka
        df = spark.read \
            .format("kafka") \
            .option("kafka.bootstrap.servers", "localhost:9092") \
            .option("subscribe", "processed_tweets_topic") \
            .option("startingOffsets", "earliest") \
            .option("endingOffsets", "latest") \
            .load()
        
        # Parse Kafka messages
        parsed_df = df.select(
            from_json(col("value").cast("string"), tweet_schema).alias("tweet")
        ).select("tweet.*")
        
        # Cache the dataframe
        cached_df = parsed_df.cache()
        
        # Count records
        records_processed = cached_df.count()
        
        # Count by month
        month_counts = cached_df.groupBy("month").count().orderBy("month")
        
        # Count by language
        lang_counts = cached_df.groupBy("lang").count()
        
        # Calculate sentiment
        df_with_sentiment = cached_df.withColumn("sentiment", 
            when(array_contains(split(lower(col("text")), " "), "good"), "positive")
            .when(array_contains(split(lower(col("text")), " "), "great"), "positive")
            .when(array_contains(split(lower(col("text")), " "), "awesome"), "positive")
            .when(array_contains(split(lower(col("text")), " "), "bad"), "negative")
            .when(array_contains(split(lower(col("text")), " "), "awful"), "negative")
            .when(array_contains(split(lower(col("text")), " "), "terrible"), "negative")
            .otherwise("neutral"))
            
        # Count by sentiment
        sentiment_counts = df_with_sentiment.groupBy("sentiment").count()
        
        # Show results
        logger.info("Batch Execution - Months:")
        month_counts.show(truncate=False)
        
        logger.info("Batch Execution - Languages:")
        lang_counts.show(5, truncate=False)
        
        logger.info("Batch Execution - Sentiment:")
        sentiment_counts.show(truncate=False)
        
        # Calculate performance metrics
        processing_time = time.time() - start_time
        records_per_second = records_processed / processing_time if processing_time > 0 else 0
        
        logger.info("Batch Execution - Performance Metrics:")
        logger.info(f"  Records processed: {records_processed}")
        logger.info(f"  Processing time: {processing_time:.2f} seconds")
        logger.info(f"  Records per second: {records_per_second:.2f}")
        
        # Create performance metrics dataframe
        performance_metrics = spark.createDataFrame([
            (
                "batch", 
                processing_time, 
                records_per_second, 
                99.0,  # Slightly lower accuracy for batch (example)
                "batch_full",
                records_processed
            )
        ], ["execution_type", "processing_time", "records_per_second", "accuracy", "batch_id", "records_processed"])
        
        # Write performance metrics to Kafka
        performance_metrics.selectExpr(
            "to_json(struct(*)) AS value"
        ).write \
        .format("kafka") \
        .option("kafka.bootstrap.servers", "localhost:9092") \
        .option("topic", "performance_metrics_topic") \
        .save()
        
        logger.info("Batch Execution - Performance metrics written to Kafka topic 'performance_metrics_topic'")
        
        # Uncache the dataframe
        cached_df.unpersist()
        
        return True
    
    except Exception as e:
        logger.error(f"Error in batch processing: {e}")
        return False

def create_spark_session():
    # Download Spark Kafka package if not exists
    os.environ['PYSPARK_SUBMIT_ARGS'] = '--packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.1.2 pyspark-shell'
    
    # Create Spark session
    spark = SparkSession.builder \
        .appName("TwitterStreaming") \
        .master("local[*]") \
        .config("spark.streaming.stopGracefullyOnShutdown", "true") \
        .getOrCreate()
    
    # Set log level
    spark.sparkContext.setLogLevel("WARN")
    
    return spark

def main():
    try:
        # Create Spark session
        spark = create_spark_session()
        
        # Define streaming DataFrame reading from Kafka
        df = spark \
            .readStream \
            .format("kafka") \
            .option("kafka.bootstrap.servers", "localhost:9092") \
            .option("subscribe", "tweets_topic") \
            .option("startingOffsets", "latest") \
            .load()
        
        # Parse Kafka messages
        parsed_df = df.select(
            from_json(col("value").cast("string"), tweet_schema).alias("tweet")
        ).select("tweet.*")
        
        # Process each batch
        query = parsed_df \
            .writeStream \
            .foreachBatch(process_batch) \
            .outputMode("update") \
            .trigger(processingTime="30 seconds") \
            .start()
        
        logger.info("Spark Streaming started. Waiting for termination...")
        
        # Wait for some time to accumulate data
        time.sleep(60)  # Wait for 1 minute
        
        # Process in batch mode
        logger.info("Starting batch processing for comparison...")
        batch_process_tweets(spark)
        
        # Continue streaming
        query.awaitTermination()
        
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
    finally:
        if 'spark' in locals():
            spark.stop()
            logger.info("Spark session stopped")

if __name__ == "__main__":
    main()