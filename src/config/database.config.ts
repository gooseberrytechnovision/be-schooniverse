import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: process.env.DB_TYPE as any,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Disable automatic schema synchronization
  logging: true,
  connectTimeout: 30000, // 30 seconds connection timeout
  extra: {
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    query_timeout: 30000, // 30 seconds
    statement_timeout: 30000 // 30 seconds
  },
  pool: {
    max: 20,
    min: 5,
    maxWaitingRequests: 50,
    requestTimeout: 30000,
    idleTimeout: 10000
  }
}; 