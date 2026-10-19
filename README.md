# 水务管理系统前端

Vue 3 + Vue CLI 5。水务地图使用 MapLibre GL JS、Terra Draw 和本地全国 PMTiles。

## 开发启动

在此目录首次安装依赖：`npm.cmd ci`。日常开发在此目录启动前端：

```powershell
# 前端及地图资源，端口8081
npm.cmd run serve
```

另保持后端8080运行。访问 https://localhost:8081/map ，使用现有账号登录。开发证书为本机自签证书；出现提示时选择“高级→继续访问localhost”。

## 文件位置

- `src/views/mapDevices.vue`：水务地图；设备、管线操作面板在 `src/components/map`。
- `src/views/field.vue`、`field3.vue`：两个外勤轨迹页面。
- `src/map`：地图会话、绘制、坐标、接口、播放与布局模块。
- `public/map-config`：全国显示遮罩和逐条轨迹坐标来源登记。
- `public/map-licenses`、`map-assets/licenses`：必需的第三方许可与地图署名。
- `map-assets`：正式全国地图、字体、sprite、样式及资源清单。
- `scripts/map-assets.cjs`：提供地图文件分段读取，由前端开发服务加载，无需单独启动。

`/api`代理后端8080；`/map-assets`由8081直接读取本地地图资源，支持HTTP分段请求，不需要8094服务。地图归档约6.49GB，放在`public`之外，前端构建不复制整包。`.pmtiles`不进入Git；向其他开发者移交工作目录时，需要同时移交`map-assets/地图数据`中的两份归档。哈希、来源和精确版本见`map-assets/manifest.json`。本项整合用于开发服务；生产部署仍需由Web服务器提供`map-assets`目录及分段读取。

## 构建及开发约定

```powershell
npm.cmd run build
```

构建产物为`dist`。保持锁文件，使用`npm ci`复现依赖。`VUE_APP_API_BASE`、`VUE_APP_MAP_READONLY_API_BASE`和`VUE_APP_MAP_ASSET_BASE`是可选构建配置；未配置时保持原请求规则。

已有坐标来源标识与原设备/管线ID必须保留；未知来源不自动当作WGS84或GCJ-02。真实轨迹来源当前待确认，来源未登记时显示待确认提示。标准地图保留全国范围、缩放限制和外围遮罩；卫星影像、三维建筑及流动动画尚未启用。
