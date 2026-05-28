/// <reference types="vite/client" />

declare module '*.css' {
  const content: any;
  export default content;
}

declare module '*.css?inline' {
  const content: string;
  export default content;
}
