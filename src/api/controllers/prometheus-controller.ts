import {Controller, Get, Header, HttpCode} from "@nestjs/common";
import {
    ApiOkResponse,
    ApiTags
} from "@nestjs/swagger";
import {PrometheusService} from "../../service/prometheus/prometheus-service";

@Controller('api')
@ApiTags("prometheus")
export class PrometheusController {

    constructor() {
    }
    @Get('metrics')
    @ApiOkResponse({description: 'OK', type: String})
    @Header('Content-type', 'text/plain')
    @HttpCode(200)
    metrics() {
        return PrometheusService.toPrometheus();
    }

    @Get('stat')
    @ApiOkResponse({description: 'OK', type: Object})
    @Header('Content-type', 'application/json')
    @HttpCode(200)
    stat() {
        return PrometheusService.toJson();
    }
}