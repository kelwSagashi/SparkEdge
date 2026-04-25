import dotenv from 'dotenv';
dotenv.config();
export const sparkApiUrl = process.env.SPARK_CLOUD_URL;
export const sparkEdgeCloudApiUrl = process.env.SPARK_EDGE_API_URL + '/spark-cloud';
