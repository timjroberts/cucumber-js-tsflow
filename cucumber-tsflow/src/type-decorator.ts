export type TypeDecorator<T> = (
  target: T,
  propertyKey: string,
  descriptor: PropertyDescriptor
) => void;
