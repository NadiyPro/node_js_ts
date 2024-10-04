import { FilterQuery } from "mongoose";

import { IOldPassword } from "../interfaces/old-password.interface";
import { OldPassword } from "../models/old-password.model";

class OldPasswordRepository {
  public async create(dto: IOldPassword): Promise<IOldPassword> {
    return await OldPassword.create(dto); // стіорюємо запис
  }

  public async findByParams(userId: string): Promise<IOldPassword[]> {
    return await OldPassword.find({ _userId: userId }); // шукаємо всі записи які належать юзеру
  }

  public async deleteManyByParams(
    params: FilterQuery<IOldPassword>,
  ): Promise<number> {
    const { deletedCount } = await OldPassword.deleteMany(params);
    return deletedCount;
  } // видаляємо всі токени даного юзера і вказуємо кількість видалених токенів
}

export const oldPasswordRepository = new OldPasswordRepository();
