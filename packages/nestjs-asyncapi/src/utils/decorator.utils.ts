/**
 * Decorator helpers. Behaviour mirrors the internal helpers of `@nestjs/swagger`
 * (not part of its public API), so existing metadata shapes are preserved.
 */

export function createMethodDecorator<T = unknown>(metakey: string, metadata: T): MethodDecorator {
  return (_target, _key, descriptor: PropertyDescriptor) => {
    if (typeof metadata === 'object') {
      const prevValue = Reflect.getMetadata(metakey, descriptor.value);
      Reflect.defineMetadata(metakey, { ...prevValue, ...metadata }, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(metakey, metadata, descriptor.value);
    return descriptor;
  };
}

export function createMixedDecorator<T = unknown>(metakey: string, metadata: T): ClassDecorator & MethodDecorator {
  return ((target: object, _key?: string | symbol, descriptor?: PropertyDescriptor) => {
    const metadataTarget = descriptor ? descriptor.value : target;
    const merged = Array.isArray(metadata)
      ? [...(Reflect.getMetadata(metakey, metadataTarget) || []), ...metadata]
      : { ...(Reflect.getMetadata(metakey, metadataTarget) || {}), ...(metadata as object) };

    Reflect.defineMetadata(metakey, merged, metadataTarget);
    return descriptor ?? target;
  }) as ClassDecorator & MethodDecorator;
}
