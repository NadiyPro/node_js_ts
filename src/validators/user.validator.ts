import joi from "joi";

import { regexConstant } from "../constants/regex.constant";
import {OrderEnum} from "../enums/order.enum";
import {UserListOrderByEnum} from "../enums/user-list-order-by.enum";

export class UserValidator {
  private static name = joi.string().min(3).max(20).trim();
  private static age = joi.number().min(18).max(120);
  private static email = joi
    .string()
    .lowercase()
    .trim()
    .regex(regexConstant.EMAIL);
  private static password = joi.string().trim().regex(regexConstant.PASSWORD);
  private static phone = joi.string().trim().regex(regexConstant.PHONE);

  public static create = joi.object({
    name: this.name.required(),
    age: this.age.required(),
    email: this.email.required(),
    password: this.password.required(),
    phone: this.phone,
  });

  public static update = joi.object({
    name: this.name,
    age: this.age,
    email: this.email,
    password: this.password,
    phone: this.phone,
  });

  public static signIn = joi.object({
    email: this.email.required(),
    password: this.password.required(),
  });

  public static changePassword = joi.object({
    oldPassword: this.password.required(),
    password: this.password.required(),
  });

  public static listQuery = joi.object({
    limit: joi.number().min(1).max(100).default(10), // ліміт від 1 до 100, по дефолту 10
    page: joi.number().min(1).default(1),
    search: joi.string().trim().lowercase(), // стрінга без пробілів, всі маленькі літери
    order: joi.string().valid(...Object.values(OrderEnum)),
    // стрінга сортування по ASC (від а-я) або DESC (від я-а)
    orderBy: joi.string().valid(...Object.values(UserListOrderByEnum)),
    // стрінга, по яким полям ми даємо можливість викновуати сортування
  });
}
