import { CronJob } from "cron";

const handler = async () => {
  console.log("TestCron is running");
};
// функцію, яка виконується тоді, коли наступає зазначений нами час

export const testCronJob = new CronJob("* 1 * * * *", handler);
// те що в нас знаходиться у функції має виконуватись кожну 1 хвилину
// перша цифра - це секунди, друга - хвилини, третя - години,
// четверта - дні місяця, пята - місяці, шоста - дні тижня
// ще можна скористатися gpt або https://crontab.guru/
