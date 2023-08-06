const sharp = require('sharp');

/**
 * Create a thumbnail from a file
 * Returns an object with the file type and the base64 string of the thumbnail
 * @param filePath
 * @param width
 * @param height
 */
async function createThumbnailFromFile(filePath, width, height) {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    const buffer = await image.resize(width, height).toBuffer();
    return {fileType: metadata.format, data: buffer.toString('base64')};
}

/**
 * Create a thumbnail from a base64 string
 * Returns an object with the file type and the base64 string of the thumbnail
 * @param base64
 * @param width
 * @param height
 */
async function createThumbnailFromBase64(base64, width, height) {
    const buffer = Buffer.from(base64, 'base64');
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const outputBuffer = await image.resize(width, height).toBuffer();

    return {fileType: metadata.format, data: outputBuffer.toString('base64')};
}


module.exports = {
    createThumbnailFromFile,
    createThumbnailFromBase64
}