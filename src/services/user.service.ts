import { UploadedFile } from "express-fileupload";

import { FileItemTypeEnum } from "../enums/file-item-type.enum";
import { ApiError } from "../errors/api.error";
import { ITokenPayload } from "../interfaces/IToken";
import { IUser, IUserListQuery, IUserListResponse } from "../interfaces/IUser";
import { userPresenter } from "../presenters/user.presenter";
import { userRepository } from "../repositories/user.repository";
import { s3Service } from "./s3.service";

class UserService {
  public async getUsers(query: IUserListQuery): Promise<IUserListResponse> {
    const [entities, total] = await userRepository.getUsers(query);
    // entities - масив елементів у нас це юзерів
    // total - кількість елементів, у нас це кількість юзерів
    return userPresenter.toListResDto(entities, total, query);
  }

  public async getById(userId: string): Promise<IUser> {
    const user = await userRepository.getById(userId);
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    return user;
  }

  public async getMe(jwtPayload: ITokenPayload): Promise<IUser> {
    const user = await userRepository.getById(jwtPayload.userId);
    if (!user) {
      throw new ApiError("User not found", 404);
    }
    return user;
  }

  public async updateMe(jwtPayload: ITokenPayload, dto: IUser): Promise<IUser> {
    return await userRepository.updateById(jwtPayload.userId, dto);
  }

  public async deleteMe(jwtPayload: ITokenPayload): Promise<void> {
    return await userRepository.deleteById(jwtPayload.userId);
  }

  public async uploadAvatar(
    jwtPayload: ITokenPayload,
    file: UploadedFile,
  ): Promise<IUser> {
    const user = await userRepository.getById(jwtPayload.userId);
    // знаходимо юзера в БД по айді яке забрали з мідлварки з локалсів
    const avatar = await s3Service.uploadFile(
      file,
      FileItemTypeEnum.USER,
      user._id,
    );
    // передаємо в сервіс на завантаження файлу
    const updatedUser = await userRepository.updateById(user._id, { avatar });
    // оновлюємо аватар юзера (або створюємо якщо у нього не було аватару)
    if (user.avatar) {
      await s3Service.deleteFile(user.avatar);
    } // якщо юзер мав аватар, видаляємо його з S3
    return updatedUser; // повертаємо юзера з новим аватаром
  }

  public async deleteAvatar(jwtPayload: ITokenPayload): Promise<IUser> {
    const user = await userRepository.getById(jwtPayload.userId);
    // знаходимо юзера в БД по айді яке забрали з мідлварки з локалсів
    if (user.avatar) {
      await s3Service.deleteFile(user.avatar);
    }
    // якщо у юзера є аватар, то видаляємо його
    return await userRepository.updateById(user._id, { avatar: null });
    // повертаємо юзера з відсутнім аватаром
  }
}

export const userService = new UserService();
