import { removeOldTokensCronJob } from "./remove-old-tokens.cron";
import { testCronJob } from "./test.cron";

export const cronRunner = () => {
  testCronJob.start();
  removeOldTokensCronJob.start();
};
// файл “index.ts” треба тут, щоб зводити / запускати всі крони
