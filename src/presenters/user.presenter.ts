import { config } from "../config/configs";
import { IUser, IUserListQuery, IUserListResponse } from "../interfaces/IUser";

class UserPresenter {
  toPublicResDto(entity: IUser) {
    return {
      _id: entity._id,
      name: entity.name,
      email: entity.email,
      age: entity.age,
      role: entity.role,
      avatar: entity.avatar
        ? `${config.AWS_S3_ENDPOINT}/${entity.avatar}`
        : null,
      // avatar: Формує повний URL для аватара користувача,
      // використовуючи шлях до AWS S3
      // якщо в об'єкта користувача є аватар,
      // то його URL буде сформовано за допомогою S3 кінцевої точки,
      // якщо ні, то буде null.
      isDeleted: entity.isDeleted,
      isVerified: entity.isVerified,
    };
  }
  // toPublicResDto - цей метод приймає як аргумент об'єкт entity,
  // який є користувачем (user).
  // Він повертає новий об'єкт, лише ті поля,
  // які повинні бути доступними для публічного використання.

  public toListResDto(
    entities: IUser[],
    total: number,
    query: IUserListQuery,
  ): IUserListResponse {
    return {
      data: entities.map(this.toPublicResDto),
      //повертаємо промапаних юзерів які відповідають потрібним нам умовам
      total,
      // повртаємо кількість юзерів які підходять під наші умови
      ...query,
      // повертаємо оновлену кверю
    };
  }
}

export const userPresenter = new UserPresenter();
