# app 构筑指南

app主体很简单，就是没有框架的html。系统与app不使用iframe或shadowroot分离，因此app原理就是直接将html代码插入窗口中。

构建app只需要建一个文件夹，放一个`manifest.json`，`index.html`和`favicon.ico`，并把文件夹后缀写成`.exe`，系统就可以把这个文件夹视为app允许运行。

## manifest.json示例:
```json
{
  "name": "文件资源管理器",
  "icon": "favicon.ico",
  "file": "index.html",
  "size": "720x480;0"
}
```

- name: app名字
- icon: app图标
- file: app本体文件
- size: 长x宽;0代表可以缩放，1代表禁止缩放

## app 示例
```html
<div id="a">
  div1
</div>
<div id="b">
  div2
</div>
<div id="os-startmenu">
  与系统开始菜单id相同
</div>
<style>
  #os-startmenu {
    background-color: #595;
  }
</style>
<style scoped>
  #a {
    color: green;
  }
  #b {
    color: red;
  }
  #os-startmenu {
    background-color: #959;
  }
</style>
<script>
  $("a").onclick = ()=> {

    Win.createRaw("好家伙");

  };
  $("b").onclick = ()=> {

    app.td.style.width = "500px";

  }
</script>
```
可能很长，但只是为了说明app可以用到系统的api有哪些。最简单的app可以只写2个字，如`23`，也是可以作为app运行的。

目前为止，app可用系统提供的api如下

### Style相关
- `<style scoped>...</style>`: 将样式局限在style标签的父标签以下，防止污染全局样式。注意，样式表中若使用了伪类(`:`开头的一切)，请保证写上这个元素没有伪类的样式，否则css规则更新后对应标签无法更新。而且对@规则(@keyframe, @font-face这些)的无约束效果！但@类规则在应用关闭后也会跟着消失，所以请注意命名空间。
- `app.scopeStyle(): void`: 动态改变dom时使用此指令刷新scoped style
- `<div class="background" style="background-image: url(...)"></div>`: 最常用的背景图样式类
- `<div class="os-contextmenu"><p>选项1</p><p>选项2</p><hr/></div>`: 右键菜单样式，不包含脚本且默认display: none。
- `body.light #myDiv{--color1: #232;} body.dark #myDiv{--color1: #ede;}`: 使你的样式根据系统明暗主题变化
- `--bgc`: 亮色主题为#fff，暗色为#000，`--fgc`相反
- `--theme`: 直接访问系统主题色(彩色)
- 更多请阅读os.css

### Script相关
- `$(e: String)`: 返回app中id为此的元素，原理是`app.querySelector("#"+e)`

---
- `app: HTMLDivElement`: 返回app运行时的窗口dom。其中可以访问的额外属性是(create()和createRaw()返回的div也可访问):
- `app.td: HTMLDivElement`: 此窗口在任务栏的dom
- `app.foc(): void`: 聚焦此窗口
- `app.focused: Boolean`: 是否被聚焦，不要写入，可能会bug
- `app.minimize(): void`: 最小化
- `app.shutdown(): void`: 关闭窗口
- `app.onshutdown: null`: 写入function可使程序在关闭时回调
- `app.c1,c2,c3: SVGElement`: 窗口右上角的3个键的dom
- `app.runScript(): void`: 强制重新运行app的所有脚本
- `app.scopeStyle(): void`: 刷新app所有使用了scoped的style
- `app.name: getter(): String, setter(v: String)`: 窗口动态改名
- `app.param: any`: app启动时的传参
- `app.env: {}`: app中写入变量后，可以通过create(...).env或createRaw(...).env访问到。

---
- `draggable(dom: Element, ?isStartMenu: Boolean): void`: 使一个元素可以鼠标拖动改变大小。只能为能插入元素的元素使用。img这类的可以考虑div使用background-image替代。
- `req(url: String, callback: (response: any, status: Number)=> void, ?resType: String of XHR.responseType): void`: 发送xhr的get请求，如`req("/233.json", (resp)=> console.log(resp), "json")`
- `req(url: String, body: **Object**, callback: (response: any, status: Number)=> void, ?resType: String of XHR.responseType): void`: 发送xhr，主体为json的post请求，如`req("/api/233", { message: "hello world" }, (resp)=> console.log(resp), "json")`
- `resPath(p: String)`: 把系统中使用的路径转化为web可以传输的网络路径

---
- `Win: Object`: 窗口管理器，里面有窗口相关的东西:
- `Win.tasks: HTMLDivElement[]`: 包括app现在可以访问到的app在内，目前运行的所有窗口数组
- `Win.createRaw(content: String, ?options: { ?param: any, ?name: String, ?ico: String }): HTMLDivElement`: 根据html代码直接构建窗口，`param`会原封不动的传到app中，`name`和`ico`都是网络路径
- `Win.create(path: String, ?param: any): { onload: null, dom: HTMLDivElement, env: {} }`: 根据系统路径创建一个窗口。由于窗口创建有延迟，写入返回值的onload为回调函数，函数里访问返回值的`dom`和`env`才能访问到。
---

```
contextMenu(dom: 需要右键弹出菜单的dom, menuList: [{
  name: 选项名字: String,
  ev: 点击的回调函数: Function,
  ?ico: 选项图标: String,
  ?hr: 是否为<hr>元素: Boolean
}, {...}])
```
返回同顺序的div列表，其中可以访问额外属性(cm[i]代表返回数组的项目):
- cm[i].disabled: getter&setter: Boolean 使选项禁用或启用
- cm[i].name: getter(): String, setter(v: String) 选项名字
- cm[i].ev: getter&setter: Function 选项回调函数
- cm[i].ico: getter&setter: String 选项图标
---

- 更多请阅读os.js

## 其他
- `%app%`是app中全局可用的特殊标识，会在app启动时自动转化为app所在的相对路径（作为app文件的字符串处理，无论写在哪都会被转换），一般用于网络请求，如`<img src="%app%/asset/test.png">`


