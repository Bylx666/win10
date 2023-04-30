
// $并非jq
var $ = (e)=> document.getElementById(e);


/**
 * request网络资源
 * 1. req(url, callback, resType) - get
 * 2. req(url, body, callback, resType) - post
 */
 function req() {

  var xhr = new XMLHttpRequest();

  if(typeof arguments[0]==='string') {

    if(typeof arguments[1]==='function') {

      if(typeof arguments[2]==='string') xhr.responseType = arguments[2];
      xhr.open('GET', arguments[0]);
      xhr.send();
      xhr.onload = ()=>{

        arguments[1](xhr.response, xhr.status);

      };
      return true;

    }else // post
     if(typeof arguments[1]==='object') {

      if(typeof arguments[3]==='string') xhr.responseType = arguments[3];
      xhr.open('POST', arguments[0]);
      xhr.setRequestHeader('content-type', 'application/json');
      xhr.send(JSON.stringify(arguments[1]));
      xhr.onload = ()=>{

        arguments[2](xhr.response, xhr.status);

      };

      return true;

    }

  }

  return false;

}


// draggable(dom元素, 是否为左下弹出的菜单): 使一个元素可以被鼠标改变大小
function draggable(dom, isStartMenu) {

  var dd = document.createElement("div");
  dom.append(dd);
  dd.className = "draggable";

  function cd(di, da) {

    var d = document.createElement("div");
    dd.append(d);
    d.className = di;
    d.onmousedown = (e)=> {
      
      var dg = dom.getBoundingClientRect();
      function mm (_e) {
        
        if(da[0]) dom.style.height = dg.height - (da[2]||isStartMenu?(_e.clientY - e.clientY):(e.clientY - _e.clientY)) + "px";
        if(da[1]) dom.style.width = dg.width - (da[3]?(_e.clientX - e.clientX):(e.clientX - _e.clientX)) + "px";
        if(da[2]) dom.style.top = dg.top + (_e.clientY - e.clientY) + "px";
        if(da[3]) dom.style.left = dg.left + (_e.clientX - e.clientX) + "px";

      };
      function mu () {

        document.removeEventListener("mousemove", mm);
        document.removeEventListener("mouseup", mu);
        document.removeEventListener("selectstart", mmp);

      }
      function mmp(e) {e.preventDefault()};
      document.addEventListener("mousemove", mm);
      document.addEventListener("mouseup", mu);
      document.addEventListener("selectstart", mmp);

    };

  };
  if(isStartMenu) {

    cd("t", [1,0,0,0]);
    cd("r", [0,1,0,0]);
    cd("tr", [1,1,0,0]);

  }else {

    cd("t", [1,0,1,0]);
    cd("r", [0,1,0,0]);
    cd("tr", [1,1,1,0]);
    cd("b", [1,0,0,0]);
    cd("br", [1,1,0,0]);
    cd("l", [0,1,0,1]);
    cd("bl", [1,1,0,1]);
    cd("tl", [1,1,1,1]);

  }

}


/* 
  contextMenu(dom: 需要右键弹出菜单的dom, menuList: [{
    name: 选项名字: String,
    ev: 点击的回调函数: Function,
    ?ico: 选项图标: String,
    ?hr: 是否为<hr>元素: Boolean
  }, {...}]): 返回同顺序的div列表，其中可以访问额外属性(cm[i]代表返回数组的项目):
  cm[i].disabled: getter&setter: Boolean 使这个选项禁用或启用
  cm[i].name: getter(): String, setter(v: String) 选项名字
  cm[i].ev: getter&setter: Function 选项回调函数
  cm[i].ico: getter&setter: String 选项图标
*/
function contextMenu(dom, menuList) {

  var nl = [];

  var div = document.createElement("div");
  dom.append(div);
  div.textContent = "";
  div.classList.add("os-contextmenu");
  div.onclick = (e)=> e.stopPropagation();

  function da() {

    div.style.cssText = `display: none;`;
    document.removeEventListener("click", da);

  }

  for(let m of menuList) {

    if(typeof m!=="object") {

      nl.push(null);
      continue;

    }
    if(m.hr) {

      const hr = document.createElement("hr");
      div.append(hr);
      nl.push(hr);
      continue;
      
    }

    let ev = typeof m.ev==="function"?m.ev:null;
    let disabled = false;
    const p = document.createElement("p");
    div.append(p);
    if(typeof m.ico==="string") {

      const img = document.createElement("img");
      p.append(img);
      img.src = m.ico;
      Object.defineProperty(p, "ico", {get() {return img.src}, set(v) {img.src = v;}});

    }
    const np = document.createTextNode(m.name?m.name:"");
    p.append(np);
    p.onclick = ()=> {

      da();
      if(ev) ev();

    };

    Object.defineProperty(p, "ev", {get() {return ev}, set(v) {ev = typeof m.ev==="function"?m.ev:null;p.onclick = ev;}});
    Object.defineProperty(p, "name", {get() {return np.textContent}, set(v) {np.textContent = v;}});
    Object.defineProperty(p, "disabled", {get() {return disabled}, set(v) {
      
      if(v) {
        
        disabled = true;
        p.classList.add("disabled");
        p.onclick = null;

      }
      else {

        disabled = false;
        p.classList.remove("disabled");
        p.onclick = ()=> {

          da();
          if(ev) ev();

        };

      }
    
    }});

    nl.push(p);

  }

  dom.addEventListener("contextmenu", (e)=> {

    div.style.cssText = `left: ${e.clientX}px; top: ${e.clientY}px; display: block;`;
    document.addEventListener("click", da);

  });
  return nl;

}


// resolve path(源路径, 是否读取目录): 将win磁盘路径转化为可用的web路径。第二个参数若为真，且目标为系统目录的.path.json加上返回
function resPath(p, d) {

  if(typeof p !== "string") return p;
  if(p.toLowerCase().startsWith("c:/")) {

    return "/asset/c/" + p.replace("c:/", "") + (d?".path.json":"");

  }
  return p;

}


var Win = {
  tasks: [],
  // install(文件路径): 为开始菜单添加程序
  install(path) {

  },
  // createRaw(文件内容, 选项: { param: 参数, name: 窗口名称, ico: 图标路径 }): 通过html代码直接构建窗口
  createRaw(content, options) {

    /*
      可以在app中通过this访问窗口dom
      详情见docs/app.md
    */
    var wd = document.createElement("div");
    $("os-app").append(wd);

    if(!options) options = {};

    // 窗口头部
    var h = document.createElement("div");
    wd.append(h);
    h.className = "os-header";
    function headerMove(e) {

      var dg = wd.getBoundingClientRect();
      function mm(_e) {
        
        wd.style.left = dg.left + _e.clientX - e.clientX + "px";
        wd.style.top = dg.top + _e.clientY - e.clientY + "px";

      }
      function mu() {

        document.removeEventListener("mousemove", mm);
        document.removeEventListener("mouseup", mu);
        document.removeEventListener("selectstart", mmp);

      }
      function mmp(_e) {_e.preventDefault()};
      document.addEventListener("mousemove", mm);
      document.addEventListener("mouseup", mu);
      document.addEventListener("selectstart", mmp);

    };
    h.onmousedown = headerMove;

    var ico = options.ico;
    if(ico) {

      var i = document.createElement("img");
      h.append(i);
      i.src = ico;

    }

    var name = options.name?options.name:"";
    var p = document.createElement("p");
    h.append(p);
    p.textContent = name;

    // 窗口头部3按钮
    var wc = document.createElement("div");
    h.append(wc);
    
    var c1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    wc.append(c1);
    c1.innerHTML = '<path d="M4 11L16 11z"/>';
    c1.setAttribute("viewBox", "0 0 20 20");

    var c2 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    wc.append(c2);
    var c2path1 = '<path d="M5 5L15 5L15 15L5 15z"/>';
    var c2path2 = '<path d="M4 8L13 8L13 17L4 17zM7 5L16 5L16 14">';
    c2.innerHTML = c2path1;
    c2.setAttribute("viewBox", "0 0 20 20");

    var c3 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    wc.append(c3);
    c3.innerHTML = '<path d="M4 4L16 16z"/><path d="M16 4L4 16z"/>';
    c3.setAttribute("viewBox", "0 0 20 20");


    // 窗口主体
    var c = document.createElement("div");
    wd.append(c);
    c.innerHTML = content;
    c.style.cssText = "width:100%;height:calc(100% - 30px);position:relative;";


    // 创建任务栏按钮
    this.tasks.push(wd);

    var td = document.createElement("div");
    $("os-taskbar-tasks").append(td);
    wd.td = td;
    td.className = "focused";

    if(ico) {

      const tdI = document.createElement("img");
      td.append(tdI);
      tdI.src = ico;

    }

    const tdN = document.createElement("p");
    td.append(tdN);
    tdN.textContent = name;


    // 窗口改名api
    Object.defineProperty(wd, "name", { get: ()=> name, set(v) {

      name = v;
      p.textContent = v;
      tdN.textContent = v;
      
    } });


    // 窗口聚焦
    wd.focused = false;
    var foc = ()=> {

      if(wd.focused) return 0;

      wd.style.display = null;
      if(wd.classList.contains("minimize")) {

        wd.classList.add("rev");
        function c1F() {

          wd.removeEventListener("animationend", c1F);
          wd.classList.remove("minimize", "rev");

        }
        wd.addEventListener("animationend", c1F);

      }

      this.tasks.forEach((v)=> {

        v.style.zIndex = (parseInt(v.style.zIndex)||1)-1;
        v.td.classList.remove("focused");
        v.classList.remove("focused");
        v.focused = false;
      
      });
      wd.focused = true;
      wd.style.zIndex = this.tasks.length;
      td.classList.add("focused");
      wd.classList.add("focused");

    };
    foc();
    wd.foc = foc;
    wd.onmousedown = foc;

    td.onclick = ()=> {

      if(wd.focused) minimize();
      else wd.foc();

    };


    // 头部3按钮事件
    wc.onmousedown = (e)=> {

      e.stopPropagation();
      foc();

    }

    function minimize() {

      wd.classList.add("minimize");
      function c1F() {

        wd.style.display = "none";
        wd.removeEventListener("animationend", c1F);

      }
      wd.addEventListener("animationend", c1F);
      wd.td.classList.remove("focused");
      wd.focused = false;

    }
    c1.onclick = minimize;
    wd.minimize = minimize;
    wd.c1 = c1;

    function maximize() {

      var oris = [String(wd.style.left),String(wd.style.top),String(wd.style.width),String(wd.style.height)];
      wd.style.left = "0";
      wd.style.top = "0";
      wd.style.width = "100%";
      wd.style.height = "calc(100% - var(--s-taskbar-height))";

      var dragbar = wd.querySelector(".draggable");
      if(dragbar) dragbar.style.display = "none";

      h.onmousedown = null;

      wd.classList.add("maximize");
      c2.innerHTML = c2path2;
      function c2F() {

        wd.classList.remove("maximize");
        wd.removeEventListener("animationend", c2F);

      }
      wd.addEventListener("animationend", c2F);

      c2.onclick = h.ondblclick = ()=> {

        if(dragbar) dragbar.style.display = null;
        c2.onclick = h.ondblclick = maximize;
        h.onmousedown = headerMove;

        wd.classList.add("maximize", "rev");
        wd.style.left = oris[0];
        wd.style.top = oris[1];
        wd.style.width = oris[2];
        wd.style.height = oris[3];

        c2.innerHTML = c2path1;
        function _c2F() {
  
          wd.classList.remove("maximize", "rev");
          wd.removeEventListener("animationend", _c2F);
  
        }
        wd.addEventListener("animationend", _c2F);

      };

    }
    c2.onclick = h.ondblclick = maximize;
    wd.c2 = c2;

    wd.onshutdown = null;
    var shutdown = ()=> {

      wd.classList.add("close");
      wd.onanimationend = ()=>{

        this.tasks.splice(this.tasks.indexOf(wd), 1);
        wd.td.remove();
        wd.remove();

      };

      if(typeof wd.onshutdown==="function") wd.onshutdown();

    }
    c3.onclick = shutdown;
    wd.shutdown = shutdown;
    wd.c3 = c3;


    // app脚本运行
    function runScript() {

      var scs = c.querySelectorAll("script");
      for(let n = 0; n < scs.length; ++n) {
      
        new Function("app", "$", scs[n].textContent)(wd, (e)=> wd.querySelector("#"+e));
      
      };

    }
    wd.scopeStyle = scopeStyle;
    wd.runScript = runScript;
    wd.param = options.param;
    runScript();

    
    // app样式scoped
    function scopeStyle() {
      
      var sts = c.querySelectorAll("style");
      for(let n = 0; n < sts.length; ++n) {

        if(sts[n].getAttribute("scoped")===null) continue;
        const hash = Math.floor(Math.random()*32768);
        const sr = sts[n].sheet.cssRules;
        for(let o = 0; o < sr.length; ++o) {

          if(!sr[o].selectorText) continue;
          sr[o].selectorText = sr[o].selectorText.replace(/\[scoped=(.+?)\]/g, "");
          const sd = c.querySelectorAll(sr[o].selectorText);
          for(let p = 0; p < sd.length; ++p) {
            
            sd[p].setAttribute("scoped", hash);

          }
          sr[o].selectorText += '[scoped="'+hash+'"]';

        }
        
      }

    }scopeStyle();

    return wd;

  },
  // create(文件路径, 参数): 通过文件路径创建一个窗口
  create(path, param) {

    var w = {
      onload: null,
      dom: null,
      env: {}
    };
    var p = resPath(path);
    req(p + "/manifest.json", (r)=> {

      if(!r) r = {
        file: "index.html",
        name: "",
        ico: "favicon.ico"
      };
      var fp = r.file?r.file:"html";
      req(p+"/"+fp, (_r)=> {
        
        if(!_r) return this.createRaw("找不到文件"+p+"/"+r.file);
        var wd = this.createRaw(_r.replace(/%app%/g, p), {
          param: param,
          name: r.name?r.name:"",
          ico: r.icon?(p+"/"+r.icon):null
        });
        if(r.size) {

          var rs = r.size.split(";");
          if(!parseInt(rs[1])) draggable(wd);
          var rs1 = rs[0].split("x");
          wd.style.width = rs1[0]+"px";
          wd.style.height = rs1[1]+"px";

        }
        var dg = wd.getBoundingClientRect();
        wd.style.top = (document.documentElement.clientHeight - dg.height) / 2 + "px";
        wd.style.left = (document.documentElement.clientWidth - dg.width) / 2 + "px";

        if(typeof w==="function") w();

      });

      return w;

    }, "json");

  },
  // 环境变量列表
  EVList: [],
  // 后缀名关联列表
  OAList: {},
  // open(文件路径)打开文件
  open(p) {

    var pa = p.split(".");
    var ft = pa[pa.length-1];
    var oa = this.OAList[ft];
    if(oa) Win.create(oa.app, p);
    else this.createRaw("无此文件打开方式");

  }
};
// 加载后缀名关系列表
req("/asset/c/windows/oa_system.json", (r)=> {

  if(!r) return Win.createRaw("无法获取文件打开方式");
  Object.assign(Win.OAList, r);

  onSystemLoaded();

}, "json");


var systemApp = [
  "c:/windows/explorer.exe",
  "c:/windows/settings.exe",
  "c:/windows/photo.exe",
  "c:/windows/coder.exe",
];

// 取消图片拖动和右键反应
window.ondragstart = window.ondrop = window.oncontextmenu = (e)=> e.preventDefault();

// 开始键事件
$("os-start").onclick = function fc(e) {

  e.stopPropagation();
  $("os-start").classList.add("active");
  $("os-startmenu").classList.add("active");
  function sc() {

    $("os-start").classList.remove("active");
    $("os-startmenu").classList.remove("active");
    $("os-start").onclick = fc;
    document.removeEventListener("click", sc);

  };
  $("os-start").onclick = sc;
  document.addEventListener("click", sc);

};

// 开始菜单
$("os-startmenu").onclick = (e)=> e.stopPropagation();
draggable($("os-startmenu"), true);


// 系统网络部分加载完成的回调
function onSystemLoaded() {

  Win.create(systemApp[0]);
  Win.create(systemApp[3], "c:/windows/coder.exe/index.html");

}

