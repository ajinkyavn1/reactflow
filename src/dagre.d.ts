// src/dagre.d.ts
declare module 'dagre' {
    export namespace dagre {
      class graphlib {
        static Graph: any;
        static Layout: any;
      }
    }
    const dagre: {
      graphlib: dagre.graphlib;
      layout: any;
    };
    export = dagre;
  }
  