import { createBrowserHistory, createHashHistory } from "history";
import pathToRegexp = require("path-to-regexp");
import { BaseElement, OnHandlerA, R, React, Renderable } from "rahisi";
import { F0, F1 } from "rahisi-type-utils";

const history = createHashHistory();

export const Link = (props: R.AnchorHTMLAttributes<HTMLAnchorElement>, children: any) => {
  const attributes = React.getAttributes(props as any);
  const kids = React.getChildren(children);
  attributes.push(
    new OnHandlerA("click",
      (event) => {
        event.preventDefault();
        history.push({
          pathname: (event.currentTarget as HTMLAnchorElement).pathname,
          search: (event.currentTarget as HTMLAnchorElement).search,
        });
      }));
  return new BaseElement("a", attributes, kids) as any;
};

function matchURI(path: string, uri: string) {
  const keys: pathToRegexp.Key[] = [];
  const pattern = pathToRegexp(path, keys);
  const match = pattern.exec(uri);
  if (!match) {
    return null;
  }
  const params = new Map<string | number, string>();
  for (let i = 1; i < match.length; i++) {
    if (match[i] !== undefined) {
      params.set(keys[i - 1].name, match[i]);
    }
  }
  return params;
}

export interface Route<T> {
  path: string;
  action: F1<Map<string | number, string>, T>;
}

export function resolve<T>(routes: Array<Route<T>>, noMatch: F0<T>) {
  const uri = history.location.pathname;
  for (const route of routes) {
    const params = matchURI(route.path, uri);
    if (!params) {
      continue;
    }
    const result = route.action(params);
    return result;
  }
  return noMatch();
}
