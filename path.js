
/*

  path.js
  "c盘"是系统中内置的系统文件磁盘，用户无权限更改。
  但为了用户可以读取这些文件，编写这个nodejs脚本用来为这些静态文件生成索引，让系统可以获取一个目录的信息。
  包括根目录，每层目录会生成一个".path.json"，没有此文件系统将无法读取文件夹信息。
  每次系统新添，删除，改名任何文件或文件夹都需要运行一次此脚本，使系统读取无误。
  
*/

const fs = require("fs");
const path = require("path");

const PN = ".path.json";

function nextDir(p) {

  const oj = [];
  const ap = path.resolve(p)
  const a = fs.readdirSync(ap);
  for(let i = 0; i < a.length; ++i) {

    const cp = path.join(ap, a[i]);
    try {

      const st = fs.statSync(cp);
      const isDir = st.isDirectory();

      oj.push({
        "type": isDir ? "dir" : "file",
        "size": isDir ? null : st.size,
        "name": a[i],
        "path": cp.replace(__dirname+"\\", "").replace(/\\/g, "/"),
        "sha": null,
        "mtime": st.mtime,
        "ctime": st.ctime
      });

      if(isDir) nextDir(cp);

    }catch(e) {

      console.warn(e.message);

    }
    
  }

  const pn = path.join(ap, PN);

  // 若.path.json不存在就把这个.path.json本身也写进去
  try {

    fs.accessSync(pn);

  }catch {

    oj.push({
      "type": "file",
      "size": Buffer.byteLength(JSON.stringify(oj)),
      "name": PN,
      "path": pn.replace(__dirname+"\\", "").replace(/\\/g, "/"),
      "sha": null,
      "mtime": Date.now(),
      "ctime": Date.now()
    });

  }

  fs.writeFile(pn, JSON.stringify(oj), "utf-8", (e)=> {

    if(e) console.warn(e.message);
    else console.log("完成:"+pn);

  });

}
nextDir("./");
