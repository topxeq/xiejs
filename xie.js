function FuncContext() {
    this.VarsLocalMapM  = {}
	this.VarsM          = []
	this.ReturnPointerM = -1
	// this.RegsM          *Regs

	this.Layer = 0
}


function Xie(...globalsA) {
    this.versionG = "0.0.1";
    
    this.SourceM = [];
    this.CodeListM = [];
    this.InstrListM = [];
    this.CodeSourceMapM = {};
    this.LabelsM = {};
    this.VarIndexMapM = {};
    this.VarNameMapM = {};

    this.CodePointerM= 0;

    this.StackM = [];
    this.StackPointerM = 0;

    this.FuncStackM = [];
    this.FuncStackPointerM = 0;

    this.FuncContextM = new FuncContext();

    this.CurrentFuncContextM = this.FuncContextM;

    this.ErrorHandlerM = -1;


	this.setVar("backQuoteG", "`")
	this.setVar("undefined", undefined)
	this.setVar("newLineG", "\n")

}

Xie.InstrNameSet = {
    // internal & debug related
    "invalidInstr": 12, // 无效指令，用于内部表示有错误的指令

    "version": 100, // 获取当前谢语言版本，结果压栈或放入最后一个可选参数中（后面结果放入的情况大多数指令类似，不再重复，特殊的情况是存在可变参数个数的时候，结果变量会放到第一个不可选参数中，也不再重复）
    "版本":      100,

    "pass": 101, // 不做任何事情的指令
    "过":    101,

    "debug": 102, // 显示内部调试信息
    "调试":    102,

    "debugInfo": 103, // 获取调试信息
    "varInfo":   104, // 获取变量信息

    "help": 105, // 提供帮助信息

    "onError": 106, // 设置出错处理代码块，如有第一个参数，是一个标号，表示要跳转到的代码块位置，如无参数，表示清除（不设置任何错误处理代码块）

    "isUndef": 111, // 判断变量是否未被声明（定义），第一个结果参数可省略，第二个参数是要判断的变量
    "是否未定义":   111,
    "isDef":   112, // 判断变量是否已被声明（定义），第一个结果参数可省略，第二个参数是要判断的变量
    "是否已定义":   112,
    "isNil":   113, // 判断变量是否是nil，第一个结果参数可省略，第二个参数是要判断的变量

    "test": 121, // 内部测试用，测试两个数值是否相等

    "typeOf": 131, // 获取变量或数值类型（字符串格式），省略所有参数表示获取栈顶值的类型（不弹栈）
    "类型":     131,

    "layer": 141, // 获取变量所处的层级（主函数层级为0，调用的第一个函数层级为1，再嵌套调用的为2，……）

    "loadCode": 151, // 载入字符串格式的谢语言代码到当前虚拟机中（加在最后），出错则返回TXERROR：开头的字符串说明原因
    "载入代码":     151,

    "len": 161, // 获取字符串、列表、映射等的长度，参数全省略表示取看栈值
    "长度":  161,

    "fatalf": 170, // 类似pl输出信息后退出程序运行

    "goto": 180, // 无条件跳转到指定标号处
    "jmp":  180,
    "转到":   180,

    "exit": 199, // 退出程序运行
    "终止":   199,

    // var related
    "global": 201, // 声明全局变量
    "声明全局":   201,

    "var":  203, // 声明局部变量
    "声明变量": 203,

    "ref": 210, // 获取变量的引用（取地址）
    "取引用": 210,

    "unref": 211, // 对引用进行解引用
    "解引用":   211,

    "assignRef": 212, // 根据引用进行赋值（将引用指向的变量赋值）
    "引用赋值":      212,

    // push/peek/pop related
    "push": 220, // 将数值压栈
    "入栈":   220,

    "push$": 221,

    "peek":  222, // 查看栈顶数值（不弹栈）
    "看栈":    222,
    "peek$": 223,

    "pop":  224, // 弹出栈顶数值，结果参数如果省略相当于丢弃栈顶值
    "出栈":   224,
    "pop$": 225,

    "peek*": 226, // from reg
    "pop*":  227, // from reg

    "pushInt":  231,
    "pushInt$": 232,
    "pushInt#": 233,
    "pushInt*": 234,

    "clearStack": 240,

    // "pushLocal": 290,

    // reg related

    "regInt":  310,
    "regInt#": 312, // from number

    // assign related
    "assign": 401, // 赋值
    "=":      401,
    "赋值":     401,

    "assign$":   402,
    "assignInt": 410,
    "assignI":   411,

    "assignGlobal": 491, // 声明（如果未声明的话）并赋值一个全局变量

    "assignLocal": 492, // 声明（如果未声明的话）并赋值一个局部变量
    "局部赋值":        492,

    // if/else, switch related
    "if": 610, // 判断第一个参数（布尔类型，如果省略则表示取弹栈值）如果是true，则跳转到指定标号处
    "是则": 610,

    "ifNot": 611, // 判断第一个参数（布尔类型，如果省略则表示取弹栈值）如果是false，则跳转到指定标号处
    "否则":    611,

    "if$":    618,
    "if*":    619,
    "ifNot$": 621,
    "否则$":    621,

    "ifEval": 631, // 判断第一个参数（字符串类型）表示的表达式计算结果如果是true，则跳转到指定标号处
    "表达式是则":  631,

    // compare related
    "==": 701, // 判断两个数值是否相等，无参数时，比较两个弹栈值，结果压栈；参数为1个时是结果参数，两个数值从堆栈获取；参数为2个时，表示两个数值，结果压栈；参数为3个时，第一个参数是结果参数，后两个为待比较数值
    "等于": 701,

    "!=":  702, // 判断两个数值是否不等，无参数时，比较两个弹栈值，结果压栈；参数为1个时是结果参数，两个数值从堆栈获取；参数为2个时，表示两个数值，结果压栈；参数为3个时，第一个参数是结果参数，后两个为待比较数值
    "不等于": 702,

    "<":  703, // 判断两个数值是否是第一个数值小于第二个数值，无参数时，比较两个弹栈值（注意弹栈值先弹出的为第二个待比较数值），结果压栈；参数为1个时是结果参数，两个数值从堆栈获取；参数为2个时，表示两个数值，结果压栈；参数为3个时，第一个参数是结果参数，后两个为待比较数值
    ">":  704, // 判断两个数值是否是第一个数值大于第二个数值，无参数时，比较两个弹栈值（注意弹栈值先弹出的为第二个待比较数值），结果压栈；参数为1个时是结果参数，两个数值从堆栈获取；参数为2个时，表示两个数值，结果压栈；参数为3个时，第一个参数是结果参数，后两个为待比较数值
    "<=": 705, // 判断两个数值是否是第一个数值小于等于第二个数值，无参数时，比较两个弹栈值（注意弹栈值先弹出的为第二个待比较数值），结果压栈；参数为1个时是结果参数，两个数值从堆栈获取；参数为2个时，表示两个数值，结果压栈；参数为3个时，第一个参数是结果参数，后两个为待比较数值
    ">=": 705, // 判断两个数值是否是第一个数值大于等于第二个数值，无参数时，比较两个弹栈值（注意弹栈值先弹出的为第二个待比较数值），结果压栈；参数为1个时是结果参数，两个数值从堆栈获取；参数为2个时，表示两个数值，结果压栈；参数为3个时，第一个参数是结果参数，后两个为待比较数值

    ">i":   710,
    "<i":   720,
    "整数小于": 720,
    "<i$":  721,
    "<i*":  722,

    "cmp": 790, // 比较两个数值，根据结果返回-1，0或1，分别表示小于、等于、大于，无参数时，比较两个弹栈值（注意弹栈值先弹出的为第二个待比较数值），结果压栈；参数为1个时是结果参数，两个数值从堆栈获取；参数为2个时，表示两个数值，结果压栈；参数为3个时，第一个参数是结果参数，后两个为待比较数值
    "比较":  790,

    // operator related
    "inc": 801, // 将某个整数变量的值加1，省略参数的话将操作栈顶值
    "加一":  801,

    "inc$": 802,
    "inc*": 803,

    "dec": 810, // 将某个整数变量的值减1，省略参数的话将操作栈顶值
    "减一":  810,

    "dec$": 811,

    "dec*":     812,
    "intAdd":   820,
    "整数加":      820,
    "intAdd$":  821,
    "整数加$":     821,
    "intDiv":   831,
    "floatAdd": 840,
    "floatDiv": 848,

    "add": 901, // 两个数值相加，无参数时，将两个弹栈值相加（注意弹栈值先弹出的为第二个数值），结果压栈；参数为1个时是结果参数，两个数值从堆栈获取；参数为2个时，表示两个数值，结果压栈；参数为3个时，第一个参数是结果参数，后两个为待计算数值
    "+":   901,
    "加":   901,

    "sub": 902, // 两个数值相减，无参数时，将两个弹栈值相加（注意弹栈值先弹出的为第二个数值），结果压栈；参数为1个时是结果参数，两个数值从堆栈获取；参数为2个时，表示两个数值，结果压栈；参数为3个时，第一个参数是结果参数，后两个为待计算数值
    "-":   902,
    "减":   902,

    "mul": 903, // 两个数值相乘，无参数时，将两个弹栈值相加（注意弹栈值先弹出的为第二个数值），结果压栈；参数为1个时是结果参数，两个数值从堆栈获取；参数为2个时，表示两个数值，结果压栈；参数为3个时，第一个参数是结果参数，后两个为待计算数值
    "*":   903,
    "乘":   903,

    "div": 904, // 两个数值相除，无参数时，将两个弹栈值相加（注意弹栈值先弹出的为第二个数值），结果压栈；参数为1个时是结果参数，两个数值从堆栈获取；参数为2个时，表示两个数值，结果压栈；参数为3个时，第一个参数是结果参数，后两个为待计算数值
    "/":   904,
    "除":   904,

    "mod": 905, // 两个数值做取模计算，无参数时，将两个弹栈值相加（注意弹栈值先弹出的为第二个数值），结果压栈；参数为1个时是结果参数，两个数值从堆栈获取；参数为2个时，表示两个数值，结果压栈；参数为3个时，第一个参数是结果参数，后两个为待计算数值
    "%":   905,
    "取模":  905,

    "!": 930, // 取反操作符，对于布尔值取反，即true -> false，false -> true。对于其他数值，如果是未定义的变量（即Undefined），返回true，否则返回false

    "not": 931, // 逻辑非操作符，对于布尔值取反，即true -> false，false -> true，对于int、rune、byte等按位取反，即 0 -> 1， 1 -> 0

    "&&": 933, // 逻辑与操作符

    "||": 934, // 逻辑或操作符

    "?": 990, // 三元操作符，用法示例：? $result $a $s1 "abc"，表示判断变量$a中的布尔值，如果为true，则结果为$s1，否则结果值为字符串abc，结果值将放入结果变量result中，如果省略结果参数，结果值将会压栈

    "eval": 998, // 计算一个表达式

    // func related 函数相关
    "call": 1010, // 调用指定标号处的函数
    "调用":   1010,

    "ret": 1020, // 函数内返回
    "返回":  1020,

    "callFunc": 1050, // 封装调用函数，一个参数是传入参数（压栈值）的个数（可省略），第二个参数是字符串类型的源代码
    "封装调用":     1050,

    "goFunc": 1060, // 并发调用函数，一个参数是传入参数（压栈值）的个数（可省略），第二个参数是字符串类型的源代码

    "fastCall": 1070, // 快速调用函数
    "快调":       1070,

    "fastRet": 1071, // 被快速调用的函数中返回
    "快回":      1071,

    // array/slice related 数组/切片相关
    "addItem": 1110, //数组中添加项
    "增项":      1110,

    "addStrItem": 1111,

    "deleteItem": 1112, //数组中删除项
    "删项":         1112,

    "addItems": 1115, // 数组添加另一个数组的值
    "增多项":      1115,

    "getAnyItem": 1120,
    "任意类型取项":     1120,

    "setAnyItem": 1121,
    "任意类型置项":     1121,

    // "setItem": 1121,
    // "置项":      1121,
    // "getItemX": 1123,
    // "取项X":      1123,
    "getItem": 1123, // 从数组中取项
    "取项":      1123,

    "setItem": 1124, // 修改数组中某一项的值
    "置项":      1124,
    // "setItemX": 1124,
    // "置项X":      1124,

    "slice": 1130, // 对列表（数组）切片，如果没有指定结果参数，将改变原来的变量。用法示例：slice $list4 $list3 #i1 #i5，将list3进行切片，截取序号1（包含）至序号5（不包含）之间的项，形成一个新的列表，放入变量list4中
    "切片":    1130,

    "rangeList": 1140, // 遍历数组
    "遍历列表":      1140,

    "rangeStrList": 1141, // 遍历字符串数组
    "遍历字符串列表":      1141,

    // control related 控制相关
    "continue": 1210, // 循环中继续
    "继续循环":     1210,

    "break": 1211, // 跳出循环
    "跳出循环":  1211,

    // map related 映射相关
    "setMapItem": 1310, // 设置映射项，用法：setMapItem $map1 Name "李白"
    "置映射项":       1310,

    "deleteMapItem": 1312, // 删除映射项
    "删映射项":          1312,

    "getMapItem": 1320, // 获取指定序号的映射项，用法：getMapItem $result $map1 #i2，获取map1中的序号为2的项（即第3项），放入结果变量result中
    "取映射项":       1320,

    "rangeMap": 1340, // 遍历映射
    "遍历映射":     1340,

    // object related 对象相关

    "new": 1401, // 新建一个数据或对象，第一个参数为结果放入的变量，第二个为字符串格式的数据类型或对象名，后面是可选的0-n个参数，目前支持byte、int等

    "method": 1403, // 对特定数据类型执行一定的方法，例如：method $result $str1 trimSet "ab"，将对一个字符串类型的变量str1去掉首尾的a和b字符，结果放入变量result中（注意，该结果参数不可省略，即使该方法没有返回数据，此时可以考虑用$drop）
    "m":      1403,

    "newObj": 1410, // 新建一个对象，第一个参数为结果放入的变量，第二个为字符串格式的对象名，后面是可选的0-n个参数，目前支持string、any等

    "setObjValue": 1411, // 设置对象本体值
    "getObjValue": 1412, // 获取对象本体值

    "getMember": 1420, // 获取对象成员值
    "setMember": 1430, // 设置对象成员值

    "callObj": 1440, // 调用对象方法

    // string related 字符串相关
    "backQuote": 1501, // 获取反引号字符串
    "quote":     1503, // 将字符串进行转义（加上转义符，如“"”变成“\"”）
    "unquote":   1504, // 将字符串进行解转义

    "isEmpty": 1510, // 判断字符串是否为空
    "是否空串":    1510,

    "strAdd": 1520,

    "strSplit": 1530, // 按指定分割字符串分割字符串，结果参数不可省略，用法示例：strSplit $result $str1 "," 3，其中第3个参数可选（即可省略），表示结果列表最多的项数（例如为3时，将只按逗号分割成3个字符串的列表，后面的逗号将忽略；省略或为-1时将分割出全部）
    "分割字符串":    1530,

    "strReplace": 1540, // 字符串替换，用法示例：strReplace $result $str1 $find $replacement

    "trim": 1550, // 字符串首尾去空白
    "去空白":  1550,

    "trimSet": 1551, // 字符串首尾去指定字符，除结果参数外第二个参数（字符串类型）指定去掉那些字符

    "trimSetLeft":  1553, // 字符串首去指定字符，除结果参数外第二个参数（字符串类型）指定去掉那些字符
    "trimSetRight": 1554, // 字符串尾去指定字符，除结果参数外第二个参数（字符串类型）指定去掉那些字符

    "trimPrefix": 1557, // 字符串首去指定字符串，除结果参数外第二个参数（字符串类型）指定去掉的子串，如果没有则返回原字符串
    "trimSuffix": 1558, // 字符串尾去指定字符串，除结果参数外第二个参数（字符串类型）指定去掉的子串，如果没有则返回原字符串

    "toUpper": 1561, // 字符串转为大写
    "toLower": 1562, // 字符串转为小写

    "strPad": 1571, // 字符串补零等填充操作，例如 strPad $result $strT #i5 -fill=0 -right=true，第一个参数是接收结果的字符串变量（不可省略），第二个是将要进行补零操作的字符串，第三个参数是要补齐到几位，默认填充字符串fill为字符串0，right（表示是否在右侧填充）为false（也可以直接写成-right），因此上例等同于strPad $result $strT #i5，如果fill字符串不止一个字符，最终补齐数量不会多于第二个参数指定的值，但有可能少

    // time related 时间相关
    "now":  1910, // 获取当前时间
    "现在时间": 1910,

    "nowStrCompact": 1911, // 获取简化的当前时间字符串，如20220501080930
    "nowStr":        1912, // 获取当前时间字符串的正式表达
    "nowStrFormal":  1912, // 获取当前时间字符串的正式表达

    "timeSub": 1921, // 时间进行相减操作
    "时间减":     1921,

    // math related 数学相关
    "abs": 2100, // 取绝对值

    // command-line related 命令行相关
    "getParam": 10001, // 获取指定序号的命令行参数，结果参数外第一个参数为list或strList类型，第二个为整数，第三个为默认值（字符串类型），例：getParam $result $argsG 2 ""
    "获取参数":     10001,

    "getSwitch": 10002, // 获取命令行参数中指定的开关参数，结果参数外第一个参数为list或strList类型，第二个为类似“-code=”的字符串，第三个为默认值（字符串类型），例：getSwitch $result $argsG "-code=" ""，将获取命令行中-code=abc的“abc”部分。

    "ifSwitchExists": 10003, // 判断命令行参数中是否有指定的开关参数，结果参数外第一个参数为list或strList类型，第二个为类似“-verbose”的字符串，例：ifSwitchExists $result $argsG "-verbose"，根据命令行中是否含有-verbose返回布尔值true或false

    // print related 输出相关
    "pln": 10410, // 相当于其它语言的println函数
    "输出行": 10410,

    "plo":   10411, // 输出一个变量或数值的类型和值
    "输出值类型": 10411,

    "pl": 10420, // 相当于其它语言的printf函数再多输出一个换行符\n
    "输出": 10420,

    "plv": 10430, // 输出一个变量或数值的值的内部表达形式
    "输出值": 10430,

    "plErr": 10440, // 输出一个error（表示错误的数据类型）信息

    "plErrStr": 10450, // 输出一个TXERROR字符串（表示错误的字符串，以TXERROR:开头，后面一般是错误原因描述）信息

    "spr": 10460, // 相当于其它语言的sprintf函数

    // scan/input related 输入相关
    "scanf":  10511, // 相当于其它语言的scanf函数
    "sscanf": 10512, // 相当于其它语言的sscanf函数

    // convert related 转换相关
    "convert": 10810, // 转换数值类型，例如 convert $a int
    "转换":      10810,

    "convert$": 10811,

    "hex":   10821, // 16进制编码，对于数字高位在后
    "hexb":  10822, // 16进制编码，对于数字高位在前
    "unhex": 10823, // 16进制解码，结果是一个字节列表

    // err string(TXERROR:) related TXERROR错误字符串相关
    "isErrStr":  10910, // 判断是否是TXERROR字符串，用法：isErrStr $result $str1 $errMsg，第三个参数可选（结果参数不可省略），如有则当str1为TXERROR字符串时，会放入错误原因信息
    "getErrStr": 10921, // 获取TXERROR字符串中的错误原因信息（即TXERROR:后的内容）

    "getErrStr$":  10922,
    "checkErrStr": 10931, // 判断是否是TXERROR字符串，是则退出程序运行

    // error related error相关
    "isErr":     10941, // 判断是否是error对象，结果参数不可省略，除结果参数外第一个参数是需要确定是否是error的对象，第二个可选变量是如果是error时，包含的错误描述信息
    "getErrMsg": 10942, // 获取error对象的错误信息

    // http request/response related HTTP请求相关
    "writeResp":       20110, // 写一个HTTP请求的响应
    "setRespHeader":   20111, // 设置一个HTTP请求的响应头，如setRespHeader $responseG "Content-Type" "text/json; charset=utf-8"
    "writeRespHeader": 20112, // 写一个HTTP请求的响应头状态，如writeRespHeader $responseG #i200
    "getReqHeader":    20113, // 获取一个HTTP请求的请求头信息
    "genJsonResp":     20114, // 生成一个JSON格式的响应字符串，格式类似{"Status":"fail", "Value": "network timeout"}，其中Status字段表示响应处理结果状态，一般只有success和fail两种，分别表示成功和失败，如果失败，Value字段中为失败原因，如果成功，Value中为空或需要返回的信息

    "newMux":          20121, // 新建一个HTTP请求处理路由对象，等同于 new mux
    "setMuxHandler":   20122, // 设置HTTP请求路由处理函数
    "setMuxStaticDir": 20123, // 设置静态WEB服务的目录，用法示例：setMuxStaticDir $muxT "/static/" "./scripts" ，设置处理路由“/static/”后的URL为静态资源服务，第1个参数为newMux指令创建的路由处理器对象变量，第2个参数是路由路径，第3个参数是对应的本地文件路径，例如：访问 http://127.0.0.1:8080/static/basic.xie，而当前目录是c:\tmp，那么实际上将获得c:\scripts\basic.xie

    "startHttpServer":  20151, // 启动http服务器，用法示例：startHttpServer $resultT ":8080" $muxT
    "startHttpsServer": 20153, // 启动https(SSL)服务器

    // web related WEB相关
    "getWeb": 20210, // 发送一个HTTP网络请求，并获取响应结果（字符串格式），getWeb指令除了第一个参数必须是返回结果的变量，第二个参数是访问的URL，其他所有参数都是可选的，method可以是GET、POST等；encoding用于指定返回信息的编码形式，例如GB2312、GBK、UTF-8等；headers是一个JSON格式的字符串，表示需要加上的自定义的请求头内容键值对；参数中还可以有一个映射类型的变量或值，表示需要POST到服务器的参数，用法示例：getWeb $resultT "http://127.0.0.1:80/xms/xmsApi" -method=POST -encoding=UTF-8 -timeout=15 -headers=`{"Content-Type": "application/json"}` $mapT

    // html related HTML相关
    "htmlToText": 20310, // 将HTML转换为字符串，用法示例：htmlToText $result $str1 "flat"，第3个参数开始是可选参数，表示HTML转文本时的选项

    // regex related 正则表达式相关
    "regReplaceAllStr$": 20411,
    "regFindAll":        20421, // 获取正则表达式的所有匹配，用法示例：regFindAll $result $str1 $regex1 $group

    // system related 系统相关
    "sleep": 20501, // 睡眠指定的秒数（浮点数）
    "睡眠":    20501,

    "getClipText": 20511, // 获取剪贴板文本
    "获取剪贴板文本":     20511,

    "setClipText": 20512, // 设置剪贴板文本
    "设置剪贴板文本":     20512,

    // file related 文件相关
    "loadText": 21101, // 从指定文件载入文本
    "载入文本":     21101,

    "saveText": 21103, // 保存文本到指定文件
    "保存文本":     21103,

    "loadBytes": 21105, // 从指定文件载入数据（字节列表）
    "载入数据":      21105,

    "saveBytes": 21106, // 保存数据（字节列表）到指定文件
    "保存数据":      21106,

    "loadBytesLimit": 21107, // 从指定文件载入数据（字节列表），不超过指定字节数

    "joinPath": 21501, // 合并文件路径，第一个参数是结果参数不可省略，第二个参数开始要合并的路径
    "合并路径":     21501, // 合并文件路径

    "fileExists": 21701, // 判断文件是否存在

    "removeFile": 21801, // 删除文件

    // json related JSON相关
    "toJson": 22101, // 将对象编码为JSON字符串
    "toJSON": 22101,
    "JSON编码": 22101,

    "fromJson": 22102, // 将JSON字符串转换为对象
    "fromJSON": 22102,
    "JSON解码":   22102,

    // xml related XML相关
    "toXml": 22201, // 将对象编码为XML字符串
    "toXML": 22201,
    "XML编码": 22201,

    // random related 随机数相关

    "genRandomStr": 23101, // 生成随机字符串，用法示例：genRandomStr $result -min=6 -max=8 -noUpper -noLower -noDigit -special -space -invalid，其中，除结果参数外所有参数均可选，-min用于设置最少生成字符个数，-max设置最多字符个数，-noUpper设置是否包含大写字母，-noLower设置是否包含小写字母，-noDigit设置是否包含数字，-special设置是否包含特殊字符，-space设置是否包含空格，-invalid设置是否包含一般意义上文件名中的非法字符，

    // encode/decode related 编码解码相关

    "md5": 24101, // 生成MD5编码

    "simpleEncode": 24201, // 简单编码，主要为了文件名和网址名不含非法字符
    "simpleDecode": 24203, // 简单编码的解码

    "urlEncode": 24301, // URL编码（http://www.aaa.com -> http%3A%2F%2Fwww.aaa.com）
    "urlDecode": 24303, // URL解码

    "base64Encode": 24401, // Base64编码，输入参数是[]byte字节数组或字符串
    "base64Decode": 24403, // Base64解码

    "htmlEncode": 24501, // HTML编码（&nbsp;等）
    "htmlDecode": 24503, // HTML解码

    // encrypt/decrypt related 加密/解密相关

    "encryptText": 25101, // 用TXDEF方法加密字符串
    "decryptText": 25103, // 用TXDEF方法解密字符串

    "encryptData": 25201, // 用TXDEF方法加密数据（字节列表）
    "decryptData": 25203, // 用TXDEF方法解密数据（字节列表）

    // database related 数据库相关
    "dbConnect": 32101, // 连接数据库，用法示例：dbConnect $db "sqlite3" `c:\tmpx\test.db`，或dbConnect $db "godror" `user/pass@129.0.9.11:1521/testdb`，结果参数外第一个参数为数据库驱动类型，目前支持sqlite3、mysql、mssql、godror（即oracle）等，第二个参数为连接字串
    "连接数据库":     32101,

    "dbClose": 32102, // 关闭数据库连接
    "关闭数据库":   32102,

    "dbQuery": 32103, // 在指定数据库连接上执行一个查询的SQL语句（一般是select等），返回数组，每行是映射（字段名：字段值），用法示例：dbQuery $rs $db $sql $arg1 $arg2 ...
    "查询数据库":   32103,

    "dbQueryRecs": 32104, // 在指定数据库连接上执行一个查询的SQL语句（一般是select等），返回二维数组（第一行为字段名），用法示例：dbQueryRecs $rs $db $sql $arg1 $arg2 ...
    "查询数据库记录":     32104,

    "dbExec": 32105, // 在指定数据库连接上执行一个有操作的SQL语句（一般是insert、update、delete等），用法示例：dbExec $rs $db $sql $arg1 $arg2 ...
    "执行数据库":  32105,

    // JavaScript related JavaScript相关
    "alert": 40001,

}

Xie.prototype.setVar = function(keyA, vA) {
	var idxT = this.VarIndexMapM[keyA]

	if (idxT == undefined) {
		idxT = len(this.VarIndexMapM)

        // console.log("idxT", idxT)

		this.VarIndexMapM[keyA] = idxT
		this.VarNameMapM[idxT] = keyA
	}

	var contextT = this.CurrentFuncContextM

	var localIdxT = contextT.VarsLocalMapM[idxT]

	if (localIdxT == undefined) {
		var contextTmpT = contextT
		for (;;) {
			if (contextTmpT.Layer < 1) {
				break
			}

			if (contextTmpT.Layer < 2) {
				contextTmpT = this.FuncContextM
			} else {
				contextTmpT = this.FuncStackM[contextTmpT.Layer-2]
			}

			localIdxT = contextTmpT.VarsLocalMapM[idxT]

			if (localIdxT == undefined) {
				continue
			}

			contextTmpT.VarsM[localIdxT] = vA

			return
		}

		localIdxT = len(contextT.VarsM)

		contextT.VarsLocalMapM[idxT] = localIdxT

		contextT.VarsM.push(vA)

		return
	}

	contextT.VarsM[localIdxT] = vA

	return
}

Xie.prototype.ParseLine = function(commandA) {
	var args = []

	// state: 1 - start, quotes - 2, arg - 3
	var state = 1
	var current = ""
	var quote = "`"
	// escapeNext := false

	var command = commandA

	for (var i = 0; i < len(command); i++) {
		var c = command[i]

		if (state == 2) {
			if (c != quote) {
				current += c
			} else {
				current += c // add it

				args.push(current)
				current = ""
				state = 1
			}
			continue
		}

		// tk.Pln(string(c), c, c == '`', '`')
		if ((c == '"') || (c == '\'') || (c == '`')) {
			state = 2
			quote = c

			current += c // add it

			continue
		}

		if (state == 3) {
			if ((c == ' ') || (c == '\t')) {
				args.push(current)
				current = ""
				state = 1
			} else {
				current += c
			}
			// Pl("state: %v, current: %v, args: %v", state, current, args)
			continue
		}

		if ((c != ' ') && (c != '\t')) {
			state = 3
			current += c
		}
	}

	if (state == 2) {
		return tk.errStrf("Unclosed quote in command line: %v", command)
	}

	if (current != "") {
		args.push(current)
	}

	return args
} 

Xie.prototype.ParseVar = function(strA) {
	var s1T = tk.trim(strA);

	if ((tk.startsWith(s1T, "`")) && (tk.endsWith(s1T, "`"))) {
		s1T = s1T.slice(1, len(s1T)-1)

		return {Ref: -3, Value: s1T} // value(string)
	} else if (tk.startsWith(s1T, `"`) && tk.endsWith(s1T, `"`)) {
		var tmps;
        
        try {
            tmps = JSON.parse(s1T)
        } catch (error) {
            return {Ref: -3, Value: s1T}
        }

		return {Ref: -3, Value: tmps} // value(string)
	} else {
		if (tk.startsWith(s1T, "$")) {
			if ((s1T == "$drop") || (s1T == "$丢弃")) {
				return {Ref: -2, Value: null}
			} else if ((s1T == "$debug") || (s1T == "$调试")) {
				return {Ref: -1, Value: null}
			} else if ((s1T == "$pln") || (s1T == "$行输出")) {
				return {Ref: -4, Value: null}
			} else if ((s1T == "$pop") || (s1T == "$出栈")) {
				return {Ref: -8, Value: null}
			} else if ((s1T == "$peek") || (s1T == "$看栈")) {
				return {Ref: -7, Value: null}
			} else if ((s1T == "$push") || (s1T == "$入栈")) {
				return {Ref: -5, Value: null}
			} else {
				var vNameT = s1T.slice(1)

				var varIndexT = this.VarIndexMapM[vNameT]

				if (varIndexT == undefined) {
					varIndexT = len(this.VarIndexMapM)
					this.VarIndexMapM[vNameT] = varIndexT
					this.VarNameMapM[varIndexT] = vNameT
				}

				return {Ref: varIndexT, Value: null}
			}
		} else if (tk.startsWith(s1T, ":")) { // labels
			var vNameT = s1T.slice(1)
			var varIndexT = this.VarIndexMapM[vNameT]

			if (varIndexT == undefined) {
				return {Ref: -3, Value: s1T}
			}

			return {Ref: -3, Value: this.LabelsM[varIndexT]}
		} else if (tk.startsWith(s1T, "#")) { // values
			if (len(s1T) < 2) {
				return {Ref: -3, Value: s1T}
			}

			var typeT = s1T.slice(1,2)

            // console.log("typeT", typeT)

			if (typeT == 'i') {
				var c1T = parseInt(s1T.slice(2))

				if (isNaN(c1T)) {
					return {Ref: -3, Value: s1T}
				}

				return {Ref: -3, Value: c1T}
			} else if (typeT == 'f') {
				var c1T = parseFloat(s1T.slice(2))

				if (isNaN(c1T)) {
					return {Ref: -3, Value: s1T}
				}

				return {Ref: -3, Value: c1T}
			} else if (typeT == 'b') {
				return {Ref: -3, Value: tk.toBool(s1T.slice(2))}
			// } else if (typeT == 'y') {
			// 	return VarRef{-3, tk.ToByte(s1T[2:])}
			// } else if typeT == 'r' {
			// 	return VarRef{-3, tk.ToRune(s1T[2:])}
			} else if (typeT == 's') {
				return {Ref: -3, Value: tk.toStr(s1T.slice(2))}
			// } else if typeT == 'L' { // list
			// 	var listT []interface{}

			// 	s1DT := s1T[2:] // tk.UrlDecode(s1T[2:])

			// 	if tk.startsWith(s1DT, "`") && tk.endsWith(s1DT, "`") {
			// 		s1DT = s1DT[1 : len(s1DT)-1]
			// 	}

			// 	// tk.Plv(s1T[2:])
			// 	// tk.Plv(s1DT)

			// 	errT := json.Unmarshal([]byte(s1DT), &listT)
			// 	// tk.Plv(errT)
			// 	if errT != nil {
			// 		return VarRef{-3, s1T}
			// 	}

			// 	// tk.Plv(listT)
			// 	return VarRef{-3, listT}
			// } else if typeT == 'Y' { // byteList
			// 	var listT []byte

			// 	s1DT := s1T[2:] // tk.UrlDecode(s1T[2:])

			// 	if tk.startsWith(s1DT, "`") && tk.endsWith(s1DT, "`") {
			// 		s1DT = s1DT[1 : len(s1DT)-1]
			// 	}

			// 	// tk.Plv(s1T[2:])
			// 	// tk.Plv(s1DT)

			// 	errT := json.Unmarshal([]byte(s1DT), &listT)
			// 	// tk.Plv(errT)
			// 	if errT != nil {
			// 		return VarRef{-3, s1T}
			// 	}

			// 	// tk.Plv(listT)
			// 	return VarRef{-3, listT}
			// } else if typeT == 'R' { // runeList
			// 	var listT []rune

			// 	s1DT := s1T[2:] // tk.UrlDecode(s1T[2:])

			// 	if tk.startsWith(s1DT, "`") && tk.endsWith(s1DT, "`") {
			// 		s1DT = s1DT[1 : len(s1DT)-1]
			// 	}

			// 	// tk.Plv(s1T[2:])
			// 	// tk.Plv(s1DT)

			// 	errT := json.Unmarshal([]byte(s1DT), &listT)
			// 	// tk.Plv(errT)
			// 	if errT != nil {
			// 		return VarRef{-3, s1T}
			// 	}

			// 	// tk.Plv(listT)
			// 	return VarRef{-3, listT}
			// } else if typeT == 'M' { // map
			// 	var mapT map[string]interface{}

			// 	s1DT := s1T[2:] // tk.UrlDecode(s1T[2:])

			// 	if tk.startsWith(s1DT, "`") && tk.endsWith(s1DT, "`") {
			// 		s1DT = s1DT[1 : len(s1DT)-1]
			// 	}

			// 	// tk.Plv(s1T[2:])
			// 	// tk.Plv(s1DT)

			// 	errT := json.Unmarshal([]byte(s1DT), &mapT)
			// 	// tk.Plv(errT)
			// 	if errT != nil {
			// 		return VarRef{-3, s1T}
			// 	}

			// 	// tk.Plv(listT)
			// 	return VarRef{-3, mapT}
			}

			return {Ref: -3, Value: s1T}
		// } else if tk.startsWith(s1T, "?") { // eval
		// 	if len(s1T) < 2 {
		// 		return VarRef{-3, s1T}
		// 	}

		// 	s1T = strings.TrimSpace(s1T[1:])

		// 	if tk.startsWith(s1T, "`") && tk.endsWith(s1T, "`") {
		// 		s1T = s1T[1 : len(s1T)-1]

		// 		return VarRef{-9, s1T} // eval value
		// 	} else if tk.startsWith(s1T, `"`) && tk.endsWith(s1T, `"`) {
		// 		tmps, errT := strconv.Unquote(s1T)

		// 		if errT != nil {
		// 			return VarRef{-9, s1T}
		// 		}

		// 		return VarRef{-9, tmps}
		// 	}

		// 	return VarRef{-9, s1T}
		} else {
			return {Ref: -3, Value: s1T} // value(string)
		}
	}
}

Xie.prototype.Load = function(codeA) {

	var originCodeLenT = this.CodeListM.length;

	var sourceT = tk.splitLines(codeA)

	this.SourceM = this.SourceM.concat(sourceT)

	var pointerT = originCodeLenT

	var varCountT;

	for (var i = 0; i < sourceT.length; i++) {
		var v = sourceT[i].trim()

		if (v.startsWith("//") || v.startsWith("#")) {
			continue
		}

		if (v.startsWith(":")) {
			var labelT = v.substring(1).trim()

			if (this.VarIndexMapM[labelT] == undefined) {
				varCountT = len(this.VarIndexMapM)

				this.VarIndexMapM[labelT] = varCountT
				this.VarNameMapM[varCountT] = labelT
			}

			this.LabelsM[varCountT] = pointerT

			continue
		}

		var iFirstT = i;

		if (v.includes("`")) {
			if ((tk.strCount(v, "`")%2) != 0) {
				var foundT = false;

				var j;

				for (j = i + 1; j < len(sourceT); j++) {
					if (tk.strContains(sourceT[j], "`")) {
						v = tk.joinLines(sourceT.slice(i, j+1))

						foundT = true
						break
					}
				}

				if (!foundT) {
					return tk.errStrf("代码解析错误: ` 未成对(%v)", i)
				}

				i = j
			}
		}

		v = tk.trim(v)

		if (v == "") {
			continue
		}

		this.CodeListM.push(v)
		this.CodeSourceMapM[pointerT] = iFirstT
		pointerT++
	}

	for (var i = originCodeLenT; i < len(this.CodeListM); i++) {
		// listT := strings.SplitN(v, " ", 3)
		var v = this.CodeListM[i];

		var listT = this.ParseLine(v)
		if (tk.isErrStr(listT)) {
			return tk.errStrf("参数解析失败：%v", tk.getErrStr(listT))
		}

        // console.log("ParseLine", listT)

		var lenT = len(listT)

		var instrNameT = tk.trim(listT[0])

		var codeT = Xie.InstrNameSet[instrNameT]

		if (codeT == undefined) {
			var instrT = {Code: codeT, ParamLen: 1, Params: [{Ref: -3, Value: v}]} //&([]VarRef{})}
			this.InstrListM.push(instrT)

			return tk.errStrf("编译错误(行 %v/%v %v): 未知指令", i, this.CodeSourceMapM[i]+1, tk.limitStr(this.SourceM[this.CodeSourceMapM[i]], 50))
		}

		var instrT = {Code: codeT, Params: []} //&([]VarRef{})}

		var list3T = []

		for (var j = 0; j < listT.length; j++) {
			if (j == 0) {
				continue
			}

			list3T.push(this.ParseVar(listT[j]))
		}

        // console.log("list3T", list3T)

		instrT.Params = instrT.Params.concat(list3T)
		instrT.ParamLen = lenT - 1

		this.InstrListM.push(instrT)
	}

	return ""+originCodeLenT;
}

Xie.prototype.errStrf = function(formatA, ...argsA) {
    var copyT = [].slice.call(argsA);

    copyT.unshift(tk.spr("TXERROR:(Line %v: %v) ", this.CodeSourceMapM[this.CodePointerM]+1, tk.limitStr(this.SourceM[this.CodeSourceMapM[this.CodePointerM]], 50))+formatA);

	return tk.spr.apply(null, copyT);

	// return tk.spr(, argsA...)
}

Xie.prototype.push = function(vA) {
	var lenT = len(this.StackM)

	if (this.StackPointerM >= lenT) {
		this.StackM.push(vA)
	} else {
		this.StackM[this.StackPointerM] = vA
	}

	this.StackPointerM++
}

Xie.prototype.setVarInt = function(keyA, vA) {
	if (keyA == -2) { // 丢弃
		return null;
	}

	if (keyA == -5) {
		this.push(vA)
		return null
	}

	if (keyA == -4) {
		console.log(vA)
		return null
	}

	if (keyA < 0) {
		return tk.errStrf("无效的变量索引")
	}

	var contextT = this.CurrentFuncContextM

	var localIdxT = contextT.VarsLocalMapM[keyA]

	if (localIdxT == undefined) {
		var contextTmpT = contextT
		for (;;) {
			if (contextTmpT.Layer < 1) {
				break
			}

			if (contextTmpT.Layer < 2) {
				contextTmpT = this.FuncContextM
			} else {
				contextTmpT = this.FuncStackM[contextTmpT.Layer-2]
			}

			localIdxT = contextTmpT.VarsLocalMapM[keyA]

			if (localIdxT == undefined) {
				continue
			}

			contextTmpT.VarsM[localIdxT] = vA

			return null
		}


		localIdxT = len(contextT.VarsM)

		contextT.VarsLocalMapM[keyA] = localIdxT

		contextT.VarsM.push(vA)

		return null
	}

	contextT.VarsM[localIdxT] = vA

	return null
}

Xie.prototype.setVarIntLocal = function(keyA, vA) {
	if (keyA == -5 ) {
		this.push(vA)
		return
	}

	if (keyA == -4 ) {
		tk.pln(vA)
		return
	}

	if (keyA == -2 ) { // 丢弃
		return
	}

	if (keyA < 0 ) {
		return tk.errStrf("无效的变量索引")
	}

	var contextT = this.CurrentFuncContextM

	var localIdxT = contextT.VarsLocalMapM[keyA]

	if (localIdxT == undefined) {
		localIdxT = len(contextT.VarsM)

		contextT.VarsLocalMapM[keyA] = localIdxT

		contextT.VarsM.push(vA)

		return
	}

	contextT.VarsM[localIdxT] = vA
	return
}

Xie.prototype.setVarIntGlobal = function(keyA, vA) {
	if (keyA == -2 ) { // 丢弃
		return
	}

	if (keyA == -5 ) {
		this.push(vA)
		return
	}

	if (keyA == -4 ) {
		tk.pln(vA)
		return
	}

	if (keyA < 0 ) {
		return tk.errStrf("无效的变量编号")
	}

	var localIdxT = this.FuncContextM.VarsLocalMapM[keyA]

	if (localIdxT == undefined) {
		localIdxT = len(this.FuncContextM.VarsM)

		this.FuncContextM.VarsLocalMapM[keyA] = localIdxT

		this.FuncContextM.VarsM.push(vA)

		return
	}

	this.FuncContextM.VarsM[localIdxT] = vA

	return
}

Xie.prototype.push = function(vA) {
	var lenT = len(this.StackM)

	if (this.StackPointerM >= lenT) {
		this.StackM.push(vA)
	} else {
		this.StackM[this.StackPointerM] = vA
	}

	this.StackPointerM++
}

Xie.prototype.pop = function() {
	if (this.StackPointerM < 1) {
		return
	}

	this.StackPointerM--
	return this.StackM[this.StackPointerM]
}

Xie.prototype.peek = function() {
	if (this.StackPointerM < 1) {
		return
	}

	return this.StackM[this.StackPointerM-1]
}

Xie.prototype.getVarValue = function(vA) {
	var idxT = vA.Ref

	if (idxT == -2) {
		return null
	}

	if (idxT == -3) {
		return vA.Value
	}

	if (idxT == -8) {
		return this.pop()
	}

	if (idxT == -7) {
		return this.peek()
	}

	if (idxT == -1) {
		return JSON.stringify(this, null, 2);
	}

	if (idxT == -5) {
		return
	}

	// if idxT == -9 {
	// 	return this.EvalExpression(vA.Value.(string))
	// }

	if (idxT < 0) {
		return
	}

	var contextT = this.CurrentFuncContextM

	var nv = contextT.VarsLocalMapM[idxT]

	if (nv == undefined) {

		for (;;) {
			if (contextT.Layer < 1) {
				break
			}

			if (contextT.Layer < 2) {
				contextT = this.FuncContextM
			} else {
				contextT = this.FuncStackM[contextT.Layer-2]
			}

			nv = contextT.VarsLocalMapM[idxT]

			if (nv == undefined) {
				continue
			}

			return contextT.VarsM[nv]
		}

		return
	}

	return contextT.VarsM[nv]

}

Xie.prototype.pushFunc = function() {
	var funcContextT = {VarsM: [], VarsLocalMapM: {}, ReturnPointerM: this.CodePointerM + 1, Layer: this.FuncStackPointerM + 1}

	var lenT = len(this.FuncStackM)

	if (this.FuncStackPointerM >= lenT) {
		this.FuncStackM.push(funcContextT)
	} else {
		this.FuncStackM[this.FuncStackPointerM] = funcContextT
	}

	this.CurrentFuncContextM = this.FuncStackM[this.FuncStackPointerM]

	this.FuncStackPointerM++
}

Xie.prototype.popFunc = function() {
	if (this.FuncStackPointerM < 1) {
		return 0
	}

	this.FuncStackPointerM--
	var funcContextT = this.FuncStackM[this.FuncStackPointerM]

	if (this.FuncStackPointerM < 1) {
		this.CurrentFuncContextM = this.FuncContextM
	} else {
		this.CurrentFuncContextM = this.FuncStackM[this.FuncStackPointerM-1]
	}

	return funcContextT.ReturnPointerM
}

Xie.prototype.runLine = function(lineA, codeA) {
	if (lineA >= len(this.InstrListM)) {
		return this.errStrf("无效的代码序号: %v/%v", lineA, len(this.InstrListM))
	}

	var instrT

	if (codeA == undefined) {
		instrT = this.InstrListM[lineA]
	} else {
		instrT = codeA
	}

	var cmdT = instrT.Code

	switch (cmdT) {
	case 12: // invalidInstr
		return this.errStrf("无效的指令：%v", instrT.Params[0].Value)
	case 100: // version
		var p1 = -5

		if (instrT.ParamLen > 0) {
			p1 = instrT.Params[0].Ref
		}

		this.setVarInt(p1, this.versionG)

		return ""
	case 199: // exit
		if (instrT.ParamLen < 1) {
			return "exit"
		}

		var valueT = this.getVarValue(instrT.Params[0])

		this.setVar("outG", valueT)

		return "exit"
	case 203: // var
		if (instrT.ParamLen < 1 ) {
			return this.errStrf("参数不够")
		}
		
		var nameT = instrT.Params[0].Ref
		
		if (instrT.ParamLen < 2 ) {
			this.setVarIntLocal(nameT, null)
			return ""
		}
		
		var valueT = instrT.Params[1].Value
		
		if ((valueT == "bool") || (valueT == "布尔" )) {
			this.setVarIntLocal(nameT, false)
		} else if ((valueT == "int") || (valueT == "整数" )) {
			this.setVarIntLocal(nameT, 0)
		} else if ((valueT == "byte") || (valueT == "字节" )) {
			this.setVarIntLocal(nameT, 0)
		} else if ((valueT == "rune") || (valueT == "如痕" )) {
			this.setVarIntLocal(nameT, 0)
		} else if ((valueT == "float") || (valueT == "小数" )) {
			this.setVarIntLocal(nameT, 0.0)
		} else if ((valueT == "str") || (valueT == "字符串" )) {
			this.setVarIntLocal(nameT, "")
		} else if ((valueT == "list") || (valueT == "列表" )) {
			this.setVarIntLocal(nameT, [])
		} else if ((valueT == "strList") || (valueT == "字符串列表" )) {
			this.setVarIntLocal(nameT, [])
		} else if ((valueT == "byteList") || (valueT == "字节列表" )) {
			this.setVarIntLocal(instrT.Params[0].Ref, [])
		} else if ((valueT == "runeList") || (valueT == "如痕列表" )) {
			this.setVarIntLocal(instrT.Params[0].Ref, [])
		} else if ((valueT == "map") || (valueT == "映射" )) {
			this.setVarIntLocal(nameT, {})
		} else if ((valueT == "strMap") || (valueT == "字符串映射" )) {
			this.setVarIntLocal(nameT, {})
		} else {
			this.setVarIntLocal(instrT.Params[0].Ref, null)
		}
		
		return ""
	case 220: // push
		if (instrT.ParamLen < 1 ) {
			return this.errStrf("参数不够")
		}
		
		if (instrT.ParamLen > 1 ) {
			var v2 = this.getVarValue(instrT.Params[1])
		
			var v1 = tk.toStr(this.getVarValue(instrT.Params[0]))
		
			if ((v1 == "int") || (v1 == "整数" )) {
				this.push(tk.toInt(v2))
			} else if ((v1 == "byte") || (v1 == "字节" )) {
				this.push(tk.toByte(v2))
			} else if ((v1 == "rune") || (v1 == "如痕" )) {
				this.push(tk.toRune(v2))
			} else if ((v1 == "float") || (v1 == "小数" )) {
				this.push(tk.toFloat(v2))
			} else if ((v1 == "bool") || (v1 == "布尔" )) {
				this.push(tk.toBool(v2))
			} else if ((v1 == "str") || (v1 == "字符串" )) {
				this.push(tk.toStr(v2))
			} else {
				this.push(v2)
			}
		
			return ""
		}
		
		var v1 = this.getVarValue(instrT.Params[0])
		
		this.push(v1)
		
		return ""
	case 222: // peek
		if (instrT.ParamLen < 1 ) {
			return this.errStrf("参数不够")
		}

		var p1 = instrT.Params[0].Ref

		if (p1 == -5 ) {
			this.push(this.peek())
			return ""
		}

		this.setVarInt(p1, this.peek())

		return ""
	case 224: // pop
		if (instrT.ParamLen < 1) {
			this.pop()
			return ""
		}

		var p1 = instrT.Params[0].Ref

		this.setVarInt(p1, this.pop())

		return ""
    case 401: // assign/=/赋值
		if (instrT.ParamLen < 2) {
			return this.errStrf("参数不够")
		}

		var nameT = instrT.Params[0].Ref

		if ((nameT < 0) && (nameT != -5) && (nameT != -2) && (nameT > -200)) {
			return this.errStrf("无效变量名")
		}

		if (instrT.ParamLen > 2) {
			var valueTypeT = instrT.Params[1].Value
			var valueT = this.getVarValue(instrT.Params[2])

			if ((valueTypeT == "bool") || (valueTypeT == "布尔")) {
				this.setVarInt(nameT, tk.toBool(valueT))
			} else if ((valueTypeT == "int") || (valueTypeT == "整数")) {
				this.setVarInt(nameT, tk.toInt(valueT))
			} else if ((valueTypeT == "byte") || (valueTypeT == "字节")) {
				this.setVarInt(nameT, tk.toByte(valueT))
			// } else if ((valueTypeT == "rune") || (valueTypeT == "如痕")) {
			// 	this.setVarInt(nameT, tk.ToRune(valueT))
			} else if ((valueTypeT == "float") || (valueTypeT == "小数")) {
				this.setVarInt(nameT, tk.toFloat(valueT))
			} else if ((valueTypeT == "str") || (valueTypeT == "字符串")) {
				this.setVarInt(nameT, tk.toStr(valueT))
			} else if ((valueTypeT == "list") || ( valueTypeT == "列表")) {
				this.setVarInt(nameT, valueT)
			} else if ((valueTypeT == "strList") || (valueTypeT == "字符串列表")) {
				this.setVarInt(nameT, valueT)
			} else if ((valueTypeT == "byteList") || (valueTypeT == "字节列表")) {
				this.setVarInt(nameT, valueT)
			// } else if ((valueTypeT == "runeList") || (valueTypeT == "如痕列表")) {
			// 	this.setVarInt(nameT, valueT.([]rune))
			} else if ((valueTypeT == "map") || (valueTypeT == "映射")) {
				this.setVarInt(nameT, valueT)
			} else if ((valueTypeT == "strMap") || (valueTypeT == "字符串映射")) {
				this.setVarInt(nameT, valueT)
			} else {
				this.setVarInt(nameT, valueT)
			}

			return ""
		}

		var valueT = this.getVarValue(instrT.Params[1])

		this.setVarInt(nameT, valueT)

		return ""

	case 610: // if
		if (instrT.ParamLen < 1 ) {
			return this.errStrf("参数不够")
		}

		var condT;
		var v2;

		if (instrT.ParamLen < 2 ) {
			condT = tk.toBool(this.pop())
			v2 = this.getVarValue(instrT.Params[0])
		} else {
			condT = tk.toBool(this.getVarValue(instrT.Params[0]))
			v2 = this.getVarValue(instrT.Params[1])
		}

		var sTypeT = typeof(v2)

		if (sTypeT != "string" ) {
			if (condT) {
				return tk.toInt(v2)
			}
		} else {
			if (condT) {
				var labelPointerT = p.LabelsM[p.VarIndexMapM[v2]]

				if (labelPointerT != undefined ) {
					return labelPointerT
				}
			}
		}

		return ""


	case 703: // <
		var pr = -5
		var v1, v2;

		if (instrT.ParamLen == 0 ) {
			v2 = this.pop()
			v1 = this.pop()
		} else if (instrT.ParamLen == 1 ) {
			pr = instrT.Params[0].Ref
			v2 = this.pop()
			v1 = this.pop()
		} else if (instrT.ParamLen == 2 ) {
			v1 = this.getVarValue(instrT.Params[0])
			v2 = this.getVarValue(instrT.Params[1])
		} else {
			pr = instrT.Params[0].Ref
			v1 = this.getVarValue(instrT.Params[1])
			v2 = this.getVarValue(instrT.Params[2])
		}

		// var v3;

		// switch var nv = v1.(type) {
		// case int:
		// 	v3 = nv < v2.(int)
		// case byte:
		// 	v3 = nv < v2.(byte)
		// case rune:
		// 	v3 = nv < v2.(rune)
		// case float64:
		// 	v3 = nv < v2.(float64)
		// case string:
		// 	v3 = nv < v2.(string)
		// default:
		// 	return this.errStrf("数据类型不匹配")
		// }

		this.setVarInt(pr, v1 < v2)

		return ""


	case 810: // dec
		if (instrT.ParamLen < 1 ) {
			this.push(tk.toInt(this.pop()) - 1)

			return ""
		}

		var v1 = this.getVarValue(instrT.Params[0])

		this.setVarInt(instrT.Params[0].Ref, tk.toInt(v1)-1)

		return ""


    case 901: // add
		var pr = -5
		var v1, v2;

		if (instrT.ParamLen == 0) {
			v2 = this.pop()
			v1 = this.pop()
		} else if (instrT.ParamLen == 1) {
			pr = instrT.Params[0].Ref
			v2 = this.pop()
			v1 = this.pop()
		} else if (instrT.ParamLen == 2) {
			v1 = this.getVarValue(instrT.Params[0])
			v2 = this.getVarValue(instrT.Params[1])
		} else {
			pr = instrT.Params[0].Ref
			v1 = this.getVarValue(instrT.Params[1])
			v2 = this.getVarValue(instrT.Params[2])
		}

		var v3 = v1 + v2;

		// switch nv := v2.(type) {
		// case int:
		// 	v3 = v1.(int) + nv
		// case byte:
		// 	v3 = v1.(byte) + nv
		// case rune:
		// 	v3 = v1.(rune) + nv
		// case float64:
		// 	v3 = v1.(float64) + nv
		// case string:
		// 	v3 = v1.(string) + nv
		// default:
		// 	return this.errStrf("数据类型不匹配")
		// }

		this.setVarInt(pr, v3)

		return ""
	case 1010: // call
		if (instrT.ParamLen < 1 ) {
			return this.errStrf("参数不够")
		}
		
		var v1 = this.getVarValue(instrT.Params[0])
		
		var tmpPointerT = tk.toInt(v1)
		
		if (tmpPointerT < 0) {
			var tmps = tk.toStr(v1)
		
			// if (!ok ) {
			// 	return this.errStrf("参数类型错误")
			// }
		
			if (!tk.startsWith(tmps, ":") ) {
				return this.errStrf("标号格式错误：%v", tmps)
			}
		
			tmps = tmps.slice(1)
		
			var varIndexT = this.VarIndexMapM[tmps]
		
			if (varIndexT == undefined ) {
				return this.errStrf("无效的标号：%v", tmps)
			}
		
			var tmpPointerT = this.LabelsM[varIndexT]
		
			if (tmpPointerT == undefined) {
				return this.errStrf("无效的标号序号：%v(%v)", varIndexT, tmps)
			}
		
			this.InstrListM[lineA].Params[0].Value = tmpPointerT
		}

		this.pushFunc()
		
		return tmpPointerT

	case 1020: // ret
		var pT = this.popFunc()

		return pT


	case 1550: // trim
		if (instrT.ParamLen < 1 ) {
			this.push(tk.trim(tk.toStr(this.pop())))
			return ""
		}

		if (instrT.ParamLen < 2 ) {
			var s1 = this.getVarValue(instrT.Params[0])

			console.log("s1", s1)

			this.push(tk.trim(tk.toStr(s1)))
			return ""
		}

		var s1 = this.getVarValue(instrT.Params[1])

		this.setVarInt(instrT.Params[0].Ref, tk.trim(tk.toStr(s1)))

		return ""


	case 10410: // pln
		var list1T = []

		for (var i = 0; i < instrT.Params.length; i ++) {
			list1T.push(this.getVarValue(instrT.Params[i]))
		}

		if (window.pln) {
			pln.apply(null, list1T);
		} else {
			console.log.apply(null, list1T)
		}

		return ""

	case 10411: // plo
		var vT;

		if (instrT.ParamLen < 1) {
			vT = this.pop()
		} else {
			vT = this.getVarValue(instrT.Params[0])
		}

		if (window.plo) {
			plo.call(null, vT);
		} else {
			console.log.call(null, '('+typeof(vT)+')'+ String(vT))
		}

		return ""

	case 10430: // plv
		var vT;
		if (instrT.ParamLen < 1) {
			vT = this.pop()
		} else {
			vT = this.getVarValue(instrT.Params[0])
		}

		if (window.plv) {
			plv(vT);
		} else {
			console.log(JSON.stringify(vT))
		}

		return ""

    case 40001: // alert
        if (instrT.ParamLen < 1) {
            return this.errStrf("参数不够")
        }

        // var valuesT = []

        // for (var i = 0; i < instrT.ParamLen; i ++) {
        //     valuesT.push(this.getVarValue(instrT.Params[i]))
        // }

        // console.log(valuesT)

        alert(this.getVarValue(instrT.Params[0]))

		return ""
    // end of switch
	}

	return this.errStrf("unknown command: %v", cmdT)
}

Xie.prototype.run = function(...posA) {
	this.CodePointerM = 0

	if (len(posA) > 0) {
		this.CodePointerM = posA[0]
	}

	for (;;) {
		var resultT = this.runLine(this.CodePointerM)

        var typeT = typeof(resultT)

		// c1T, ok := resultT.(int)

		if (typeT == "number") {
			this.CodePointerM = resultT
		} else {
			// rs, ok := resultT.(string)

            var rs = resultT;

			if (typeT != "string") {
				return this.errStrf("返回结果错误: (%T)%v", resultT, resultT)
			}

			if (tk.isErrStr(rs)) {
				return tk.errStrf("[%v](xie) runtime error: %v", tk.getNowFormatTime(), tk.getErrStr(rs))
			}

			if (rs == "") {
				this.CodePointerM++

				if (this.CodePointerM >= len(this.CodeListM)) {
					break
				}
			} else if (rs == "exit") {
				break
			} else {
				var tmpI = parseInt(rs)

				if ((isNaN(tmpI)) || (tmpI < 0)) {
					return this.errStrf("无效指令: %v", rs)
				}

				if (tmpI >= len(this.CodeListM)) {
					return this.errStrf("指令序号超出范围: %v(%v)/%v", tmpI, rs, len(this.CodeListM))
				}

				this.CodePointerM = tmpI
			}

		}

	}

	// tk.Pl(tk.ToJSONX(p, "-indent", "-sort"))

	var outIndexT = this.VarIndexMapM["outG"]
	if (outIndexT == undefined) {
		return tk.errStrf("no result")
	}

	return tk.toStr((this.FuncContextM.VarsM)[this.FuncContextM.VarsLocalMapM[outIndexT]])

}

Xie.prototype.runCode = function(codeA, objA, ...optsA) {
	if ((typeof(optsA) != "undefined") || (optsA.length > 0)) {
		this.argsG = optsA
	}

	if (objA == undefined) {
		this.inputG = objA
	}

	var lrs = this.Load(codeA)

	if (tk.isErrStr(lrs)) {
		return lrs
	}

	var rs = this.run()

	return rs
}

// var xie = new Xie();

// var rs = xie.runCode(testCodeT)

// console.log(rs)
