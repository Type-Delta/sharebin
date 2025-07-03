import { DataSource } from "typeorm";

import config from "../config";

const mongodb = new DataSource({
   type: "mongodb",
   host: config.databases.mongodb.host,
   port: config.databases.mongodb.port,
   database: config.databases.mongodb.dbName,
   username: config.databases.mongodb.username,
   password: config.databases.mongodb.password,
   synchronize: false,
   logging: true,
   entities: [
      __dirname + "/entity/*.entity.ts"
   ],
});

export default {
   mongodb: mongodb,
   connect: async () => {
      try {
         await mongodb.initialize();
         console.log("Datasources connected successfully.");
      } catch (error) {
         console.error("Error connecting to Datasources:", error);
         throw error;
      }
   },
   close: async () => {
      try {
         await mongodb.destroy();
         console.log("Datasources connection closed.");
      } catch (error) {
         console.error("Error closing Datasources connection:", error);
      }
   },
}
