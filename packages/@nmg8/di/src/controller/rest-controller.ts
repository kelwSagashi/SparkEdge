import { Container, Service } from '../di';

import { ControllerRegistryMetadata } from './controller-registry-metadata';
import type { Controller } from './types';

export const RestController =
	(basePath: `/${string}` = '/'): ClassDecorator =>
	(target) => {
		const metadata = Container.get(ControllerRegistryMetadata).getControllerMetadata(
			target as unknown as Controller,
		);
		metadata.basePath = basePath;
		metadata.registerOnRootPath = false;
		return Service()(target);
	};
