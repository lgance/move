import App from "./app";
import IndexController from "./controllers/index.controller";
import TestController from "./controllers/testData.controller";
import UploadController from "./controllers/upload.controller";
import TransactionController from "./controllers/transaction.controller";
import InitScriptController from './controllers/initscript.controller';
const app = new App([
  new IndexController(),
  new TestController(),
  new UploadController(),
  new TransactionController(),
  new InitScriptController()
]);
app.listen();
