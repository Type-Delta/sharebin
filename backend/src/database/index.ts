import dataSource from "./dataSource";
import * as controller from "./dataController";

export * from "./entity";


export default {
   connect: dataSource.connect,
   close: dataSource.disconnect,
   repo: controller.repo,
   controller
}

