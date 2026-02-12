/**
 * Vue SFC 타입 선언
 * .vue 파일을 TypeScript에서 인식할 수 있도록 합니다.
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
