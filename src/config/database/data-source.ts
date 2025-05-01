import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const dataSourceOptions: DataSourceOptions = {
  host: process.env.DB_HOST,
  type: 'postgres',
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/entity/*.entity.js'],
};


const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
