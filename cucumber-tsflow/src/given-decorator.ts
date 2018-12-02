import { TypeDecorator } from "./type-decorator";

export function Given<T>(stepPattern: RegExp | string): TypeDecorator<T> {
  return (target: T) => {
    const annotated = annotate(target);
    annotated.__cucumber_flow__ = stepPattern;
  };
}

// todo clean all this up, come up with better names, split into separate files
function annotate<T>(target: T): MetaAnnotated<T> {
  return target as MetaAnnotated<T>;
}

type MetaAnnotated<T> = T & Annotated;

interface Annotated {
  __cucumber_flow__: any;
}
