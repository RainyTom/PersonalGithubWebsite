// 以灰阶和字重区分语法，让代码与黑白页面保持一致。
const scopes = [
  ['comment', '939393', 'italic'],
  ['keyword, storage', '222222', 'bold'],
  ['string, constant.numeric', '666666', ''],
  ['entity.name.function, support.function', '3d3d3d', 'bold'],
];
function theme(dark) {
  return {
    name: dark ? 'rainy-dark' : 'rainy-light', type: dark ? 'dark' : 'light',
    colors: { 'editor.background': dark ? '#151515' : '#fafafa', 'editor.foreground': dark ? '#dedede' : '#303030' },
    tokenColors: scopes.map(([scope, color, fontStyle]) => ({
      scope: scope.split(', '), settings: { foreground: `#${dark ? ({ '939393': '868686', '222222': 'f0f0f0', '666666': 'b8b8b8', '3d3d3d': 'dddddd' })[color] : color}`, fontStyle },
    })),
  };
}
export const codeThemes = { light: theme(false), dark: theme(true) };
