export interface MysqlConf {
    database: string,
    host: string,
    port: number,
    user: string,
    password: string,
    timezone: string,
    migrationsDir: string,
    migrations: string[],
    synchronize: boolean,
    migrationsRun: boolean
}
