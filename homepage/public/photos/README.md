# 摄影作品维护

网页展示副本放在 `display/`，清单为 `homepage/src/data/photo.json`，数组顺序即展示顺序。目录根部可保留原片，但页面只读取 `display/` 中的文件。

当前作品使用最长边 1600px 的 WebP 展示副本，既保留灯光和细节，也避免页面直接加载数 MB 的原片。原片中的 HEIC 不应直接写入清单，因为 Chromium、Firefox 等浏览器无法稳定显示。

添加作品：
1. 将原片放在此目录，并在 `display/` 中准备 JPG / PNG / WebP / AVIF 展示副本（推荐 WebP，长边约 1200–1600 px）。
2. 在仓库根目录运行 `npm --prefix homepage run photos:sync`。
3. 修改 JSON 中的 `title.zh` 和 `title.en`，并按需要调整数组顺序。真实作品设为 `placeholder: false`。
4. 运行 `npm --prefix homepage run build`。

字段：`filename` 文件名；`title` 中英文标题；`width` / `height` 图片显示尺寸；`location` 为 `null` 或 `{ "latitude": 31.23, "longitude": 121.47 }`（可额外加入 `name`）。
维护脚本从 `display/` 读取图片尺寸，并在展示副本含 EXIF 时提取经纬度；它会保留已有标题、顺序和手动坐标。为隐私而去除展示副本的 GPS 后，坐标可从原片读取并手动填写。浏览器直接使用清单，不重复解析图片。

删除作品时，同时删除文件和对应 JSON 项。展示主要采用 3:4 / 4:3 相纸比例，其他比例会居中裁剪。
点击照片可查看不裁切的大图，标题下方显示坐标链接；Apple 设备使用 Apple Maps 链接，其他设备使用 Google Maps 链接，由系统决定打开已安装的地图 App 或网页。无有效坐标时只显示标题，隐藏坐标行。预览期间照片带暂停，关闭五秒后恢复自动播放。公开部署后的图片及 JSON 中的坐标均可被访问；不想公开的位置可将 location 留空，并移除原图 GPS。

地图链接格式参考：[Apple Map Links](https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html)、[Google Maps URLs](https://developers.google.com/maps/architecture/maps-url)。
