import { randomUUID } from "node:crypto";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { UploadedFile } from "express-fileupload";
import path from "path";

import { config } from "../config/configs";
import { FileItemTypeEnum } from "../enums/file-item-type.enum";

class S3Service {
  constructor(
    private readonly client = new S3Client({
      region: config.AWS_S3_REGION,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY,
        secretAccessKey: config.AWS_SECRET_KEY,
      },
    }),
  ) {}
  // вводні дані для ініціалізації нашого файлу,
  // тобто вказуємо у який bucket, регіон,
  // для якого юзера ключ та сікрет ми хочемо завантажувати файли

  public async uploadFile(
    file: UploadedFile,
    // UploadedFile - це вбудований в бібліотеку "express-fileupload") тип для файлів,
    // який містить в собі name, mimetype, data та інше
    itemType: FileItemTypeEnum,
    // вказали в enums тип, де User="user", щоб створити шлях до папки на aws
    itemId: string, // id юзера
  ): Promise<string> {
    try {
      const filePath = this.buildPath(itemType, itemId, file.name);
      // створюємо шлях до файла на aws, опис будови файлу нижче в private buildPath
      await this.client.send(
        new PutObjectCommand({
          Bucket: config.AWS_S3_BUCKET_NAME, // в який bucket завантажуємо
          Key: filePath, // шлях куди завантажувати файл
          Body: file.data, // тіло файлу / сам файл який вантажимо (buffer файлу)
          ContentType: file.mimetype, // розширення файлу
          ACL: config.AWS_S3_ACL, // "public-read" ми можемо публічно читати наші файли
        }),
      );
      return filePath;
    } catch (error) {
      console.error("Error upload: ", error);
    }
  }
  // завантажуємо файл на aws
  // імпортуємо PutObjectCommand з "@aws-sdk/client-s3"
  // PutObjectCommand - це Команда AWS SDK, яка дозволяє завантажити файл до вказаного S3 бакету

  public async deleteFile(filePath: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: config.AWS_S3_BUCKET_NAME,
          Key: filePath, // шлях де знаходиться файл, який ми видаляємо
        }),
      );
    } catch (error) {
      console.error("Error delete: ", error.message);
    }
  }
  // new DeleteObjectCommand — це клас або команда, я
  // ка використовується для видалення об'єкта (файлу) з Amazon S3,
  // якщо ти використовуєш AWS SDK для JavaScript/TypeScript.
  // Вона є частиною пакету @aws-sdk/client-s3
  // приймаємо шлях де лежить наш файл (аватар) filePath,
  // і потім даний обєкт повністю, в т.ч всі паки що прописані в нашому шляху

  private buildPath(
    itemType: FileItemTypeEnum,
    itemId: string,
    fileName: string,
  ): string {
    return `${itemType}/${itemId}/${randomUUID()}${path.extname(fileName)}`;
    //  створюємо шлях до файла на aws itemType = "user",
    // id юзера, генеруємо унікальне їм'я файла за допомогою вбудованого в node.js методу randomUUID,
    // та розширенням файлу (img/png)
    //path.join() тут НЕ використовуємо бо на вінді в нас буде ствити зворотній слеш
  }
}

export const s3Service = new S3Service();
