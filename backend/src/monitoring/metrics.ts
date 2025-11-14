/**
 * Prometheus Metrics Configuration
 * 
 * Provides monitoring and observability metrics for the application
 */

import promClient from 'prom-client';

// Create a Registry
export const register = new promClient.Registry();

// Add default metrics (CPU, Memory, etc.)
promClient.collectDefaultMetrics({ register });

// HTTP Request Duration Histogram
export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

// HTTP Request Counter
export const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Active Connections Gauge
export const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
});

// Database Query Duration Histogram
export const dbQueryDuration = new promClient.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
});

// Error Counter
export const errorCounter = new promClient.Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity'],
});

// Register all metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestCounter);
register.registerMetric(activeConnections);
register.registerMetric(dbQueryDuration);
register.registerMetric(errorCounter);

/**
 * Middleware to track HTTP request metrics
 */
export const metricsMiddleware = (req: any, res: any, next: any): void => {
  const start = Date.now();
  
  // Increment active connections
  activeConnections.inc();
  
  // Track request completion
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      duration
    );
    
    httpRequestCounter.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
    
    // Decrement active connections
    activeConnections.dec();
  });
  
  next();
};

/**
 * Track database query metrics
 */
export const trackDbQuery = async <T>(
  operation: string,
  table: string,
  queryFn: () => Promise<T>
): Promise<T> => {
  const start = Date.now();
  
  try {
    const result = await queryFn();
    const duration = (Date.now() - start) / 1000;
    
    dbQueryDuration.observe({ operation, table }, duration);
    
    return result;
  } catch (error) {
    errorCounter.inc({ type: 'database', severity: 'error' });
    throw error;
  }
};

/**
 * Track errors
 */
export const trackError = (type: string, severity: 'error' | 'warning'): void => {
  errorCounter.inc({ type, severity });
};
