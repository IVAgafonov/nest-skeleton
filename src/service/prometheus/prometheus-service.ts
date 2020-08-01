import * as metrics from 'prom-client';
import { Counter, Histogram } from 'prom-client';

export type GaugeValueCollector = () => any;

export class PrometheusService {
    static registry = new metrics.Registry();
    static labels   = new Map<string, string>();
    static gauges   = new Map<string, GaugeValueCollector>()

    public static counter(name: string): Counter<string> {
        let metric =  PrometheusService.registry.getSingleMetric('counter_' + name) as Counter<string>;
        if (!metric) {
            metric = new metrics.Counter({
                name: 'counter_' + name,
                help: name
            });
            PrometheusService.registry.registerMetric(metric);
        }
        return metric;
    }

    public static timer(name: string): Timer {
        let metric =  PrometheusService.registry.getSingleMetric('timer_' + name) as Histogram<string>;
        if (!metric) {
            metric = new metrics.Summary({
                name: 'timer_' + name,
                help: name
            });
            PrometheusService.registry.registerMetric(metric);
        }
        return new Timer(metric);
    }

    public static label(name: string, value: string) {
        PrometheusService.labels.set(name, value);
    }

    public static gauge(name: string, value: GaugeValueCollector) {
        if (!PrometheusService.gauges.has(name)) {
            PrometheusService.gauges.set(name, value);
        }
    }

    public static toJson() {
        const res: any = {
            counters: {},
            labels: {},
            gauges: {},
            timers: {},
            unknown: {},
        };

        PrometheusService.labels.forEach((value, key) => {
            res.labels[key] = value;
        });

        PrometheusService.gauges.forEach((value, key) => {
            res.gauges[key] = value();
        });

        for (const metric of PrometheusService.registry.getMetricsAsArray()) {
            if (metric.name.startsWith('counter_')) {
                const cnt = PrometheusService.registry.getSingleMetric(metric.name) as any;
                res.counters[
                    metric.name.replace('counter_', '')
                    ] = cnt.get().values[0].value;
            } else if (metric.name.startsWith('timer_')) {
                const cnt = PrometheusService.registry.getSingleMetric(metric.name) as any;
                res.timers[metric.name.replace('timer_', '')] = {
                    '50': cnt.get().values[2].value,
                    '95': cnt.get().values[4].value,
                    '99': cnt.get().values[5].value,
                    count: cnt.get().values[8].value,
                };
            } else {
                res.unknown[metric.name] = PrometheusService.registry.getSingleMetricAsString(
                    metric.name,
                );
            }
        }

        return res;

    }

    public static toPrometheus(): string {
        return PrometheusService.registry.metrics();
    }
}

export class Timer {
    constructor(private readonly h: Histogram<string>) {}

    time<T>(body: () => T | Promise<T>): T | Promise<T> {
        const end = this.h.startTimer();
        const res = body();
        if (res instanceof Promise) {
            return res.finally(() => {
                end();
            });
        } else {
            end();
        }
        return res;
    }

    start() {
        return this.h.startTimer();
    }
}

export function Metric(name: string): MethodDecorator {
    return (target, key, descriptor: PropertyDescriptor) => {
        const method = descriptor.value;

        descriptor.value = function(...args: any[]): any {
            return PrometheusService.timer(name).time(() => method.apply(this, args));
        };

        return descriptor;
    };
}



