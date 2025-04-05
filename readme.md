# Twitter Analytics Pipeline

<p align="center">
  <img src="https://img.shields.io/badge/Kafka-231F20?style=for-the-badge&logo=apache-kafka&logoColor=white" alt="Kafka"/>
  <img src="https://img.shields.io/badge/Apache_Spark-FFFFFF?style=for-the-badge&logo=apachespark&logoColor=#E35A16" alt="Spark"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue" alt="Python"/>
</p>

A complete data pipeline for processing Twitter data in real-time. This project reads tweets from a CSV dataset (or Twitter API), processes them using Kafka and Spark, stores the results in PostgreSQL (Supabase), and visualizes the data through a Next.js dashboard.

## 📋 Table of Contents
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Step-by-Step Guide](#step-by-step-guide)
- [Project Structure](#project-structure)
- [Dashboard Features](#dashboard-features)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

![Twitter Analytics Pipeline Architecture](/assets/architecture-diagram.svg)

![Streaming vs Batch Processing](/assets/streaming-vs-batch-diagram.svg)


The pipeline consists of the following components:
- **Data Source**: CSV file with tweet data (or Twitter API in production)
- **Message Broker**: Apache Kafka for handling streaming data
- **Stream Processing**: Apache Spark for real-time data analysis
- **Storage**: PostgreSQL database (hosted on Supabase)
- **Visualization**: Next.js web dashboard

## 📋 Prerequisites

- Python 3.8+
- Node.js 14+
- Docker and Docker Compose
- Supabase account (or local PostgreSQL)

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vrashankshetty/twitter-analytics-pipeline.git
   cd twitter-analytics-pipeline
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up the Next.js dashboard:
   ```bash
   cd twitter-analytics-dashboard
   npm install
   cd ..
   ```

5. Create a `.env` file in the project root with your Supabase credentials:
   ```
   SUPABASE_DB_HOST=your-supabase-host.supabase.co
   SUPABASE_DB_PORT=5432
   SUPABASE_DB_NAME=postgres
   SUPABASE_DB_USER=postgres
   SUPABASE_DB_PASSWORD=your-supabase-db-password
   SUPABASE_DB_URL=url
   ```

6. Create a `.env.local` file in the `twitter-analytics-dashboard` directory:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## 🚀 Step-by-Step Guide

### 1. Start Kafka and Zookeeper

```bash
docker-compose up -d
```

This command starts Kafka, Zookeeper, and Kafka UI in Docker containers.

You can access the Kafka UI at [http://localhost:8080](http://localhost:8080) to monitor topics and messages.

### 2. Create Kafka Topics

```bash
source venv/bin/activate 
python kafka_topic_setup.py
```

This script creates the necessary Kafka topics:
- `tweets_topic` for raw tweets
- `processed_tweets_topic` for processed tweet data

### 3. Load Tweet Data into Kafka

```bash
python producer.py
```

This script reads the `twitter_dataset.csv` file and sends the tweets to Kafka, simulating a real-time stream.

### 4. Start Spark Streaming

Open a new terminal (keep the previous one running):

```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
python spark.py
```

This script processes the tweets from Kafka using Spark Streaming, performing:
- Language detection
- Month analysis
- Sentiment analysis
- Tweet metrics calculation

### 5. Start Kafka to PostgreSQL Consumer

Open another terminal:

```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
python consumer.py
```

This script reads processed data from Kafka and stores it in the PostgreSQL database.

### 6. Start the Next.js Dashboard

Open another terminal:

```bash
cd twitter-analytics-dashboard
npm run dev
```

The dashboard will be available at [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

```
twitter-analytics-pipeline/
├── docker-compose.yml         # Docker configuration for Kafka and Zookeeper
├── .env                       # Environment variables for the backend
├── requirements.txt           # Python dependencies
├── kafka_topic_setup.py             # Script to set up Kafka topics
├── producer.py            # Script to load tweets from CSV to Kafka
├── spark.py         # Spark Streaming processor
├── consumer.py          # Script to store processed tweets in PostgreSQL
├── twitter_dataset.csv        # Sample tweet dataset
└── twitter-analytics-dashboard/ # Next.js dashboard
    ├── components/            # React components
    ├── pages/                 # Next.js pages
    ├── public/                # Static assets
    ├── styles/                # CSS styles
    ├── lib/                   # Utility functions
    └── .env.local             # Environment variables for Next.js
```

## 📊 Dashboard Features

The dashboard provides:
- Real-time tweet count
- Language distribution
- Monthwise tweet distribution
- Sentiment analysis
- Tweet volume over time
- Recent tweets list


