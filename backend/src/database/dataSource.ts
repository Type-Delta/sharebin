import { DataSource } from "typeorm";

import config from "../config";
import { sendConsoleOutput } from "../utilities";

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
         sendConsoleOutput(
            `Connected to MongoDB at ${config.databases.mongodb.host}:${config.databases.mongodb.port}`,
            'normal', 'MongoDB'
         );
      } catch (error) {
         sendConsoleOutput(
            "Error connecting to Datasources:",
            'normal', 'MongoDB'
         );
         throw error;
      }
   },
   disconnect: async () => {
      try {
         await mongodb.destroy();
         sendConsoleOutput(
            "Datasources connection closed.",
            'normal', 'MongoDB'
         );
      } catch (error) {
         sendConsoleOutput(
            "Error closing Datasources connection:",
            'normal', 'MongoDB'
         );
      }
   },
}
