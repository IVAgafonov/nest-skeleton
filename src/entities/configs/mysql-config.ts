export interface MysqlConfig {
    database: string,
    host: string,
    port: number,
    user: string,
    password: string,
    timezone: string,
    migrations: string,
    synchronize: boolean,
    migrationsRun: boolean
}
