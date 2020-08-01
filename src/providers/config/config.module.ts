import {Global, Module} from "@nestjs/common";
import {configProviders} from "./config.providers";

@Global()
@Module({
    providers: [...configProviders],
    exports: [...configProviders],
})
export class ConfigModule {
}
