import {Controller, Get, Header} from "@nestjs/common";
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
    metrics() {
        return PrometheusService.toPrometheus();
    }

    @Get('stat')
    @ApiOkResponse({description: 'OK', type: Object})
    @Header('Content-type', 'application/json')
    stat() {
        return PrometheusService.toJson();
    }
}