import { classNames, isRecord } from './classnames';

export interface BlockFn {
  (...mods: any): string;
}

export interface ElemFn {
  (elem: string, ...mods: any): string;
}


function applyMods(element: string, mod: any): string {
  if (Array.isArray(mod)) {
    return classNames(mod.map((m) => applyMods(element, m)));
  }
  if (isRecord(mod)) {
    return classNames(
      Object.entries(mod).map(([mod, v]) => v && applyMods(element, mod)),
    );
  }
  const v = classNames(mod);
  return v && `${element}--${v}`;
}


function computeClassnames(element: string, ...mods: any): string {
  return classNames(element, applyMods(element, mods));
}


export function bem(block: string): [BlockFn, ElemFn] {
  return [
    (...mods) => computeClassnames(block, mods),
    (elem, ...mods) => computeClassnames(`${block}__${elem}`, mods),
  ];
}
