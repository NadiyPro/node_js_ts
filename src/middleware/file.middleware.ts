import { NextFunction, Request, Response } from "express";
import { UploadedFile } from "express-fileupload";

import { ApiError } from "../errors/api.error";

class FileMiddleware {
  public isFileValid(
    key: string,
    config: { avatarSize: number; avatarTypes: string[] },
  ) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const file = req.files?.[key] as UploadedFile;
        // дістаємо файл якщо він в нас є по ключу,
        // який передається сюди з роуту, в нас це "avatar"
        if (!file) {
          throw new ApiError("File not found", 400);
        }
        // якщо файла немає, то видаємо помилку
        if (file.size > config.avatarSize) {
          throw new ApiError("File is too big", 400);
        }
        // якщо розмір буде більший ніж size прописаний в avatarSize - то видаватимемо помилку
        if (!config.avatarTypes.includes(file.mimetype)) {
          throw new ApiError("Invalid file type", 400);
        }
        // якщо всередині наших дозволених avatarTypes (прописаних в constans) немає mimetype (розширення),
        // того який нам прийшов у файлі, то ми будемо викидувати помилку
        // де  includes() - використовується для перевірки чи містить масив певний елемент
        next();
      } catch (e) {
        next(e);
      }
    };
  }
}

export const fileMiddleware = new FileMiddleware();
