import {Global, Module} from "@nestjs/common";
import {dbProviders} from "./db.providers";
import {ConfigModule} from "../config/config.module";

@Global()
@Module({
    providers: [...dbProviders],
    exports: [...dbProviders],
    imports: [ConfigModule]
})
export class DbModule {
}
