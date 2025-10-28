export type ThemeIconColor =
    | 'gray'
    | 'black'
    | 'blue'
    | 'light-blue'
    | 'dark-blue'
    | 'orange'
    | 'orange-red'
    | 'pink-red'
    | 'red'
    | 'light-green'
    | 'green'
    | 'dark-green'
    | 'azure'
    | 'purple'
    | 'crimson';
export type Themed<T> = T | { light: T; dark: T };
export type IconRef = `fa:${string}` | `node:${string}.${string}`;
export type IconFile = `file:${string}.png` | `file:${string}.svg`;
export type Icon = IconRef | Themed<IconFile>;