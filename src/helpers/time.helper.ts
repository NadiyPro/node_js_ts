import dayjs, { ManipulateType } from "dayjs";

class TimeHelper {
  public subtractByParams(value: number, unit: ManipulateType): Date {
    return dayjs().subtract(value, unit).toDate();
    //віднімемо (subtract) від нашого теперішнього часу,
    // витягнути нами через парсинг (parseConfigString) кількість (value) днів (unit):
    // dayjs().subtract(value, unit).toDate();
  }

  public parseConfigString(string: string): {
    value: number;
    unit: ManipulateType;
  } {
    const [value, unit] = string.split(" ");
    // string.split(" ") - метод розбиває рядок на масив підрядків,
    // використовуючи пробіл як розділювач.
    //Масив має два елементи: "10"(value) і "days"(unit).
    // Щоб отримати ці значення в окремі змінні,
    // ми використовуємо деструктуризацію,
    // тобто одразу деструктуруємо наш масив через - [value, unit]
    return { value: parseInt(value), unit: unit as ManipulateType };
    // parseInt(value): Ця функція перетворює рядок,
    // що містить число, на ціле число (типу number).
  }
}

export const timeHelper = new TimeHelper();
