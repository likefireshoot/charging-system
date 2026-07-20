// 命令下发品牌注册表
// 新增品牌只需在此 Map 中添加一行映射即可

const commandComponentMap = {
  '集万讯': () => import('./CommandJiwanxun.vue'),
  '信驰':   () => import('./CommandXinchiBase.vue'),
  '4G信驰': () => import('./CommandXinchiBase.vue'),
  '旧信驰': () => import('./CommandXinchiBase.vue'),
  '旧信驰KF01': () => import('./CommandXinchiBase.vue'),
  '圣鑫':   () => import('./CommandShengxinBase.vue'),
  '旧圣鑫': () => import('./CommandShengxinBase.vue'),
  '太阳能':   () => import('./CommandTaiyangneng.vue'),
  '卓正':     () => import('./CommandZhuozheng.vue'),
  '千宝通':   () => import('./CommandQianbaotong.vue'),
};

/** 品牌 → API 路径前缀映射 */
export const apiPrefixMap = {
  '信驰':   'xinChi',
  '4G信驰': 'directXinChi',
  '旧信驰': 'oldXinChi',
  '旧信驰KF01': 'oldXinChi',
  '圣鑫':   'shengXin',
  '旧圣鑫': 'oldShengXin',
};

export function getCommandComponent(vendor) {
  const factory = commandComponentMap[vendor];
  if (!factory) return null;
  return factory;
}

export default commandComponentMap;
