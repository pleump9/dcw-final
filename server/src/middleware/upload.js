const multer = require("multer");
const { GridFsStorage } = require('multer-gridfs-storage');

const storage = new GridFsStorage({
    url: process.env.DB,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        const match = ["image/png", "image/jpeg"];

        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${file.originalname}`;
            return filename;
        }

        return new Promise((resolve, reject) => {

            const filename = `${file.originalname}`
            const Description = req.body.Description
            const fileInfo = {
                filename: filename,
                bucketName: 'contents',
                metadata: req.body,
            }
            resolve(fileInfo, Description);
        });
    },
});

module.exports = multer({ storage });
