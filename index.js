const fs = require('node:fs/promises');
const path = require('node:path');

const folders= ['folder1', 'folder2', 'folder3', 'folder4', 'folder5'];
const files = ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt', 'file5.txt'];

(async () => {
    async function createFoldersAndFiles() {
        try {
            const directory = path.join(__dirname, 'baseFolder');
            await fs.mkdir(directory, {recursive: true});

            const folderPromises = folders.map(async (folder) => {
                const folderPath = path.join(directory, folder);
                await fs.mkdir(folderPath, {recursive: true});


                const filePromises = files.map(async (file) => {
                    const filePath = path.join(folderPath, file);
                    await fs.writeFile(filePath, 'text text text');
                    const fileStat = await fs.stat(filePath);
                    console.log(`${filePath} isDirectory:${fileStat.isDirectory()} isFile: ${fileStat.isFile()}`);
                    console.log('----------');

                });
                const folderStat = await fs.stat(folderPath);
                console.log(`${folderPath} isDirectory: ${folderStat.isDirectory()} isFile:${folderStat.isFile()}`);
                console.log('----------');
                return Promise.all(filePromises);
            });
        } catch (error) {
            console.error('Error', error);
        }
    }
    await createFoldersAndFiles();
})();