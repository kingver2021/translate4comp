    const rootPath = "D:/xmw/";      //服务器根目录
    const indexPath = "/";             //网页文件存放目录 
    var fs = require("fs");
    const { unescape } = require("querystring");
    var query = require("./lib/query");
    var vars = require("./vars");

    exports.getHtml = async function getHtml(attr, value, props, params, cookie, lable){

        if(vars.paths.length==0) vars.paths.push(attr);
        
        var parseStr = fs.readFileSync(rootPath + value).toString();
        
        
        (/<template>([\s\S]+)<\/template>/m).exec(parseStr);
        var html = RegExp.$1;
        var it;
        var ifArr = html.match(/<t-if\s*.+>[\s\S]+?<end if>/mg);
        if(ifArr!==null)
        {
        for(it in ifArr)
        {
           
            if(ifArr[it].indexOf("cookie")!==-1)
            {
                ifArr[it].match(/<t-if\s+cookie\((\S+?)\)\s*>/);
                var name = RegExp.$1;
                if(getCookie(cookie,name)!=="")
                {
                    ifArr[it] = ifArr[it].replace(/<t-if\s+cookie\(\S+?\)\s*?>/, ""); 
                    ifArr[it] = ifArr[it].replace(/<else>[\s\S]+?<end if>/m, "");
                    html = html.replace(/<t-if.+>[\s\S]+<end if>/m, ifArr[it]);
                   
                }
                else
                {
                   ifArr[it] = ifArr[it].replace(/<t-if\s+cookie\(\S+?\)\s*?>[\s\S]+?<else>/, ""); 
                   ifArr[it] = ifArr[it].replace("<end if>", "");
                   html = html.replace(/<t-if.+>[\s\S]+<end if>/m, ifArr[it]);
                   
                }
           
            }
            else if(ifArr[it].indexOf("[")!==-1)
            {
                ifArr[it].match(/<t-if\s+\[(\S+?)\]\s*=\s*(\S+?)\s*>/);
                if(unescape(params[RegExp.$1])===RegExp.$2)
                    {
                        ifArr[it] = ifArr[it].replace(/<t-if\s+\[(\S+?)\]\s*=\s*(\S+?)\s*>/, ""); 
                        ifArr[it] = ifArr[it].replace(/<else>[\s\S]+?<end if>/m, "");
                        html = html.replace(/<t-if.+>[\s\S]+<end if>/m, ifArr[it]);
                    }
                else
                    {
                        ifArr[it] = ifArr[it].replace(/<t-if\s+\[(\S+?)\]\s*=\s*(\S+?)\s*>[\s\S]+?<else>/, ""); 
                        ifArr[it] = ifArr[it].replace("<end if>", "");
                        html = html.replace(/<t-if.+>[\s\S]+<end if>/m, ifArr[it]);
                    }
            }
        }
        }
        
        //替换{{}}的文本内容
        var v = ptys(parseStr);
        if(v.length!=0)
        {
        
        for(i in v)
        {
            html = html.replace(new RegExp("\{\{"+ v[i] +"\}\}", "g"),  props[v[i]]);
            parseStr = parseStr.replace(new RegExp("this\.ptys\."+v[i], "g"),  props[v[i]]);
        
        }
        }
        
        if(/\\\[\S+?\\\]/.test(html))
        {
                var ms = html.match(/\\\[\S+?\\\]/g);
                for(it in ms)
                    html = html.replace(ms[it].slice(0,ms[it].length), unescape(params[ms[it].slice(2,ms[it].length-2)]));
        
        }
        
        if(/\\\[\S+?\\\]/.test(parseStr))
        {
                var ms = parseStr.match(/\\\[\S+?\\\]/g);
                for(it in ms)
                    parseStr = parseStr.replace(ms[it].slice(0,ms[it].length), unescape(params[ms[it].slice(2,ms[it].length-2)]));
        
        }
        
        if(/cookie\(\S+?\)/.test(parseStr)||/cookie\(\S+?\)/.test(html))
        {
            ms = parseStr.match(/cookie\(\S+?\)/g);
            for(it in ms)
            {
               ms[it].match(/cookie\((\S+?)\)/);
               name = RegExp.$1;
               parseStr = parseStr.replace(ms[it], getCookie(cookie, name));
            }
            ms = html.match(/cookie\(\S+?\)/g);
            for(it in ms)
            {
               ms[it].match(/cookie\((\S+?)\)/);
               name = RegExp.$1;
               html = html.replace(ms[it], getCookie(cookie, name));
            }
        }
        
        var pathId = findPath(vars.paths, attr);
         
        if((/vars:\{(.+?)\}/).test(parseStr))
        {
        var temp = RegExp.$1;
        //替换sql组件变量
        if(/dataSql:.+/.test(parseStr))
        {
        eval("var variables=" + parseStr.match(/vars:\{(.+?)\}/)[0].replace(":","=").split("=")[1]+";");
        var dx = parseStr.match(/dataSql:.+/)[0];
        v = dx.match(/vars\.\w+/g);
        for(it in v)
            dx = dx.replace(v[it], variables[v[it].split(".")[1]]);
        parseStr = parseStr.replace(/dataSql:.+/, dx);
        }
        //添加path
        var cx = "";
            dx = "";
             arr = ("global." + pathId).split(".");
            for(em=0;em<arr.length-1;em++);
             {   
                for(tx=0;tx<=em;tx++)
                {
                     cx = cx + arr[tx] + ".";
                     if(cx.slice(0,cx.length-1).indexOf(".")!=-1&&vars.js.indexOf(cx.slice(0,cx.length-1) + "={};\n")==-1)
                     dx = dx + cx.slice(0,cx.length-1) + "={};\n";
                }
            }   
            if(!has(dx, vars.setGlobal))
            {   
                 vars.js = vars.js + dx + "\n";    
                vars.setGlobal.push(dx); 
            }
        }     
        
        if(/dataSql:"(.+?)"/.test(parseStr))
        {  
            var addr = RegExp.$1.split("|")[0];
        
            if(/\bq\.(\w+\(.+\))/.test(addr))
                addr = addr.replace(addr.match(/\bq\.(\w+\(.+\))/)[0], eval("query."+RegExp.$1));
        
            temp = await query.query(addr);
        
            if(RegExp.$1.indexOf("toCookie")!==-1)
                exports.pageData.push(temp);
                
            var data = JSON.parse(temp.erase(";","<",">"));
        
            if(data.length===0)
              while(/q\.(\w+?)\(\{\{\S+?\}\}\)/.test(html))
                html = html.replace(/q\.(\w+?)\(\{\{\S+?\}\}\)/, eval("query." + RegExp.$1 + "(null)"));
            
           var reg1 = new RegExp("<.+?t-for[^<]+?/>");
           var reg2 = new RegExp("<.+?t-for.+?></.+?>");
        
           if(reg1.test(html))
           {
           var ele = html.match(reg1)[0];
           var compt;
           temp = "";
           for(a in data)
            { 
                    compt = ele;
                        for(e in data[a])
                          { 
                                if((new RegExp("q\\.(\\w+?)\\(([^\\)]*?\\{\\{"+ e +"\\}\\}[^\\)\\n]*?)\\)")).test(compt))
                                compt = compt.replace(new RegExp("q\\.\\w+\\([^\\)]*?\\{\\{"+ e +"\\}\\}[^\\)\\n]*?\\)", "g"), eval("query." + RegExp.$1 + "(" +RegExp.$2.replace("{{"+e+"}}",data[a][e]) + ")"));
                                compt = compt.replace(new RegExp("\\{\\{"+ e +"\\}\\}","g"), data[a][e]);
                            }
                       temp = temp + compt + "\n";
                       it++;
            }  
              
              
       
            if(temp!=="")
            {
                it = html.indexOf(ele) + ele.length;
                var ic = it;
                do
                ic++;
                while(!(html.charAt(ic)==="\n"));
                dx = html.slice(it, ic);
                html = html.replace(dx, "");
            } 
            else
             {
                it = html.indexOf(ele)+ele.length;
                if(html.charAt(it)==="|")
                {
                    html = html.replace(html.charAt(it), "");
                    html = html.replace(html.charAt(it), "");
                }
             }

             html = html.replace(ele, temp);
            }
            else if(reg2.test(html))
            {
            var ele = html.match(reg2)[0];
            temp = "";
            var compt;
            for(a in data)
            { 
                    compt = ele;
                        for(e in data[a])
                          {
                            if((new RegExp("q\\.(\\w+?)\\(([^\\)]*?\\{\\{"+ e +"\\}\\}[^\\)\\n]*?)\\)")).test(compt))
                                compt = compt.replace(new RegExp("q\\.\\w+\\([^\\)]*?\\{\\{"+ e +"\\}\\}[^\\)\\n]*?\\)", "g"), eval("query." + RegExp.$1 + "(" +RegExp.$2.replace("{{"+e+"}}",data[a][e]) + ")"));
                                compt = compt.replace(new RegExp("\\{\\{"+ e +"\\}\\}","g"), data[a][e]);
                            }
                       temp = temp + compt + "\n";
                       it++;
            }  
          
               
       
            if(temp!=="")
            {
                it = html.indexOf(ele) + ele.length;
                var ic = it;
                do
                ic++;
                while(!(html.charAt(ic)==="\n"));
                dx = html.slice(it, ic);
                html = html.replace(dx, "");
            } 
            else
             {
                it = html.indexOf(ele)+ele.length;
                if(html.charAt(it)==="|")
                {
                    html = html.replace(html.charAt(it), "");
                    html = html.replace(html.charAt(it), "");
                }
             }

             html = html.replace(ele, temp);

            }
            for(a in data)
                for(e in data[a])
                {  
                    if((new RegExp("q\\.(\\w+?)\\(([^\\)]*?\\{\\{"+ e +"\\}\\}[^\\)\\n]*?)\\)")).test(html))
                        html = html.replace(new RegExp("q\\.\\w+\\([^\)]*?\\{\\{"+ e +"\\}\\}[^\\)\\n]*?\\)", "g"), eval("query." + RegExp.$1 + "(" +RegExp.$2.replace("{{"+e+"}}",data[a][e]) + ")"));
                   html = html.replace(new RegExp("\\{\\{"+ e +"\\}\\}","g"),  data[a][e]);
                }
            
        }
        
        if(/updateSql:"(.+?)"/.test(parseStr))
        {
            arr = RegExp.$1.split(";");
            for(it=0;it<arr.length-1;it++)
                query.query(arr[it]+";");
        }
        
        var id = attr;
        html = addId(id, html);
         
        //转化src路径
        if(/src="\S+?"/.test(html))
        {
            if(html.indexOf(indexPath)!=-1&&indexPath!="/")
            {
              var pattern =  "src=\"(.+?\.\\"+indexPath+"\\\\)";
              temp = html.match(new RegExp(pattern,"g"));
              for(it in temp)
                  html = html.replace(RegExp.$1, "");
            }
            else
            {
                temp = html.match(new RegExp("src=\"(.+?\.\\\\)"));
                for(it in temp)
                 html = html.replace(RegExp.$1, "");
            }
        }
        
        (/<style>([\s\S]+)<\/style>/m).exec(parseStr);  
        temp = RegExp.$1;
        if((/\S/m).test(temp))
        {
        arr = temp.match(/.+?\{[\s\S]+?\}/mg);
        var bt;
        var first, last, middle;
        
        for(var em=0;em<arr.length;em++)
        {         
            /(\S+).*?\{/.exec(arr[em]);
            bt = RegExp.$1;
        
            var reg = new RegExp(RegExp.$1+"\\d{1,2}");
            if(reg.test("#"+attr))
            {
                arr[em] = arr[em].replace(bt, "#"+attr);
            }
            else if(bt!="#"+attr)
                 arr[em] = "#" + attr + " " + arr[em];
                
            if(lable==="first")
            {
                if((new RegExp("#"+attr+"\\{")).test(arr[em])&&(new RegExp("#"+attr.replace(/\d+$/,"")+":first\\{")).test(temp))
                {
                first = temp.match(new RegExp("#"+attr.replace(/\d+$/,"")+":first\\{([\\s\\S]+?)\\}","m"))[1];
                v = arr[em].match(/\{([\S\s]+)\}/m)[1];
                dx = rpCss(v, first);
                arr[em] = arr[em].replace(v, dx);
                }
                else if(new RegExp("#"+attr+"\\s+?#"+ attr.replace(/\d+$/,"") +":first\\s+.+").test(arr[em]))
                    arr[em] = arr[em].replace("#"+ attr.replace(/\d+$/,"") +":first","");
            } 
            if(lable==="middle")
            {
                if((new RegExp("#"+attr+"\\{")).test(arr[em])&&(new RegExp("#"+attr.replace(/\d+$/,"")+":middle\\{")).test(temp))
                {
                middle = temp.match(new RegExp("#"+attr.replace(/\d+$/,"")+":middle\\{([\\s\\S]+?)\\}","m"))[1];
                v = arr[em].match(/\{([\S\s]+)\}/m)[1];
                dx = rpCss(v, middle);
                arr[em] = arr[em].replace(v, dx);
                }
                else if(new RegExp("#"+attr+"\\s+?#"+ attr.replace(/\d+$/,"") +":middle\\s+.+").test(arr[em]))
                    arr[em] = arr[em].replace("#"+ attr.replace(/\d+$/,"") +":middle","");
            }
            if(lable==="last")
            {
                if((new RegExp("#"+attr+"\\{")).test(arr[em])&&(new RegExp("#"+attr.replace(/\d+$/,"")+":last\\{")).test(temp))
                {
                last = temp.match(new RegExp("#"+attr.replace(/\d+$/,"")+":last\\{([\\s\\S]+?)\\}","m"))[1];
                v = arr[em].match(/\{([\S\s]+)\}/m)[1];
                dx = rpCss(v, last);
                arr[em] = arr[em].replace(v, dx);
                }
                else if(new RegExp("#"+attr+"\\s+?#"+ attr.replace(/\d+$/,"") +":last\\s+.+").test(arr[em]))
                    arr[em] = arr[em].replace("#"+ attr.replace(/\d+$/,"") +":last","");
            }
            if(parseInt(attr.match(/\d+$/)===null?0:attr.match(/\d+$/)[0])%2===0)
            if((new RegExp("#"+attr + "\\s+?#"+ attr.replace(/\d+$/,"") +":single.*\\{")).test(arr[em]))
                vars.css2 += (arr[em].replace("#" + attr.replace(/\d+$/,"")+":single","") + "\n");
            if(parseInt(attr.match(/\d+$/)===null?0:attr.match(/\d+$/)[0])%2!==0)
            if((new RegExp("#"+attr + "\\s+?#"+ attr.replace(/\d+$/,"") +":double.*\\{")).test(arr[em]))
                vars.css2 += (arr[em].replace("#" + attr.replace(/\d+$/,"")+":double","") + "\n");
            
           if(/ever(\d+)/.test(arr[em]))
            {    
                 temp = RegExp.$1;
                 bt =  parseInt(attr.match(/\d+$/)===null?0:attr.match(/\d+$/)[0])+1;
                 if(bt>=parseInt(temp)&&bt%parseInt(temp)===0)
                 if((new RegExp("#"+attr + "\\s+?#"+ attr.replace(/\d+$/,"") +"\\:ever\\d+.*\\{")).test(arr[em]))
                          vars.css2 += (arr[em].replace("#" + attr.replace(/\d+$/,"")+":ever"+temp,"") + "\n");
           }
           
            if(/:first/.test(arr[em])||/:last/.test(arr[em])||/:middle/.test(arr[em])||/:last/.test(arr[em])||/:single/.test(arr[em])||/:double/.test(arr[em])||/:ever\d+/.test(arr[em]))
                arr[em] = "";
                
            if(arr[em])
                vars.css = vars.css +  arr[em] + "\n";
        }
            
        }
        
        //替换js事件函数
        if((/functions[\s\S]*?:[\s\S]*?\{([\s\S]+?\})[\s\S]*?\}/).test(parseStr))
        {
        
        var cx = "";
        var dx = "";
             arr = ("global." + pathId).split(".");
            for(em=0;em<arr.length-1;em++);
             {   
                for(tx=0;tx<=em;tx++)
                {
                     cx = cx + arr[tx] + ".";
                     if(cx.slice(0,cx.length-1).indexOf(".")!=-1&&vars.js.indexOf(cx.slice(0,cx.length-1) + "={};\n")==-1)
                     dx = dx + cx.slice(0,cx.length-1) + "={};\n";
                }
             }   
        
            if(!has(dx, vars.setGlobal))
            {   
                 vars.js = vars.js + dx + "\n";    
                vars.setGlobal.push(dx); 
            }
        }    
        
        if((/functions[\s\S]*?:[\s\S]*?\{([\s\S]+?[^,]+)<\/script>/).test(parseStr))
        {
        
        var funcs = getFuncs(RegExp.$1);
        
        temp = "";
        for(ix=0;ix<funcs.length;ix++)
        {
            if(funcs[ix].indexOf("this.path")!==-1)
                funcs[ix] = funcs[ix].replace(/this\.path/g, "global." + pathId);
            if(/\s*?g\.\S+?:function/.test(funcs[ix]))
            {   
                /\s*?g\.(\S+?):/.exec(funcs[ix]);
                val = RegExp.$1;
                if(vars.js.indexOf("function " + val + funcs[ix].replace(/\n.*?g[^\(]+/,""))==-1)
                     vars.js = vars.js + "function " + val + funcs[ix].replace(/\n.*?g[^\(]+/,"") + "\n";
            }
            else
                     temp += funcs[ix] + ",\n";
        }

        if(v)
        if(v.length!=0)
        {
            
        for(i in v)
                temp = temp.replace(new RegExp("this\\.ptys\\."+v[i], "g"),  props[v[i]]);
        }
        if(data)
                for(i in data)
                    for(e in data[i])
                        temp = temp.replace(new RegExp("this\\."+e, "g"),  data[i][e]);

        if(temp && vars.js.indexOf(temp)===-1)
            vars.js = vars.js + "    global." + pathId + "={\n        " + temp.slice(1,temp.length-2) + "\n}\n";

        }

        //事件函数
        if(/\s(on\S+?\s*=\s*")([^"]+?\(.*?\)")/.test(html))
        { 
            temp = html.match(/\b(on\S+?=")([^"]+?\(.*?\)")/g);
            for(em in temp)
            {
               
                /\b(on\S+?=")([^"]+?\(.*?\)")/.test(temp[em]);
                if(RegExp.$2.indexOf("g.")==0)
                {
                    var val = RegExp.$2.replace("g.", "");
                    html = html.replace(temp[em], RegExp.$1 + val);
                }
                else
                {
                    var  value = RegExp.$1;
                    var  value1 = RegExp.$2;
                    if(vars.js.indexOf(temp)!==-1)
                        html = html.replace(temp[em],  value + "global."+ pathId.replace(/\d+$/,"") + "." + value1);
                    else
                        html = html.replace(temp[em],  value + "global."+ pathId + "." + value1);
                }
            }
        }
        
        //加入组件变量
        if((/vars:\{(.+?)\}/).test(parseStr))
        {
        dx = "";
        arr = [];
        var start=0, end;
        if(RegExp.$1.indexOf(",")===-1)
            arr.push(RegExp.$1);
        else
        {
        it = RegExp.$1.length;
        while(it!==0)
        {
            if(!(RegExp.$1.charAt(RegExp.$1.length-it)!==","))
            {
                arr.push(RegExp.$1.slice(start, RegExp.$1.length-it));
                it--;
                while(RegExp.$1.charAt(RegExp.$1.length-it)===" ")
                it--;
                start = RegExp.$1.length-it;
            }
            else if(RegExp.$1.charAt(RegExp.$1.length-it)==="\"")
                {
                    end = RegExp.$1.indexOf("\"", RegExp.$1.length-it+1);
                    arr.push(RegExp.$1.slice(start, end+1));
                    it = RegExp.$1.length - end - 2;
                    while(RegExp.$1.charAt(RegExp.$1.length-it)===" ")
                     it--;
                     start = RegExp.$1.length-it;
                }
            else
                it--;
        }
        if(start<RegExp.$1.length)
            arr.push(RegExp.$1.slice(start));
        }
        for(it in arr)
        {
                dx = dx + "global." + pathId + "." + arr[it].split(":")[0] + "=" + arr[it].split(":")[1] + ";\n"; 
        }
        vars.js = vars.js + dx + "\n";
        }
        
        if((/vars:\{(.+?)\}/).test(parseStr))
        {
            temp = RegExp.$1.split(",");
            for(it in temp)
                 vars.js = vars.js.replace(new RegExp("vars."+temp[it].split(":")[0].replace(/^\s+/, ""),"g"), "global." + pathId + "." + temp[it].split(":")[0].replace(/^\s+/, ""),"g");
        }
        
        //替换子组件
        if(parseStr.indexOf("components")!=-1)
        {
        var comps = compont(parseStr);
        var ss, ss2;
        var rpText;
        var pp = {};
        var itm;
        var lable = "";
        
        for(itm in comps) 
        {  
        
        vars.paths.push(pathId + "." + itm);
        
        ss = new RegExp("<" + itm + "\\b.*?\/>");
        ss2 = new RegExp("<" + itm + "\\b.*?><\/" + itm + ">");
        
        var num=0;
        if(ss2.test(html))
        {
                if(new RegExp("<" + itm + "\\b.*?><\/" + itm + ">").test(html))
                    var lg = html.match(new RegExp("<" + itm + "\\b.*?><\/" + itm + ">","g")).length;
        
                while(ss2.test(html))
               {        
               if((new RegExp("<"+itm+"\\b.*? t-bind=\"([^\\n]+?)\".*?>")).test(html));
               {  
                    arr =RegExp.$1.clearSpec(false).splitEx(";","<",">");
                   for(em in arr)
                   {
                       temp = arr[em].splitEx(":","<",">")[0];
                       if(arr[em].splitEx(":","<",">")[1])
                       pp[temp] =  arr[em].splitEx(":","<",">")[1].clearSpec(true);
                       else
                       pp[temp] = "";
                       if(arr[em].splitEx(":","<",">").length>2)
                       for(it=2;it<arr[em].splitEx(":","<",">").length;it++)
                           pp[temp]= pp[temp] + ":" + arr[em].splitEx(":","<",">")[it].clearSpec(true);
                   }
                  
               }
        
               if(num!=0)vars.paths.push(pathId + "." + itm + num);
        
               if(num===0)
                    lable = "first"
                else if(num===lg-1)
                    lable = "last"
                else
                    lable = "middle";
                
               rpText = await getHtml(itm+(num==0?"":num), comps[itm], pp, params, cookie, lable);
               
                   html = html.replace(ss2, rpText);
                   num += 1;
               }
               
        }
        else
        {   
        if(new RegExp("<" + itm + "\\b.*?\/>").test(html))
            var lg = html.match(new RegExp("<" + itm + "\\b.*?\/>","g")).length;
        
        while(ss.test(html))
        {
        if((new RegExp("<"+itm+"\\b.*? t-bind=\"([^\\n]+?)\".*?>")).test(html));
        {  
        
            arr = RegExp.$1.clearSpec(false).splitEx(";","<",">");
            for(em in arr)
            {
                temp = arr[em].splitEx(":","<",">")[0];
                if(arr[em].splitEx(":","<",">")[1])
                pp[temp] =  arr[em].splitEx(":","<",">")[1].clearSpec(true);
                else
                pp[temp] = "";
                
                if(arr[em].splitEx(":","<",">").length>2)
                    for(it=2;it<arr[em].splitEx(":","<",">").length;it++)
                        pp[temp]= pp[temp] + ":" + arr[em].splitEx(":","<",">")[it].clearSpec(true);
            }
           
        }
        if(num!=0)vars.paths.push(pathId + "." + itm + num);
        if(num===0)
                    lable = "first"
        else if(num===lg-1)
                    lable = "last"
        else
                    lable = "middle";
        rpText = await getHtml(itm+(num==0?"":num), comps[itm], pp, params, cookie, lable);
        
            html = html.replace(ss, rpText);
            num += 1;
        
        }
        
        }
        
        }
        
        }
        
        return html;
        
        }
        
        

function compont(text){
    var arr = (/<script>[\s\S]*components[\s]*:[\s]*(\{[\s\S]+?\})[\s\S]*<\/script>/im).exec(text);
    var coms = eval("comp="+RegExp.$1);
    return coms;
}

function ptys(text){
    var arr = (/<script>[\s\S]*(ptys:\[[\s\S]+?\])[\s\S]*<\/script>/im).test(text);
    if(arr)
       var ptys = eval(RegExp.$1.replace(":","="));
         
    else    
        var ptys = [];

    return ptys;
}



function addId(id, html){
    var i=0;
    while(html.charAt(i)==" "||html.charAt(i)=="\n"||html.charAt(i)=="\r")
        i+=1;
    var testHtml = /<.+>/.exec(html)[0];
    var num = testHtml.indexOf(" ")==-1?testHtml.indexOf(">"):testHtml.indexOf(" ");
    var str1 = html.slice(i,i+num);
    var str2 = html.slice(i+num);
    return str1 + " id=\"" + id + "\" " + str2;
}

function findPath(paths, last){
    var arr = new Array();
    for(i=0;i<paths.length;i++)
    {
        arr = paths[i].split(".");
        if(arr[arr.length-1]===last)
            return paths[i];
    }
    return "";
}

function has(attr, reached){
    for(it in reached)
        if(reached[it]==attr)
            return true;
    return false;
}

function getFuncs(str){
    var arr=[];
    var num=0, index=0;
    while(!(str.indexOf(":function")==-1))
    {
        if(str[0]==",")str = str.slice(2);
        while(index<str.length)
        {
            if(str[index]=="{")
                num += 1;
            if(str[index]=="}")
             {  
                num -= 1;
                if(num==0)break;
             }
             
            index++;
        }
        arr.push(str.slice(1,index+1));
        str = str.slice(index+2);
        index=0;
    }

    return arr;
}

function clearSpec(bReverese){
    if(bReverese)
    return this.replace(/&nbsp/g,"&nbsp;").replace(/&gt/g,"&gt;").replace(/&lt/g,"&lt;").replace(/&quot/g,"&quot;").replace(/&amp/g,"&amp;");
    else
    {
      var temp = this.replace(/&nbsp;/g,"&nbsp").replace(/&gt;/g,"&gt").replace(/&lt;/g,"&lt").replace(/&quot;/g,"&quot").replace(/&amp;/g,"&amp");

      return temp
    }
}

function getCookie(cookie, name)
{
    if(!cookie)return "";
    var items = cookie.split(";");
    for(it in items)
        if(items[it].replace(/^\s*/,"").indexOf(name)===0)
            return items[it].split("=")[1];
    return "";

}

String.prototype.clearSpec = clearSpec;

function splitEx(char, begin, end)
{
    var arr = [];
    var num = 0, index = 0, start = 0;
    while(index <= this.length-1)
    {
        if(this.charAt(index)==begin)
            num += 1;
        if(this.charAt(index)==end)
            num -= 1;
        if(this.charAt(index)==char&&num==0&&start!=index)
         {
               arr.push(this.slice(start, index));
               start = index + 1;
         }

        index ++;
    }
   if(start<index)
    arr.push(this.slice(start,index));
    return arr;
}

String.prototype.splitEx = splitEx;

function erase(char, begin, end)
{  
    var index = 0;
    var num = 0, num1 = 0;
    var content = this;
    while(index <= this.length-1)
    {
        if(this.charAt(index)==begin)
            num += 1; 
        if(this.charAt(index)==end)
            num -= 1;
        if(this.charAt(index)==char&&num==0)
         {
               content = content.slice(0, index) + " " + content.slice(index+1);
         }

        index ++;
    }
    return content;
}

String.prototype.erase = erase;

function rpCss(oCss, rCss)
{
    var finalCss = oCss;
    var arr1 = oCss.split("\n");
    var arr2 = rCss.split("\n");
    var name1,name2;
    var ined;
    for(it in arr2)
    {
        ined = false;
        name2 = arr2[it].split(":")[0];
        for(ic in arr1)
        {
            name1 = arr1[ic].split(":")[0];
            if(name2===name1)
            {
                finalCss = finalCss.replace(arr1[ic], arr2[it]);
                ined = true;
            }
        }
        if(!ined)
            finalCss += (arr2[it]+"\n");
    }
    return finalCss;
}

exports.pageData=[];

