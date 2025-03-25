export const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    callback: Function,
) => {
    const fileType = file.mimetype.split('/')[1];

    const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];

    if (!validExtensions.includes(fileType)) {
        return callback(null, false);
    }

    callback(null, true);
};
