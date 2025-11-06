import { v2 as cloudinary } from 'cloudinary'

const normalizeEnv = (value) => {
    if (!value) return ''
    return value.trim().replace(/^['"]|['"]$/g, '')
}

const connectCloudinary = async () => {

    const cloudName = normalizeEnv(process.env.CLOUDINARY_NAME || process.env.CLOUDINARY_CLOUD_NAME)
    const apiKey = normalizeEnv(process.env.CLOUDINARY_API_KEY)
    const apiSecret = normalizeEnv(process.env.CLOUDINARY_SECRET_KEY || process.env.CLOUDINARY_API_SECRET)

    if (!cloudName || cloudName.toLowerCase() === 'project') {
        console.warn('[cloudinary] Cloud name is not configured. Skipping Cloudinary init. Set CLOUDINARY_NAME to enable uploads.')
        return
    }

    if (!apiKey || !apiSecret || apiKey.includes('----') || apiSecret.includes('----')) {
        console.warn('[cloudinary] API credentials incomplete. Skipping Cloudinary init. Set CLOUDINARY_API_KEY/SECRET to enable uploads.')
        return
    }

    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
    })

}

export default connectCloudinary