// In production this should be loaded from a configuration manager, and may contain secrets.
// Something like Azure keyvault or AWS Secrets Manager

interface BackendConfig {
    port: number;
    ip: string;
}

export const BACKEND: BackendConfig = {
    port: 8889,
    ip: "localhost",
};