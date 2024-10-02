import { CronJob } from "cron";

import { config } from "../config/configs";
import { timeHelper } from "../helpers/time.helper";
import { tokenRepository } from "../repositories/token.repository";

const handler = async () => {
  try {
    const { value, unit } = timeHelper.parseConfigString(
      config.JWT_REFRESH_EXPIRATION,
    );
    // розпарсюємо (метод string.split(" ")) стрічку JWT_REFRESH_EXPIRATION "10 days",
    // та витягаємо окремо значення value = 10, та unit = days,
    // щоб можна було зробити потім розрахунок

    const date = timeHelper.subtractByParams(value, unit);
    // //віднімемо (subtract) від нашого теперішнього часу,
    // витягнути нами через парсинг (parseConfigString) кількість (value) днів (unit)
    const deletedCount = await tokenRepository.deleteBeforeDate(date);
    // видаляємо токени з БД старше 10 днів
    console.log(`Deleted ${deletedCount} old tokens`);
  } catch (error) {
    console.error(error);
  }
};

export const removeOldTokensCronJob = new CronJob("0,20,40 * * * * *", handler);
//  cron яка буде комунікувати з нашою БД та видаляти з неї старі токени
