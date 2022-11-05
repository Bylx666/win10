
module.exports = (req, res)=> {

  var b = "";
  req.on("data", (c)=> b+=c);
  req.on("end", ()=> {

    b = JSON.parse(b);
    console.log(b.m);

  });
  
};
