import mongoose from "mongoose";

const DEFAULT_DB_NAME = process.env.MONGODB_DB_NAME || "prescripto";
const LOCAL_FALLBACK_URI = `mongodb://127.0.0.1:27017/${DEFAULT_DB_NAME}`;

const maskCredentials = (uri) => uri?.replace(/(mongodb(?:\+srv)?:\/\/)([^@]+)@/, "$1***@");

const hasExplicitDatabase = (uri) => {
    if (!uri) return false;
    const withoutHost = uri.replace(/^mongodb(?:\+srv)?:\/\/[^/]+/i, "");
    if (!withoutHost || withoutHost === "/" || withoutHost.startsWith("?")) {
        return false;
    }
    return true;
};

const connectDB = async () => {
    // Prefer a Standard (non-SRV) URI if provided; fall back to SRV env, then to local
    const configuredStandardUri = process.env.MONGODB_STANDARD_URI?.trim();
    const configuredSrvUri = process.env.MONGODB_URI?.trim();
    const configuredUri = configuredStandardUri || configuredSrvUri;
    const connectionUri = configuredUri || LOCAL_FALLBACK_URI;
    const connectionOptions = {};

    // Allow opting out of local fallback to make Atlas issues fail fast and visible
    const disableFallback = /^(true|1|yes)$/i.test(process.env.MONGODB_DISABLE_FALLBACK || "");

    if (!hasExplicitDatabase(configuredUri)) {
        connectionOptions.dbName = DEFAULT_DB_NAME;
    }

    mongoose.connection.on("connected", () => {
        const { host, name } = mongoose.connection
        console.log(`Database connected (host: ${host || 'unknown'}, db: ${name || 'unknown'})`)
    });
    mongoose.connection.on("error", (error) => console.error("MongoDB connection error", error));
    mongoose.connection.on("disconnected", () => console.warn("MongoDB disconnected"));

    const shouldFallbackToLocal = (err) => {
        if (!configuredUri) return false;
        if (!err) return false;
        if (err.code === "ENOTFOUND") return true;
        if (typeof err.message === "string" && err.message.includes("ENOTFOUND")) return true;
        if (err?.cause && shouldFallbackToLocal(err.cause)) return true;
        if (err?.reason && shouldFallbackToLocal(err.reason)) return true;
        return false;
    };

    try {
        await mongoose.connect(connectionUri, connectionOptions);
    } catch (error) {
        if (!disableFallback && shouldFallbackToLocal(error)) {
            console.warn(
                `Unable to resolve MongoDB host ${maskCredentials(configuredUri)}. Falling back to ${LOCAL_FALLBACK_URI}.`,
            );
            try {
                await mongoose.connect(LOCAL_FALLBACK_URI, { dbName: DEFAULT_DB_NAME });
                return;
            } catch (fallbackError) {
                console.error(`Fallback connection to ${LOCAL_FALLBACK_URI} failed:`, fallbackError.message);
                throw fallbackError;
            }
        }

        console.error(`Failed to connect to MongoDB at ${maskCredentials(connectionUri)}:`, error.message);
        throw error;
    }
};

export default connectDB;

// If your password contains special characters like '@' or '/', URL-encode it in the connection string.