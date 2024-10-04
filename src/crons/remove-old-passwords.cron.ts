import { CronJob } from "cron";

import { timeHelper } from "../helpers/time.helper";
import { oldPasswordRepository } from "../repositories/old-password.repository";

const handler = async () => {
  try {
    const date = timeHelper.subtractByParams(90, "day");
    // віднімемо (subtract) від нашого теперішнього часу 90 днів

    const deletedCount = await oldPasswordRepository.deleteManyByParams({
      createdAt: { $lt: date },
    });
    console.log(`Deleted ${deletedCount} old passwords`);
  } catch (error) {
    console.error(error);
  }
  // видаляємо старі паролі з БД старше 90 днів,
  // та у відповідь отримуємо кількість видалених токенів deletedCount
  // де, createdAt - дата створення, $lte - означає менше (детальніше mongoDB lesson1)
};

export const removeOldPasswordsCronJob = new CronJob("*/5 * * * 8 *", handler);
