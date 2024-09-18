// import fs from "node:fs/promises";
// import path from "node:path";
//
// import { IUser } from "../interfaces/IUser";
//
// const read = async (): Promise<void> => {
//   try {
//     await fs.readFile(path.join(process.cwd(), "users.json"), "utf-8"); // зчитуємо одразу в норм форматі utf-8
//   } catch (e) {
//     console.log("Read error", e.message);
//   }
// };
//
// const write = async (users: IUser[]): Promise<void> => {
//   try {
//     await fs.writeFile(
//       path.join(process.cwd(), "users.json"),
//       JSON.stringify(users, null, 2),
//     ); // Записуємо користувачів у файл
//   } catch (e) {
//     console.log("Write error", e.message);
//   }
// };
//
// export { read, write };
