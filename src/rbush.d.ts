// src/rbush.d.ts
declare module 'rbush' {
    interface BBox {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    }
  
    class RBush<T> {
      load(items: T[]): void;
      search(bbox: BBox): T[];
      remove(item: T): void;
      clear(): void;
    }
  
    export default RBush;
  }
  