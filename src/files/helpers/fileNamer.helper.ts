import { v4 as uuid } from 'uuid';

export const fileNamer = (
    req: Express.Request,
    file: Express.Multer.File,
    callback: Function,
) => {
    const fileType = file.mimetype.split('/')[1];

    const name = `${uuid()}.${fileType}`;

    callback(null, name);
};
