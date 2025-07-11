# 一、使用组件

## 导出方式

如非必要，我不喜欢默认导出

尽可能使用 export const MyComponent = () => {}

## props

我喜欢在函数第一行来解构，参数名就叫props

因为这样换行量最少

## 组件定义时的位置

我喜欢组件定义在顶部，第一眼就你能看到

所以props定义在下面，同时props使用type来定义

props也需要export

## 回调使用handleXXX

组件内的回调用handleXXX命名，防止和props解构的onXXX冲突

## 受控组件

为了防止受控组件变得难用（如回设字段），我会额外一个default值

如 defaultValue, value, onChange

defaultValue 只是影响初始值

value 如果没有传递 (undefined 或者 null)，内部维护一个 internalValue

可以结合Typescript的`??`操作符

## 使用shadcn时

不要修改shadcn的原始代码

如：
- src/components/ui/ 
- src/lib/utils.ts
- src/hooks/use-mobile.ts

## 类名合并

不要手动用条件语法合并

shadcn 自带
`import { cn } from '@/lib/utils'`

如果没有用clsx

## 逻辑聚合

业务逻辑按照pages聚合，不用分散到多个地方

如：

```
pages/my-page/
- my-page.tsx
- my-page-store.ts
- my-page-style.ts
- components/
  - my-page-component.tsx
  - my-page-other-component.tsx
```

除非是全局通用组件，否则都放到page下
通用组件目录 src/components/common/

## 业务组件

相比我自己写到通用组件，业务组件尽可能不用props

因为我会用zustand的store，尽可能接入上下文，减少props传递

## hooks

我喜欢使用ahooks的框架，开发中优先考虑

如果是挂在和卸载，使用 useMount 和 useUnmount

如果一个函数可能被间接延迟调用，请考虑使用 useMemoizedFn，防止闭包访问旧数据的问题

# 二、逻辑代码

## 小写导出

一些管理类，工具类，我喜欢写一个大写的classs然后导出一个小写的实例

```ts
class MyClass {
  // ...
}

export const myClass = new MyClass()
```

目的就是少写static

## jsdoc

每个类，组件顶部一般都可以加上

我的jsdoc要求不严格，就加一个简短描述即可

## 函数描述

如果函数名字非常容易理解，可以不用加注释

函数如果只有一行描述，不要用jsDoc，而是 /** you description */

## 注释后置

如果注释比较短，不要单独一行，直接写到代码后面

## 注释克制

不是说只要变量，类型，函数，都一定要加注释

只有字段特殊，逻辑特殊，才需要加注释，浅显易懂的最好不要加

## 逻辑简单尽量要在一行

如：

```ts
if (condition) return

setTimeout(() => console.log('hello'), 1000)
```

## prettier

我喜欢用 prettier

主要规则，printWidth: 200（适配大屏），默认 120 太小了

单引号代替双引号，不加分号

使用es5逗号（注意虽然支持后缀逗号，但是代码简单是可以写到一行不加逗号的）

缩进2，使用空格，配合vscode增加

```json
{
  "editor.insertSpaces": true,
  "editor.tabSize": 2
}
```

# 三、Typescript

## 充分利用类型推断

比如 useState<number>(1)，number不要写

一般情况我不会用null，比如计时器id我会用-1，string我会用''

基本不用写函数返回值，比如:void, :Promise<void>

## 导入解构

导入尽可能解构，不要导入完整的命名空间，比如 React.FC, React.useState

## 不用Map

我喜欢用Record代替Map，因为代码少很多，符合常见的hashMap直觉，而且控制台访问友好

# 四、命名规范

## 文件命名

文件命名使用 kebab-case

我喜欢使用具名的，不然编辑顶部标签全都是泛滥的index，非常不利于查找

page页一般不需要加后缀，如 src/pages/chat/chat.tsx（而不是 chat-page.tsx）

## 短名优先

我喜欢在不影响阅读下，命名尽可能短

如 current -> curr, index -> idx, message -> msg

## lint配置

我不喜欢 tsConfig 中的 `noUnusedImports、noUnusedVariables、unUnusedParameters、strictNullChecks、noImplicitAny`，这些配置我都是禁掉的

eslint 配置禁用 `@typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any`


