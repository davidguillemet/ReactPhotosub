const busboyFunc = require("busboy");
const os = require("os");
const path = require("path");
const fs = require("fs");

const multiPartFormData = (config) => async (req, res, next) => {
    // See https://cloud.google.com/functions/docs/writing/http#multipart_data
    const busboy = busboyFunc({
        headers: req.headers,
        limits: {
            fileSize: 3 * 1024 * 1024, // Max size is 3Mo
        },
    });

    const fields = {};
    const files = [];
    const fileWrites = [];
    // Note: os.tmpdir() points to an in-memory file system on GCF
    // Thus, any files in it must fit in the instance's memory.
    const tmpdir = os.tmpdir();

    busboy.on("field", (key, value) => {
        fields[key] = value;
    });

    busboy.on("file", (fieldName, file, info) => {
        const {filename, encoding, mimeType} = info;

        if (!mimeType.startsWith("image/") && !config.isAdmin(res)) {
            // Restrict mime type to images if not admin
            next(new Error("Only images are allowed for upload"));
        }

        const filepath = path.join(tmpdir, filename);
        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);

        file.on("limit", function() {
            res.locals.errorMessage = "File upload limit exceeded";
            next(new Error(res.locals.errorMessage));
        });

        fileWrites.push(new Promise((resolve, reject) => {
            file.on("end", () => writeStream.end());
            writeStream.on("finish", () => {
                fs.readFile(filepath, (err, buffer) => {
                    const size = Buffer.byteLength(buffer);
                    if (err) {
                        return reject(err);
                    }

                    files.push({
                        fieldName,
                        originalName: filename,
                        encoding,
                        mimeType,
                        buffer,
                        size,
                    });

                    try {
                        fs.unlinkSync(filepath);
                    } catch (error) {
                        return reject(error);
                    }

                    resolve();
                });
            });
            writeStream.on("error", reject);
            writeStream.on("close", (data) => {
                if (file.truncated) {
                    // File too big
                }
            });
        }));
    });

    busboy.on("finish", () => {
        Promise.all(fileWrites)
            .then(() => {
                req.body = fields;
                req.files = files;
                next();
            })
            .catch(next);
    });

    busboy.end(req.rawBody);
};

module.exports = multiPartFormData;
