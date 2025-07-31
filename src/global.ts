
declare global {
  var win: any
  
  type AnyFn = (...args: any[]) => any
  type Nullable<T> = T | null
}

export const initGlobal = () => {
  ;(window as any).win = window
}