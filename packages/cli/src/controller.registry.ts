import { Container, Controller, ControllerRegistryMetadata, RateLimit, Service } from "spark-edge-di";
import type { Request, Response, RequestHandler } from 'express';
import { Router } from "express";
import { rateLimit as expressRateLimit } from 'express-rate-limit';
import type { ZodClass } from 'zod-class';
import { send } from "./response-helper";
import { Logger } from "./simple-logger";

type ActivateReturns = { basePath: string; router: ReturnType<typeof Router> };
@Service()
export class ControllerRegistry {
    private readonly globalConfig = {
        endpoints: {
            rest: 'api'
        }
    }

	constructor(
        private readonly logger: Logger,
		private readonly metadata: ControllerRegistryMetadata
	) {}

    activate(): ActivateReturns[] {
        const routers: ActivateReturns[] = [];
        for (const controllerClass of this.metadata.controllerClasses) {
			const router = this.activateController(controllerClass);
            routers.push(router);
		}
        return routers;
    }

    private activateController(controllerClass: Controller): ActivateReturns{
        const metadata = this.metadata.getControllerMetadata(controllerClass);

		const router = Router({ mergeParams: true });

		const rawBasePath = metadata.registerOnRootPath
        ? metadata.basePath
        : `/${this.globalConfig.endpoints.rest}${metadata.basePath.startsWith('/') ? '' : '/'}${metadata.basePath}`;

        const basePath = rawBasePath.replace(/\/+/g, '/').replace(/\/$/, '');

		const controller = Container.get(controllerClass) as Controller;
		const controllerMiddlewares = metadata.middlewares.map(
			(handlerName) => controller[handlerName].bind(controller) as RequestHandler,
		);

		for (const [handlerName, route] of metadata.routes) {
			const argTypes = Reflect.getMetadata(
				'design:paramtypes',
				controller,
				handlerName,
			) as unknown[];

			const handler = async (req: Request, res: Response) => {
				const args: unknown[] = [req, res];
				for (let index = 0; index < route.args.length; index++) {
					const arg = route.args[index];
					if (!arg) continue; // Skip args without any decorators
					if (arg.type === 'param') args.push(req.params[arg.key]);
					else if (['body', 'query'].includes(arg.type)) {
						const paramType = argTypes[index] as ZodClass;
						if (paramType && 'safeParse' in paramType) {
							const output = paramType.safeParse(req[arg.type]);
							if (output.success) args.push(output.data);
							else {
								return res.status(400).json(output.error.errors[0]);
							}
						}
					} else throw new Error('Unknown arg type: ' + arg.type);
				}
				return await controller[handlerName](...args);
			};

            this.logger.log(
            `[ControllerRegistry] registrando rota: ${route.method.toUpperCase()} ${basePath}${route.path}`
            );
			router[route.method](
				route.path,
				// ...(route.rateLimit
				// 	? [this.createRateLimitMiddleware(route.rateLimit)]
				// 	: []),
				...([]), // skip auth
				...([]), // liscence
				...([]), // access scope
				...(controllerMiddlewares as any),
				...(route.middlewares as any),
				route.usesTemplates
					? async (req: Request, res: Response) => {
							await handler(req, res);
						}
					: (send(handler) as any),
			);
		}

        return {
            basePath: basePath === '' ? '/' : basePath,
            router
        }
    }

    private createRateLimitMiddleware(rateLimit: true | RateLimit)
	// : RequestHandler 
	{
		if (typeof rateLimit === 'boolean') rateLimit = {};
		return expressRateLimit({
			windowMs: rateLimit.windowMs,
			limit: rateLimit.limit,
			message: { message: 'Too many requests' },
		});
	}
}
