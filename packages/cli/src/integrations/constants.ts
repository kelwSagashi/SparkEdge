import dotenv from 'dotenv';
dotenv.config();

// Note: URLs now come from CloudIntegration config (spark-edge.config.yml > .env > defaults).
// Import appConfig lazily to avoid circular init issues.
import { appConfig } from 'spark-edge-core';

/**
 * Spark Cloud REST API URL for provisioning calls.
 * Resolved from: spark-edge.config.yml → SPARK_CLOUD_URL env → default
 */
export const getSparkApiUrl = () => appConfig.cloud.url;

/**
 * Legacy alias kept for backwards compat in older call sites.
 * @deprecated Use getSparkApiUrl() instead.
 */
export const sparkApiUrl = process.env.SPARK_CLOUD_URL;

/**
 * URL of the local Spark Cloud simulation endpoints served by this CLI.
 * Used only for testing the provisioning flow locally.
 */
export const sparkEdgeCloudApiUrl = (process.env.SPARK_EDGE_API_URL || 'http://localhost:3009/api') + '/spark-cloud';
