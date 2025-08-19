轻量级组件化开发 
 
模块(程序包)是可以快速、灵活地实现网页组件化方式开发的程序包。开发者只需要符合简单的
语法，通过开发可以嵌套可重用的简单的tou文件，就可以组合出复杂完善的网页应用。


1. 最简单的tou文件：
```
<template>
...
</template>

<script>
...
</script>

<style>
...
</style>
```
包含三个部分，分别为：1) 模板(template)-网页html代码部分; 2) 脚本(script)-
JavaScript部分; 3) 样式(style)-css样式。

2.tou文件各部分说明：

一：模板(template)
    
    ● 组件使用 <组件名/> 或 <组件名></组件名>
    如：
     <template>
        <div>
            <chaxun></chaxun>  或  <chaxun/>
        </div>
    </template>

    ● 插值 {{}}  (数据值要么是<script>中指名的上级组件传递的属性值，要么是数
    据请求语句返回的数据值)
    如：
        <template>
        <button>{{value}}</button>
        </template>

    ● 插值 t-bind 绑定组件属性
    如：
        <div><chaxun t-bind="IP:123456"></chaxun></div>

        绑定名为IP 值为123456的属性。

        <div><chaxun t-bind="IP:{{current}}"></chaxun></div>

        #使用q.函数名({{...}})的方式使用query.js文件里面自定义的函数转换查
        询数据的显示形式。

        绑定名为IP 值为current的属性。

    ● 循环 t-for 
    如：
        <item t-for t-bind="name:{{name}};"></item>||<div><a href=
        "history.back();">返回</a></div>  ||和||后面的内容为可选。

        根据数据对象的条数重复使用相同数量的组件<item></item>并绑定数据，例如
        这里是每条数据对象的name属性的值被绑定到组件属性name中。

        如果查询到的数据条数为0，则显示||后面的替换内容。

    ● 选择 t-if
    如：
        <t-if cookie(id)> 或 <t-if [name]="perpo">
            ...
        <else>
            ...
        <end if>                       
        根据cookie中是否存在id的项显示不同内容，/或根据queryString(地址?后面
        
        的)中的name的值是否为"perpo"显示不同内容。


    ● 指定事件处理函数 on /click/focus/... = "handler()";在函数名前加上"g."
    即g.handler调用全局函数(全局函数的定义方法可看下面介绍)。
    如：
        <button onClick="showMessage()"></button>

    ● 图片等的src路径写成相对路径。

二：脚本(script)

脚本包含一个名为def对象，其属性包括 组件变量、子组件、父组件属性、事件处理函数
、请求数据文件地址等。 
```
如：
● var def={
      1.  vars:{aa:"aa"},        //组件变量，即作用域只存在于组件内的变量，
      不同作用域的组件变量名称可以相同互不影响。要在脚本内引用组件变量，用
      vars.变量名的形式,如vars.aa=0。

      2.  components:{aa:"/touFiles/button.tou",bb:"/touFiles/text.tou"},
      //组件内用到的下一级子组件(名称级tou文件地址。

      3.  dataSql:"select * from software;",     //请求数据sql语句。

        或者（带参数） dataSql:"select * from software where name=
        '\[fireFox\]';",

    dataSql:"select * from software where name='\[fireFox\]';|toCookie" 
     ，将查询结果存入cookie以便分页显示

        // \[\]表示url中?后的查询字符中的对应名称的值(可在组件文件中任意位置
        引用查询字符中的对应名称的值)。

     dataSql:"select * from software where name='cookie(name)';", //表示
     cookie中对应名称的值,其中cookie(name)可以在组件中任意位置使用。

     4. updateSql:"update users set name='user';"  //没有返回值的数据库请
     求使用updateSql。

     5.  ptys:["url","value"],       //上一级组件传递的属性列表。

     6. functions:{                 //事件处理函数
            query:function(){
                location.href = "search.html?keyword=this.ptys.keyword";
               //(事件函数内引用上一级组件属性的写法this.ptys.属性名,引用数
               据文件的数据的写法this.属性名)
            //如果在函数名前加g.即定义为全局函数，如 g.query:function(){} 。
            }
        }
    };
```    

三：样式(style)

样式选择器，除加入组件作用域特性外，与一般css选择器写法一样。

如：
```
    #组件名{}   //当前组件最外层html元素样式。 
    
    tagName 如 button{} 、 div{}   //当前组件内所有tagName的样式。

    .className{}      //当前组件内指定类名的元素的样式。

    指定排序元素样式：first middle last single double

    first 指定上一级组件中同名组件中排序为第一个的组件样式  
    如  #item:first{color:yellow}

    last 指定上一级组件中同名组件中排序为最后一个的组件样式   
    如  #item:last{color:yellow}

    middle 指定上一级组件中同名组件中排序为非第一和最后一个的组件样式   
    如  #item:middle{color:yellow}

    single 指定上一级组件中同名组件中排序为奇数的组件样式  
    如  #item:single{color:yellow}

    double 指定上一级组件中同名组件中排序为偶数的组件样式   
    如  #item:first{color:yellow}

    everN 指定上一级组件中同名组件中排序为第N个的组件的样式
    如  #item ever7:{color:yellow;boder:1px solid blue;}
    
    >>配合使用：指定上一级组件中同名组件中排序为第一个的组件中a标签
    的样式：

    #item:first a{color:yellow;font-size:36px;}
```
3.node.js配置     将下面代码复制保存成.js文件，如：index.js， 终端或命令提示符下运行该文件 如：node index.js：
```
var translate = require("translate4comp");
var vars = require("translate4comp/vars");

//添加路由

async function pages(req, res){
        var pp = {};
        var ss;
        var arr;
        var temp;
        var num;
        var lable="";

        if(req.url.indexOf("?")==-1)
            var qStr = {}
        else
            var qStr = urlQuery(req.url);
        

        var path = req.url.indexOf("?")!=-1?req.url.slice(0,req.url.indexOf("?")):req.url;

        var data = fs.readFileSync(__dirname+path).toString();

        if(data.indexOf("var components")!==-1)
            eval(data.match(/var components\s*=\s*.+/g)[0])
        else
            var components = {};

        for(itm in components)
        { 
          vars.paths.push(itm);
    
          num=0; 
          ss = new RegExp("<" + itm + "\\b.*?\/>");
          if(new RegExp("<" + itm + "\\b.*?\/>").test(data))
            var lg = data.match(new RegExp("<" + itm + "\\b.*?\/>","g")).length;

         while(ss.test(data))
         {
    
        if((new RegExp("<"+itm+" t-bind=\"([^\n]+?)\".*?>")).test(data))
        {  
        arr = RegExp.$1.split(";");
        for(em in arr)
        {
            temp = arr[em].split(":")[0];
            pp[temp] = arr[em].split(":")[1];
        }

        }

    if(num!=0)vars.paths.push(itm + num);
    if(num===0)
            lable = "first"
        else if(num===lg-1)
            lable = "last"
        else
            lable = "middle";
    var tarText = await translate.getHtml(itm+(num==0?"":num), components[itm], pp, qStr, req.headers.cookie, lable);

    data = data.replace(ss, tarText);
    
    num += 1;
    
    }
   
    }

    var it = data.indexOf("</title>") + 8;
    data = data.substring(0, it) + '\n<script type="text/javascript" src="https://xmnet6.com/script/ipRecord.js"></script>' +  data.substring(it+1);

    data = data.replace("<style><\/style>","<style>\n"+ vars.css +"\n"+ vars.css2 +"\n<\/style>");
    data = data.replace(/var components.+/,"var global={};" + vars.js);
    arr = data .match(/style="\S+"/g);
    for(it in arr)
    {
        temp = arr[it];
        arr[it] = arr[it].replace(/[^;"]+:undefined;/g,"");
        data = data.replace(temp, arr[it]);
    }
    data = data.replace(/title\s*=\s*"undefined"/g,"");
    
    vars.reset();
    
   if(translate.pageData.length!==0)
    { 
       var cookie = [];
       var pageName = req.url.match(/(\w+)\.html/)[1]; 

        for(it=0;it<translate.pageData.length;it++) 
            cookie.push(globalVars[pageName] + it +"=" + escape(translate.pageData[it]));

       res.setHeader("Set-Cookie", cookie) ;
    
        translate.pageData = [];
    } 
    
    res.end(data);


};

function image(req,res){
    var data = fs.readFileSync(__dirname+req.url.split("?")[0]);
    res.end(data);
    
};

function script(req, res)
{ 
    var data = fs.readFileSync(__dirname+req.url).toString();
    res.end(data);
}

//服务器新建
http.createServer(function (request, response) {
    response.setHeader("Content-Type", "text/html; charset=utf-8");
    var regs = [/\/pages\/\S+\.html/, /\/pages\/images\/\S+/,/\/script\/\S+/,/\/ajax\//];
    var it=0;
    while(it<regs.length)
    {
        if(regs[it].test(request.url))
            break;
        it++;
    }
    if(it===regs.length)response.end();
    
    switch(it)
    {
        case 0:
            pages(request,response);
            break;
        case 1:
            image(request, response);
            break;
        case 2:
            script(request, response);
        case 3:
            ...
        
    }

}).listen(2790);

```



4. 查询数据库，打开translate4comp文件夹里的query.js文件对query函数进行修改。

   以下是示例：
```
var cnn = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"aabbcc",
    port:"3306",
    database:"mydb"
});

function qy(sql){return new Promise((resolve,reject)=>{
    cnn.query(sql,(err, result)=>{
        if(err)
            reject(err)
        else
            resolve(JSON.stringify(result));
    });
    }).then(function(rs){return rs;}).catch(function(err){console.log(err);});
}

    var query = async function(sql)
    {
            var rs = await qy(sql);
            return rs;
            
    }
exports.query = query;

还可以在query.js里面定义个性化的函数，用于将查询到的字段转换成想要的显示结果。
function tel(tel){
    if(tel===null)
        return "未指定";
    return tel;
}
exports.tel = tel;

 #使用q.函数名({{...}})的方式使用query.js文件里面自定义的函数转换查询数据的显示形式。
```

开始使用。

1）npm install translate4comp
2)打开 node_modules目录下的 translate4comp 文件 把头两项修改成

    const rootPath = "M:/myServer/";      //服务器根目录
    const indexPath = "pages";             //网页文件存放目录(相对于网站根目录) 


实例：
-----index.html
```
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>首页</title>
<script>
var components = {head:"touFiles/head.tou",daohang:"touFiles/daohang.tou",cBody:"touFiles/czHalfBody.tou",bottom:"touFiles/bottom.tou"};   //本页包含的所有组件声明及路径
</script>
<style></style>                  //空的样式标签（不可缺少）        
</head>

<body>
<div>
<head/>                          //组件使用
<daohang/>                    
<cBody/>
<bottom/>
</div>

</body>
</html>
```