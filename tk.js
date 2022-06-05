function len(objA) {
    if (!objA) {
        return 0
    }

    if (objA instanceof Array) {
        return objA.length;
    }

    if (typeof(objA) == "string") {
        return objA.length;
    }

    if (typeof(objA) == "object") {
        return Object.keys(objA).length;
    }
    
    var l = objA.length;

    if (!l) {
        return 0;
    }

    return l;
}

function Error(msgA) {
    this.msg = msgA
}

var tk = {};


tk.joinLines = function(listA) {
    return listA.join("\n");
}

tk.strContains = function(strA, occurA) {
    return strA.includes(occurA);
}

tk.strCount = function(strA, occurA) {
    return strA.split(occurA).length - 1;
}

tk.splitLines = function(strA) {
    if (strA.includes("\r")) {
        return strA.replace(/\r/g, "").split("\n");
    }

	return strA.split("\n");
}

tk.getSimpleMapFromString = function (strA) {
	var tmpary = new Object();

	var tmpl = strA.split(/\r?\n/g);

	var tmpli;

	for (var i = 0; i < tmpl.length; i++) {
		tmpli = tmpl[i].split("=", 2);
		if (tmpli.length < 2) {
			continue;
		}

		tmpary[tmpli[0].replace("`EQ`", "=")] = tmpli[1].replace("#CR#", "\n");
	}

	return tmpary;
}

tk.simpleMapToString = function (mapA) {
	var aryT = new Array();

	var kk = "";

	for (k in mapA) {
		kk = k.replace("=", "`EQ`");
		aryT.push(kk+"="+mapA[k].replace("\r", "").replace("\n", "#CR#"));
	}

	return aryT.join("\n");
}

tk.getValueByColName = function (aryA, rowA, nameA) {
	var lenT = aryA.length;

	if (lenT < 1) {
		return ""
	}

	var lineLenT = aryA[0].length;

	var idxT = -1;

	for (var i = 0; i < lineLenT; i ++) {
		if (aryA[0][i] == nameA) {
			idxT = i;
			break;
		}
	}

	if (idxT < 0) {
		return "";
	}

	return aryA[rowA][idxT];
}

tk.ifHttpsVar = undefined;

tk.ifHttps = function () {
	if (tk.ifHttpsVar != undefined) {
		return tk.ifHttpsVar;
	}

	var protot = document.location.protocol;

	if (protot.startsWith("https")) {
		tk.ifHttpsVar = true;
	} else {
		tk.ifHttpsVar = false;
	}

	return tk.ifHttpsVar;
};


tk.strToBytes = function (str) {
	var byteArray = [];
	for (var i = 0; i < str.length; i++)
		if (str.charCodeAt(i) <= 0x7F)
			byteArray.push(str.charCodeAt(i));
		else {
			var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
			for (var j = 0; j < h.length; j++)
				byteArray.push(parseInt(h[j], 16));
		}
	return byteArray;
};

tk.byteToHex = function (byte) {
	return ('0' + (byte & 0xFF).toString(16)).slice(-2).toUpperCase();
}

tk.bytesToHex = function (byteArray) {
	return Array.from(byteArray, tk.byteToHex).join('');
}

tk.strToHex = function (str) {
	var byteArray = [];
	for (var i = 0; i < str.length; i++) {
		if (str.charCodeAt(i) <= 0x7F)
			byteArray.push(str.charCodeAt(i));
		else {
			var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
			for (var j = 0; j < h.length; j++)
				byteArray.push(parseInt(h[j], 16));
		}
	}

	return tk.bytesToHex(byteArray);
};

tk.bytesToStr = function (byteArray) {
	var str = '';
	for (var i = 0; i < byteArray.length; i++)
		str += byteArray[i] <= 0x7F ?
			byteArray[i] === 0x25 ? "%25" : // %
				String.fromCharCode(byteArray[i]) :
			"%" + byteArray[i].toString(16).toUpperCase();
	return decodeURIComponent(str);
};

tk.bytesToString = function (arrayA) {
	alert(arrayA.toString());
	return String.fromCharCode.apply(String, arrayA);
}

tk.ascii = function (strA) {
	return strA.charCodeAt(0);
}

tk.strToUTF8 = function (str, withHeader) {
	var back = [];
	var byteSize = 0;
	for (var i = 0; i < str.length; i++) {
		var code = str.charCodeAt(i);
		if (0x00 <= code && code <= 0x7f) {
			byteSize += 1;
			back.push(code);
		} else if (0x80 <= code && code <= 0x7ff) {
			byteSize += 2;
			back.push((192 | (31 & (code >> 6))));
			back.push((128 | (63 & code)))
		} else if ((0x800 <= code && code <= 0xd7ff)
			|| (0xe000 <= code && code <= 0xffff)) {
			byteSize += 3;
			back.push((224 | (15 & (code >> 12))));
			back.push((128 | (63 & (code >> 6))));
			back.push((128 | (63 & code)))
		}
	}
	for (i = 0; i < back.length; i++) {
		back[i] &= 0xff;
	}
	if (withHeader) {
		if (byteSize <= 0xff) {
			return [0, byteSize].concat(back);
		} else {
			return [byteSize >> 8, byteSize & 0xff].concat(back);
		}
	}
	return back
}

tk.UTF8ToStr = function (arr) {
	if ((arr == undefined) || (arr == null)) {
		return tk.GenerateErrorString("failed to decode UTF-8 string");
	}

	if (typeof arr === 'string') {
		return arr;
	}

	try {
		var UTF = '', _arr = arr;
		for (var i = 0; i < _arr.length; i++) {
			var one = _arr[i].toString(2),
				v = one.match(/^1+?(?=0)/);
			if (v && one.length == 8) {
				var bytesLength = v[0].length;
				var store = _arr[i].toString(2).slice(7 - bytesLength);
				for (var st = 1; st < bytesLength; st++) {
					store += _arr[st + i].toString(2).slice(2)
				}

				UTF += String.fromCharCode(parseInt(store, 2));

				i += bytesLength - 1
			} else {
				UTF += String.fromCharCode(_arr[i])
			}
		}

		return UTF
	} catch (error) {
		return tk.GenerateErrorString("failed to decode UTF-8 string: " + error);
	}

}

tk.ulEncode = function (str) {
	var strArray = [];
	var v;
	var utf8Code;
	var tableStrT = "0123456789ABCDEF";

	for (var i = 0; i < str.length; i++) {
		v = str.charCodeAt(i);

		if (((v >= 48) && (v <= 57)) || ((v >= 97) && (v <= 122)) || ((v >= 65) && (v <= 90))) {
			strArray.push(String.fromCharCode(v));
		} else {
			utf8Code = tk.strToUTF8(str.charAt(i));

			for (var j = 0; j < utf8Code.length; j++) {
				strArray.push('_');
				strArray.push(tableStrT.charAt(utf8Code[j] >> 4));
				strArray.push(tableStrT.charAt(utf8Code[j] & 15));
			}

		}

	}

	return strArray.join('');
};

tk.simpleEncode = function (str) {
	var strArray = [];
	var v;
	var utf8Code;
	var tableStrT = "0123456789ABCDEF";

	for (var i = 0; i < str.length; i++) {
		v = str.charCodeAt(i);

		if (((v >= 48) && (v <= 57)) || ((v >= 97) && (v <= 122))) {
			strArray.push(String.fromCharCode(v));
		} else {
			utf8Code = tk.strToUTF8(str.charAt(i));

			for (var j = 0; j < utf8Code.length; j++) {
				strArray.push('%');
				strArray.push(tableStrT.charAt(utf8Code[j] >> 4));
				strArray.push(tableStrT.charAt(utf8Code[j] & 15));
			}

		}

	}

	return strArray.join('');
};

tk.ulDecode = function (s) {
	var bufT = [];

	var lenT = s.length;

	for (var i = 0; i < lenT;) {
		if (s[i] == '_') {
			if (i + 2 >= lenT) {
				return s;
			}

			bufT.push(tk.hexToInt(s[i + 1]) << 4 | tk.hexToInt(s[i + 2]));

			i += 3;
		} else {
			bufT.push(s.charCodeAt(i));
			i++;
		}

	}

	return tk.UTF8ToStr(bufT);
}

tk.simpleDecode = function (s) {
	var bufT = [];

	var lenT = s.length;

	for (var i = 0; i < lenT;) {
		if (s[i] == '%') {
			if (i + 2 >= lenT) {
				return s;
			}

			bufT.push(tk.hexToInt(s[i + 1]) << 4 | tk.hexToInt(s[i + 2]));

			i += 3;
		} else {
			bufT.push(s.charCodeAt(i));
			i++;
		}

	}

	return tk.UTF8ToStr(bufT);
}

tk.ensurePositive = function (numA, modA) {

	var numT = numA;
	for (; numT < 0;) {
		numT += modA;
	}

	return numT;
}

tk.modX = function (numA, modA) {

	var numT = numA;
	for (; numT < 0;) {
		numT += modA;
	}

	return numT % modA;
}

tk.floatAdjust = function(value, exp) {
	if (typeof exp === 'undefined' || +exp === 0) {
		return value;
	}

	value = +value;
	exp = +exp;

	if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
		return value;
	}

	value = value.toString().split('e');
	value = Math.round(+(value[0] + 'e' + (value[1] ? +value[1] + exp : exp)));

	value = value.toString().split('e');
	value = +(value[0] + 'e' + (value[1] ? +value[1] - exp : -exp));

	return value;
}

tk.floatAdd = function (arg1, arg2) {
	var r1, r2, m, c;
	try {
		r1 = arg1.toString().split(".")[1].length;
	}
	catch (e) {
		r1 = 0;
	}
	try {
		r2 = arg2.toString().split(".")[1].length;
	}
	catch (e) {
		r2 = 0;
	}
	c = Math.abs(r1 - r2);
	m = Math.pow(10, Math.max(r1, r2));
	if (c > 0) {
		var cm = Math.pow(10, c);
		if (r1 > r2) {
			arg1 = Number(arg1.toString().replace(".", ""));
			arg2 = Number(arg2.toString().replace(".", "")) * cm;
		} else {
			arg1 = Number(arg1.toString().replace(".", "")) * cm;
			arg2 = Number(arg2.toString().replace(".", ""));
		}
	} else {
		arg1 = Number(arg1.toString().replace(".", ""));
		arg2 = Number(arg2.toString().replace(".", ""));
	}
	return (arg1 + arg2) / m;
}
 
tk.floatSub = function(arg1, arg2) {
	var r1, r2, m, n;
	try {
		r1 = arg1.toString().split(".")[1].length;
	}
	catch (e) {
		r1 = 0;
	}
	try {
		r2 = arg2.toString().split(".")[1].length;
	}
	catch (e) {
		r2 = 0;
	}
	m = Math.pow(10, Math.max(r1, r2)); 
	n = (r1 >= r2) ? r1 : r2;
	return ((arg1 * m - arg2 * m) / m).toFixed(n);
}	

tk.floatMul = function(a, b) {
	var c = 0,
	d = a.toString(),
	e = b.toString();
	try {
		c += d.split(".")[1].length;
	} catch (f) {}
	try {
		c += e.split(".")[1].length;
	} catch (f) {}
	return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
}

tk.floatDiv = function div(a, b) {
    var c, d, e = 0,
        f = 0;
    try {
        e = a.toString().split(".")[1].length;
    } catch (g) {}
    try {
        f = b.toString().split(".")[1].length;
    } catch (g) {}
    return c = Number(a.toString().replace(".", "")), d = Number(b.toString().replace(".", "")), mul(c / d, Math.pow(10, f - e));
}

tk.encryptStringByTXTE = function (strA, codeA) {
	if (tk.isNullOrEmpty(strA)) {
		return "";
	}

	var codeT = codeA;
	if (tk.isNullOrEmpty(codeT)) {
		codeT = "topxeq";
	}

	var sBufT = tk.strToUTF8(strA);
	var codeButT = tk.strToUTF8(codeT);

	var sDataLen = sBufT.length;
	var codeLenT = codeButT.length;

	var dBufT = [];

	for (var i = 0; i < sDataLen; i++) {
		dBufT[i] = (sBufT[i] + codeButT[i % codeLenT] + (i + 1)) % 256;
	}

	return tk.bytesToHex(dBufT);

}

tk.decryptStringByTXTE = function (strA, codeA) {
	if (tk.isNullOrEmpty(strA)) {
		return "";
	}

	var codeT = codeA;
	if (tk.isNullOrEmpty(codeT)) {
		codeT = "topxeq";
	}

	var sBufT = tk.hexToBytes(strA);
	var codeButT = tk.strToUTF8(codeT);

	var sDataLen = sBufT.length;
	var codeLenT = codeButT.length;

	var dBufT = [];

	for (var i = 0; i < sDataLen; i++) {
		dBufT[i] = tk.ensurePositive(sBufT[i] - codeButT[i % codeLenT] - (i + 1), 256);
	}

	return tk.UTF8ToStr(dBufT);

}

tk.encryptDataByTXDEE = function (srcDataA, codeA) {
	if ((srcDataA == undefined) || (srcDataA == null)) {
		return null;
	}

	var dataLenT = srcDataA.length;
	if (dataLenT < 1) {
		return srcDataA;
	}

	var codeT = codeA;
	if (tk.isNullOrEmpty(codeT)) {
		codeT = "topxeq";
	}

	var codeBufT = tk.strToUTF8(codeT);
	var codeLenT = codeBufT.length;

	var bufB = [];

	bufB[0] = tk.getRandomInt(256);
	bufB[1] = tk.getRandomInt(256);

	for (var i = 0; i < dataLenT; i++) {
		bufB[2 + i] = (srcDataA[i] + codeBufT[i % codeLenT] + (i + 1) + bufB[1]) % 256;
	}

	bufB[dataLenT + 4 - 2] = tk.getRandomInt(256);
	bufB[dataLenT + 4 - 1] = tk.getRandomInt(256);

	return bufB;
}

tk.sumBytes = function (srcDataA) {
	if ((srcDataA == undefined) || (srcDataA == null)) {
		return 0;
	}

	var lenT = srcDataA.length;

	var b = 0;

	for (var i = 0; i < lenT; i++) {
		b += srcDataA[i];
	}

	return tk.modX(b, 256);

}

tk.encryptDataByTXDEF = function (srcDataA, codeA) {
	if ((srcDataA == undefined) || (srcDataA == null)) {
		return null;
	}

	var dataLenT = srcDataA.length;
	if (dataLenT < 1) {
		return srcDataA;
	}

	var codeT = codeA;
	if (tk.isNullOrEmpty(codeT)) {
		codeT = "topxeq";
	}

	var codeBufT = tk.strToUTF8(codeT);
	var codeLenT = codeBufT.length;

	var sumT = tk.sumBytes(codeBufT);

	var addLenT = (sumT % 5) + 2;
	var encIndexT = sumT % addLenT;

	var bufB = [];

	for (var i = 0; i < addLenT; i++) {
		bufB[i] = tk.getRandomInt(256);
	}

	for (var i = 0; i < dataLenT; i++) {
		bufB[addLenT + i] = (srcDataA[i] + codeBufT[i % codeLenT] + (i + 1) + bufB[encIndexT]) % 256;
	}

	return bufB;
}

tk.encryptStringByTXDEE = function (strA, codeA) {
	if (tk.isNullOrEmpty(strA)) {
		return "";
	}

	var codeT = codeA;
	if (tk.isNullOrEmpty(codeT)) {
		codeT = "topxeq";
	}

	var dataDT = tk.encryptDataByTXDEE(tk.strToUTF8(strA), codeA)
	if (dataDT == null) {
		return tk.GenerateErrorString("encrypting failed");
	}

	return tk.bytesToHex(dataDT);
}

tk.encryptStringByTXDEF = function (strA, codeA) {
	if (tk.isNullOrEmpty(strA)) {
		return "";
	}

	var codeT = codeA;
	if (tk.isNullOrEmpty(codeT)) {
		codeT = "topxeq";
	}

	var dataDT = tk.encryptDataByTXDEF(tk.strToUTF8(strA), codeA)
	if (dataDT == null) {
		return tk.GenerateErrorString("encrypting failed");
	}

	return tk.bytesToHex(dataDT);
}

tk.decryptDataByTXDEE = function (srcDataA, codeA) {
	if ((srcDataA == undefined) || (srcDataA == null)) {
		return null;
	}

	var dataLenT = srcDataA.length - 4;
	if (dataLenT < 1) {
		return srcDataA;
	}

	var codeT = codeA;
	if (tk.isNullOrEmpty(codeT)) {
		codeT = "topxeq";
	}

	var codeBufT = tk.strToUTF8(codeT);
	var codeLenT = codeBufT.length;

	var bufB = [];

	for (var i = 0; i < dataLenT; i++) {
		bufB[i] = tk.ensurePositive(srcDataA[2 + i] - codeBufT[i % codeLenT] - (i + 1) - srcDataA[1], 256);
	}

	return bufB;
}

tk.decryptDataByTXDEF = function (srcDataA, codeA) {
	if ((srcDataA == undefined) || (srcDataA == null)) {
		return null;
	}

	var codeT = codeA;
	if (tk.isNullOrEmpty(codeT)) {
		codeT = "topxeq";
	}

	var codeBufT = tk.strToUTF8(codeT);
	var codeLenT = codeBufT.length;

	var sumT = tk.sumBytes(codeBufT);

	var addLenT = (sumT % 5) + 2;
	var encIndexT = sumT % addLenT;

	var dataLenT = srcDataA.length - addLenT;
	if (dataLenT < 1) {
		return srcDataA;
	}

	var bufB = [];

	for (var i = 0; i < dataLenT; i++) {
		bufB[i] = tk.ensurePositive(srcDataA[addLenT + i] - codeBufT[i % codeLenT] - (i + 1) - srcDataA[encIndexT], 256);
	}

	return bufB;
}

tk.decryptStringByTXDEE = function (strA, codeA) {
	if (tk.isNullOrEmpty(strA)) {
		return "";
	}

	var codeT = codeA;
	if (tk.isNullOrEmpty(codeT)) {
		codeT = "topxeq";
	}

	var sBufT = tk.hexToBytes(strA);

	var dBufT = tk.decryptDataByTXDEE(sBufT, codeT)

	if (dBufT == null) {
		return tk.GenerateErrorString("failed to decrypt");
	}

	return tk.UTF8ToStr(dBufT);
}

tk.decryptStringByTXDEF = function (strA, codeA) {
	if (tk.isNullOrEmpty(strA)) {
		return "";
	}

	var codeT = codeA;
	if (tk.isNullOrEmpty(codeT)) {
		codeT = "topxeq";
	}

	var sBufT = tk.hexToBytes(strA);

	var dBufT = tk.decryptDataByTXDEF(sBufT, codeT)

	if (dBufT == null) {
		return tk.GenerateErrorString("failed to decrypt");
	}

	return tk.UTF8ToStr(dBufT);
}

tk.getRandomInt = function (maxA) {
	return Math.floor((Math.random() * maxA));
}

tk.getRandomIntIncludeMax = function (maxA) {
	return Math.floor((Math.random() * (maxA + 1)));
}

tk.makeDifferenceInRange = function (aryA, rangeScaleA, baseA) {
	if (aryA == null) {
		return null;
	}

	var rAry = new Array();

	if (aryA.length < 1) {
		return rAry;
	}

	var minv = aryA[0], maxv = aryA[0];

	for (var i = 1; i < aryA.length; i++) {
		if (aryA[i] < minv) {
			minv = aryA[i];
		}
		if (aryA[i] > maxv) {
			maxv = aryA[i];
		}
	}

	var rangeT = maxv - minv;

	for (var i = 0; i < aryA.length; i++) {
		rAry[i] = baseA + ((aryA[i] - minv) / rangeT) * rangeScaleA
	}

	return rAry;
};

tk.calMinMax = function (aryA) {
	if (aryA == null) {
		return [0.0, 0.0];
	}

	if (aryA.length < 1) {
		return [0.0, 0.0];
	}

	var minv = aryA[0], maxv = aryA[0];

	for (var i = 1; i < aryA.length; i++) {
		if (aryA[i] < minv) {
			minv = aryA[i];
		}
		if (aryA[i] > maxv) {
			maxv = aryA[i];
		}
	}

	return [minv, maxv];
};

tk.hexToStr = function (hexStr) {
	var byteArray = [];

	var lent = Math.floor(hexStr.length / 2);

	for (var i = 0; i < lent; i++) {
		byteArray.push(parseInt(hexStr.substr(i * 2, 2), 16));
	}

	return tk.bytesToStr(byteArray);
};

tk.hexToBytes = function (hexStr) {
	var byteArray = [];

	var lent = Math.floor(hexStr.length / 2);

	for (var i = 0; i < lent; i++) {
		byteArray.push(parseInt(hexStr.substr(i * 2, 2), 16));
	}

	return byteArray;
};

tk.intToHex = function (number) {
	return number.toString(16).toUpperCase();
}

tk.hexToInt = function (str) {
	return parseInt(str, 16);
}

tk.strToInt = function (str) {
	return parseInt(str, 10);
}

tk.strToIntDefault = function (strA, defaultA) {
	var rs = parseInt(strA, 10);
	if (isNaN(rs)) {
		return defaultA;
	}

	return rs;
}

tk.strToFloat = function (str) {
	return parseFloat(str);
}

tk.strToFloatDefault = function (strA, defaultA) {
	var rs = parseFloat(strA);
	if (isNaN(rs)) {
		return defaultA;
	}

	return rs;
}

tk.boolToStr = function (boolA) {
	if (boolA) {
		return "true";
	} else {
		return "false";
	}
}

tk.isNull = function (objA) {
	if (objA == undefined) {
		return true;
	}

	if (objA == null) {
		return true;
	}

	return false;
}

tk.isNullOrEmpty = function (strA) {
	if (strA == undefined) {
		return true;
	}

	if (strA == null) {
		return true;
	}

	if (strA == "") {
		return true;
	}

	return false;
}

tk.nullToEmpty = function (strA) {
	if (strA == undefined) {
		return "";
	}

	if (strA == null) {
		return "";
	}

	if (typeof(strA) == 'string') {
		return strA;
	}

	return ''+strA;
}

tk.isNullOrEmptyTrim = function (strA) {
	if (strA == undefined) {
		return true;
	}

	if (strA == null) {
		return true;
	}

	if (strA.trim() == "") {
		return true;
	}

	return false;
}

tk.ParseCommandLine = function (command) {
	var args = new Array();

	var state = "start";
	var current = "";
	var quote = "\"";
	var escapeNext = false;

	for (var i = 0; i < command.length; i++) {
		var c = command[i];

		if (escapeNext) {
			current += c;
			escapeNext = false;
			continue;
		}

		if (c == '\\') {
			escapeNext = true;
			continue;
		}

		if (state == "quotes") {
			if (c != quote) {
				current += c;
			} else {
				args.push(current)
				current = "";
				state = "start";
			}

			continue;
		}

		if ((c == '"') || (c == "'") || (c == "`")) {
			state = "quotes";
			quote = c;
			continue;
		}

		if (state == "arg") {
			if ((c == ' ') || (c == "\t")) {
				args.push(current);
				current = "";
				state = "start";
			} else {
				current += c;
			}

			continue;
		}

		if ((c != ' ') && (c != "\t")) {
			state = "arg";
			current += c;
		}
	}

	if (state == "quotes") {
		return new Array(command);
	}

	if (current != "") {
		args.push(current);
	}

	return args;
}

tk.getQueryString = function (name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) {
		return unescape(r[2]);
	}

	return null;
}

tk.getQueryStringX = function (name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");

	var r = document.location.href.substring(document.location.href.indexOf('?') + 1).match(reg);

	if (r != null) {
		return decodeURIComponent(r[2]);
	}

	return null;
}

tk.pln = function(...argsA) {
	if (window.pln) {
		pln.apply(null, argsA);
	} else {
		console.log.apply(null, argsA)
	}
}

tk.htmlEncode = function (str, noNbsp) {
	if (tk.isNullOrEmpty(str)) {
		return "";
	}

	var s = "";
	if (str.length == 0) return "";
	s = str.replace(/&/g, "&gt;");
	s = s.replace(/</g, "&lt;");
	s = s.replace(/>/g, "&gt;");
	if (!noNbsp) {
		s = s.replace(/ /g, "&nbsp;");
	}
	s = s.replace(/\'/g, "&#39;");
	s = s.replace(/\"/g, "&quot;");
	s = s.replace(/\n/g, "<br>");
	return s;
}

tk.htmlDecode = function (str) {
	if (tk.isNullOrEmpty(str)) {
		return "";
	}

	var s = "";

	if (str.length == 0) return "";
	s = str.replace(/&gt;/g, "&");
	s = s.replace(/&lt;/g, "<");
	s = s.replace(/&gt;/g, ">");
	s = s.replace(/&nbsp;/g, " ");
	s = s.replace(/&#39;/g, "\'");
	s = s.replace(/&quot;/g, "\"");
	s = s.replace(/<br>/g, "\n");
	return s;
}

tk.getBrowserWindowHeight = function () {
	var clientHeight = 0;
	if (document.body.clientHeight && document.documentElement.clientHeight) {
		var clientHeight = (document.body.clientHeight < document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
	} else {
		var clientHeight = (document.body.clientHeight > document.documentElement.clientHeight) ? document.body.clientHeight : document.documentElement.clientHeight;
	}

	return clientHeight;
}

tk.getBrowserWindowWidth = function () {
	var clientWidth = 0;
	if (document.body.clientWidth && document.documentElement.clientWidth) {
		var clientWidth = (document.body.clientWidth < document.documentElement.clientWidth) ? document.body.clientWidth : document.documentElement.clientWidth;
	} else {
		var clientWidth = (document.body.clientWidth > document.documentElement.clientWidth) ? document.body.clientWidth : document.documentElement.clientWidth;
	}

	return clientWidth;
}

tk.functionExists = function (funcNameA) {
	try {
		if (typeof (eval(funcNameA)) == "function") {
			return true;
		}
	} catch (e) { }
	return false;
}

tk.pasteText = function (strA) {
	return new Promise(function (resolve, reject) {
		var success = false;
		function listener(e) {
			e.clipboardData.setData("text/plain", strA);
			e.preventDefault();
			success = true;
		}

		document.addEventListener("copy", listener);
		document.execCommand("copy");
		document.removeEventListener("copy", listener);
		success ? resolve() : reject();
	});
}

tk.isErrStr = function (strA) {
    if (typeof(strA) != "string") {
        return false;
    }

	return strA.startsWith("TXERROR:");
}

tk.getErrStr = function (errStrA) {
	return errStrA.substring(8);
}

tk.errStr = function (strA) {
	return "TXERROR:" + strA;
}

tk.errStrf = function (formatA, ...argsA) {
    var copyT = [].slice.call(argsA);

    copyT.unshift("TXERROR:"+formatA);

	return tk.spr.apply(null, copyT);
}

// [object Array], [object RegExp]...
tk.getTypeName = function(objA) {
	return Object.prototype.toString.call(objA);
}

tk.toStr = function(objA) {
    return String(objA)
}

tk.toInt = function(objA, defaultA) {
    var defaultT

    if (!defaultA) {
        defaultT = -1
    } else {
        defaultT = defaultA
    }

    var c = parseInt(objA)

    if (isNaN(c)) {
        return defaultT
    }

    return c
}

tk.toRune = function(objA, defaultA) {
    var defaultT

    if (!defaultA) {
        defaultT = -1
    } else {
        defaultT = defaultA
    }

    var c = parseInt(objA)

    if (isNaN(c)) {
        return defaultT
    }

    return c
}

tk.toByte = function(objA, defaultA) {
    var defaultT

    if (!defaultA) {
        defaultT = 0
    } else {
        defaultT = defaultA
    }

    var c = parseInt(objA)

    if (isNaN(c)) {
        return defaultT
    }

    return tk.modX(c, 256);
}

tk.toFloat = function(objA, defaultA) {
    var defaultT

    if (!defaultA) {
        defaultT = 0.0
    } else {
        defaultT = defaultA
    }

    var f = parseFloat(objA)

    if (isNaN(f)) {
        return defaultT
    }

    return f
}

tk.toBool = function(strA) {
    var typeT = typeof(strA);

    // console.log("typeT", typeT);

    if (typeT == "boolean") {
        return strA;
    } else if (typeT == "string") {
        var lowerStr = strA.toLowerCase();

        if ((lowerStr == "yes") || (lowerStr == "true")) {
            return true;
        }
    
        if ((lowerStr == "no") || (lowerStr == "false")) {
            return false;
        }
    
    }

    return false;
}

tk.limitStr = function(strA, lenA) {
	if (lenA < 0) {
		return strA
	}

    if (!strA) {
        return ""
    }

	var lenT = strA.length;

	var diffT = lenT - lenA

	if (diffT <= 0) {
		return strA
	}

	return strA.slice(0, lenA) + "...";

}

tk.endsWith = function (strA, s) {
	if (s == null || s == "" || strA.length == 0 || s.length > strA.length)
		return false;
	if (strA.substring(strA.length - s.length) == s)
		return true;
	else
		return false;
	return true;
}

tk.startsWith = function (strA, s) {
	if (s == null || s == "" || strA.length == 0 || s.length > strA.length)
		return false;
	if (strA.substr(0, s.length) == s)
		return true;
	else
		return false;
	return true;
}

tk.trim = function (strA) {
	return strA.trim();
}

tk.trimChar = function (strA, charA) {
	var re = new RegExp("^" + charA + "+(.*)" + charA + "+$", "gm");
	return strA.replace(re, '$1');
}

tk.trimStart = function(strA, c)
{
    if(c==null||c=="")
    {
        var str= strA.replace(/^\s*/, '');
        return str;
    }
    else
    {
        var rg=new RegExp("^"+c+"*");
        var str= strA.replace(rg, '');
        return str;
    }
}

tk.trimEnd = function(strA, c)
{
    if(c==null||c=="")
    {
        var rg = /\s/;
        var i = strA.length;
        while (rg.test(strA.charAt(--i)));
        return strA.slice(0, i + 1);
    }
    else
    {
        var rg = new RegExp(c);
        var i = strA.length;
        while (rg.test(strA.charAt(--i)));
        return strA.slice(0, i + 1);
    }
}

tk.strRegIndexOf = function(strA, regex, startpos) {
    var indexOf = strA.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

tk.strRegPosOf = function(strA, regex, startpos) {
    var posOf = this.substring(startpos || 0).match(regex);

	if (!posOf) {
		return null;
	}

	if (!posOf.index) {
		// console.log("posOf:", posOf, regex, startpos);

		var idxT = strA.regIndexOf(regex, startpos);

		return {Hit: posOf[0], Index: idxT, Len: posOf[0].length};
	}
	return {Hit: posOf[0], Index: posOf.index, Len: posOf[0].length};
}

tk.strRegPosOfAll = function(strA, regexA) {
	if (regexA instanceof RegExp) {
		if (!regexA.global) {
			regexA = new RegExp(regexA.source, "g"+(regexA.multiline?"m":"")+(regexA.ignoreCase?"i":""));
		}
	} else if (regexA instanceof String) {
		regexA = new RegExp(regexA, "gm")
	} else {
		return null;
	}

	var aryT = new Array();
	var result;

	while ((result = regexA.exec(strA)) != null)  {
		aryT.push({Hit: result[0], Index: result.index, Len: result[0].length});
		// console.log(regexA.lastIndex)
	}

	if (aryT.length < 1) {
		return null;
	}

	return aryT;
}

tk.strPosOf = function(strA, subStrA, startpos) {
    var posOf = strA.indexOf(subStrA, startpos || 0);

	if (posOf < 0) {
		return null;
	}
	return {Hit: subStrA, Index: posOf, Len: subStrA.length};
    // return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

tk.strPosOfAll = function(strA, subStrA) {
	var startpos = 0;

	var aryT = new Array();

	for (;;) {
		var posOf = strA.indexOf(subStrA, startpos);

		if (posOf < 0) {
			break;
		}

		aryT.push({Hit: subStrA, Index: posOf, Len: subStrA.length});

		startpos = posOf + 1;
	}

	if (aryT.length < 1) {
		return null;
	}

	return aryT;
	// return {Hit: subStrA, Index: posOf, Len: subStrA.length};
    // return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

tk.strSplitRegex = function(strA) {
	if (strA.startsWith("(?")) {
		// console.log(this);
		var char3 = strA.substr(2, 1);
		if ((char3 == "!") || (char3 == "=") || (char3 == "<")) {
			return ["gm", strA.toString()];
		}

		var headLenT = strA.indexOf(")")+1;
		var headT = strA.substr(0, headLenT);
		var tailT = strA.substr(headLenT);

		if (headT.contains("i")) {
			return ["gmi", tailT];
		}

		return ["gm", tailT];
	} else {
		return ["gm", strA.toString()];
	}
}

tk.strRegLastIndexOf = function(strA, regex, startpos) {
    regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
    if(typeof (startpos) == "undefined") {
        startpos = strA.length;
    } else if(startpos < 0) {
        startpos = 0;
    }
    var stringToWorkWith = strA.substring(0, startpos + 1);
    var lastIndexOf = -1;
    var nextStop = 0;
    while((result = regex.exec(stringToWorkWith)) != null) {
        lastIndexOf = result.index;
        regex.lastIndex = ++nextStop;
    }
    return lastIndexOf;
}

tk.getCookie = function(c_name) {
	if (document.cookie.length > 0) {
		c_start = document.cookie.indexOf(c_name + "=")
		if (c_start != -1) {
			c_start = c_start + c_name.length + 1;
			c_end = document.cookie.indexOf(";", c_start);
			if (c_end == -1) {
				c_end = document.cookie.length;
			}
			return unescape(document.cookie.substring(c_start, c_end));
		}
	}

	return ""
}

tk.setCookie = function(name, value, iDay) {
	var oDate = new Date();
	oDate.setDate(oDate.getDate() + iDay);
	document.cookie = name + '=' + value + ';expires=' + oDate;
}

tk.objToStr = function(o) {
	var r = [];
	if (typeof o == "string") {
		return "\"" + o.replace(/([\'\"\\])/g, "\\$1").replace(/(\n)/g, "\\n").replace(/(\r)/g, "\\r").replace(/(\t)/g, "\\t") + "\"";
	}
	if (typeof o == "object") {
		if (!o.sort) {
			for (var i in o) {
				r.push(i + ":" + obj2string(o[i]));
			}
			if (!!document.all && !/^\n?function\s*toString\(\)\s*\{\n?\s*\[native code\]\n?\s*\}\n?\s*$/.test(o.toString)) {
				r.push("toString:" + o.toString.toString());
			}
			r = "{" + r.join() + "}";
		} else {
			for (var i = 0; i < o.length; i++) {
				r.push(obj2string(o[i]))
			}
			r = "[" + r.join() + "]";
		}
		return r;
	}
	return o.toString();
}

tk.strContainsIgnoreCase = function (strA, substr) {
	string = strA.toLowerCase();
	substr = substr.toLowerCase();

	var startChar = substr.substring(0, 1);
	var strLen = substr.length;
	for (var j = 0; j < string.length - strLen + 1; j++) {
		if (string.charAt(j) == startChar) {
			if (string.substring(j, j + strLen) == substr) {
				return true;
			}
		}
	}
	return false;
}

tk.arrayContains = function (aryA, substr) {
	for (var j = 0; j < aryA.length; j++) {
		if (aryA[j] == substr) {
			return true;
		}
	}
	return false;
}

tk.removeEmptyInArray = function (aryA) {
	for (var j = (aryA.length - 1); j >= 0; j--) {
		if (aryA[j] == "") {
			aryA.splice(j);
		}
	}
}

tk.removeEmptyTrimInArray = function (aryA) {
	for (var j = (aryA.length - 1); j >= 0; j--) {
		if (aryA[j].trim() == "") {
			aryA.splice(j, 1);
		}
	}
}

tk.popArrayRandom = function (aryA) {
	var idx = tk.getRandomInt(aryA.length);

	return aryA.splice(idx, 1);
}

tk.popArrayByIndex = function (aryA, idxA) {
	return aryA.splice(idxA, 1);
}

// var bufT = new TXStringBuffer('<div><p><strong>整体建议：</strong>'+objT["suggestion"]+'</p>');

// bufT.append('<table>');
// bufT.append('</table></div>');

// mcShowInfo(bufT.toString());
function TXStringBuffer() {
	this.__strings__ = [];
};

function TXStringBuffer(str) {
	this.__strings__ = [];
	this.__strings__.push(str);
};

TXStringBuffer.prototype.append = function (str) {
	this.__strings__.push(str);
};

TXStringBuffer.prototype.appendWithPrefix = function (str, prefixA) {
	if (this.__strings__.length > 0) {
		this.__strings__.push(prefixA);
	}

	this.__strings__.push(str);
};

TXStringBuffer.prototype.length = function (str) {
	return this.__strings__.length;
};

TXStringBuffer.prototype.toString = function () {
	return this.__strings__.join('');
};

TXStringBuffer.prototype.getString = function () {
	return this.__strings__.join('');
};

tk.newStrBuf = function() {
	return new TXStringBuffer();
}

tk.paddingZero = function (numberA, digitCountA) {
	return ('0'.repeat(digitCountA) + numberA).slice(-digitCountA);
}

tk.notNullX = function (valueA, defaultA) {
	if (defaultA == undefined) {
		defaultA = "";
	}

	if (valueA == undefined) {
		return defaultA;
	}

	if (valueA == null) {
		return defaultA;
	}

	if (valueA.toLowerCase() == "null") {
		return defaultA;
	}

	return valueA;
}

tk.getItemByIndex = function (dicA, idxA) {
	var idxT = 0;
	for (var itemT in dicA) {
		if (idxT == idxA) {
			return dicA[itemT];
		}

		idxT++;
	}

	return null;
}

tk.getNowFormatDate = function (seperator1) {
	var date = new Date();
	if (seperator1 == undefined) {
		seperator1 = "-"
	}

	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = year + seperator1 + month + seperator1 + strDate;
	return currentdate;
}

tk.getNowFormatTime = function (seperator1, seperator2) {
	var now = new Date();
	var year = now.getFullYear();
	var month = now.getMonth() + 1;
	var date = now.getDate();
	var day = now.getDay();//得到周几
	var hour = now.getHours();//得到小时
	var minu = now.getMinutes();//得到分钟
	var sec = now.getSeconds();//得到秒

	if (seperator1 == undefined) {
		seperator1 = "-"
	}

	if (seperator2 == undefined) {
		seperator2 = ":"
	}

	var rs = year.paddingZero(4) + seperator1 + month.paddingZero(2) + seperator1 + date.paddingZero(2) + " " + hour.paddingZero(2) + seperator2 + minu.paddingZero(2) + seperator2 + sec.paddingZero(2);

	return rs
}

tk.getTimeUTC = function (timeA) {
	var y = timeA.getUTCFullYear();
	var m = timeA.getUTCMonth() + 1;
	var d = timeA.getUTCDate();
	var h = timeA.getUTCHours();
	var M = timeA.getUTCMinutes();
	var s = timeA.getUTCSeconds();

	return '' + y + '-' + ('00' + m).slice(-2) + '-' + ('00' + d).slice(-2) + 'T' + ('00' + h).slice(-2) + ':' + ('00' + M).slice(-2) + ':' + ('00' + s).slice(-2) + 'Z';
}

tk.getDateCompact = function (dateA) {
	var y = dateA.getFullYear();
	var m = dateA.getMonth() + 1;
	var d = dateA.getDate();
	var h = dateA.getHours();
	var M = dateA.getMinutes();
	var s = dateA.getSeconds();

	return '' + y + '-' + ('00' + m).slice(-2) + '-' + ('00' + d).slice(-2) + ' ' + ('00' + h).slice(-2) + ':' + ('00' + M).slice(-2) + ':' + ('00' + s).slice(-2);
}

tk.formatDate = function (dateA, fmt) {
	var o = {
		"M+": dateA.getMonth() + 1,                 //月份   
		"d+": dateA.getDate(),                    //日   
		"h+": dateA.getHours(),                   //小时   
		"m+": dateA.getMinutes(),                 //分   
		"s+": dateA.getSeconds(),                 //秒   
		"q+": Math.floor((dateA.getMonth() + 3) / 3), //季度   
		"S": dateA.getMilliseconds()             //毫秒   
	};

	if (fmt == undefined) {
		fmt = "yyyy/MM/dd hh:mm:ss";
	}

	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (dateA.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));

	return fmt;
}

// if the string in date format like: '2002-12-18'
tk.isValidDateStr = function () {
	if (/\d\d\d\d\-\d\d\-\d\d/.test(this)) {
		return true;
	}

	return false;
}

// Cal date diff, result will be by days, eg: sDate1 - sDate2
tk.dateDiff = function (sDate1, sDate2) {  //sDate1 and sDate2 in string format like: '2002-12-18'

	var aDate, oDate1, oDate2, iDays;

	aDate = sDate1.split("-");

	oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);  // convert to 12-18-2002 format

	aDate = sDate2.split("-");

	oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);

	// iDays = parseInt(Math.abs(oDate1 - oDate2) / 1000 / 60 / 60 / 24);  // convert to days
	iDays = parseInt((oDate1 - oDate2) / 1000 / 60 / 60 / 24);

	return iDays;

}

tk.strToTime = function(strA) {
	var oTime = new Date(strA);

	return oTime;
}

tk.getNowTime = function() {
	return (new Date());
}

tk.isValidDate = function(dateA) {
	return dateA instanceof Date && !isNaN(dateA.getTime());
}

tk.unixTimeStampToTime = function(timeStrA) {
	var unixTimestamp = new Date(parseInt(timeStrA));
	return unixTimestamp.Format();
}

// Cal time diff, result will be by seconds, eg: sTime1 - sTime2
tk.timeDiff = function (dateStrA, sTime2) {  // sTime1 and sTime2 in string format like: '2002-12-18 08:00:00'

	var oTime1 = new Date(dateStrA);

	oTime2 = new Date(sTime2);

	iSeconds = parseInt((oTime1 - oTime2) / 1000);

	return iSeconds;

}

// determine if str1(as date in format: 2002-12-18) > date in str2
tk.dateGreatThan = function (sDate1, sDate2) {  //sDate1 and sDate2 in format: 2002-12-18

	var aDate, oDate1, oDate2, iDays;

	aDate = sDate1.split("-");

	oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);  // convert to 12-18-2002 format

	aDate = sDate2.split("-");

	oDate2 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);

	return (oDate1 > oDate2);

}

// add n days to the date represented by str1(as date in format: 2002-12-18)
tk.addDays = function (dayStrA, daysA) {  //this day in format: 2002-12-18

	var aDate, oDate1, oDate2, iDays;

	aDate = dayStrA.split("-");

	oDate1 = new Date(aDate[1] + '-' + aDate[2] + '-' + aDate[0]);  // convert to 12-18-2002 format

	oDate1.setDate(oDate1.getDate() + daysA);

	var monthT = '' + (oDate1.getMonth()+1);
	if (monthT.length < 2) {
		monthT = '0' + monthT;
	}

	var dayT = '' + (oDate1.getDate());
	if (dayT.length < 2) {
		dayT = '0' + dayT;
	}

	return (oDate1.getFullYear() +"-"+ monthT +"-"+ dayT);

}

tk.unixTimeStampToTimeCompact = function (strA) {  //this day in format: 1617091220576

	var unixTimestamp = new Date(parseInt(strA));
	
	var commonTime = unixTimestamp.GetCompact();

	return commonTime;

}

//  A formatted version of a popular md5 implementation.
//  Original copyright (c) Paul Johnston & Greg Holt.
tk.md5 = function(inputString) {
    var hc="0123456789abcdef";
    function rh(n) {var j,s="";for(j=0;j<=3;j++) s+=hc.charAt((n>>(j*8+4))&0x0F)+hc.charAt((n>>(j*8))&0x0F);return s;}
    function ad(x,y) {var l=(x&0xFFFF)+(y&0xFFFF);var m=(x>>16)+(y>>16)+(l>>16);return (m<<16)|(l&0xFFFF);}
    function rl(n,c)            {return (n<<c)|(n>>>(32-c));}
    function cm(q,a,b,x,s,t)    {return ad(rl(ad(ad(a,q),ad(x,t)),s),b);}
    function ff(a,b,c,d,x,s,t)  {return cm((b&c)|((~b)&d),a,b,x,s,t);}
    function gg(a,b,c,d,x,s,t)  {return cm((b&d)|(c&(~d)),a,b,x,s,t);}
    function hh(a,b,c,d,x,s,t)  {return cm(b^c^d,a,b,x,s,t);}
    function ii(a,b,c,d,x,s,t)  {return cm(c^(b|(~d)),a,b,x,s,t);}
    function sb(x) {
        var i;var nblk=((x.length+8)>>6)+1;var blks=new Array(nblk*16);for(i=0;i<nblk*16;i++) blks[i]=0;
        for(i=0;i<x.length;i++) blks[i>>2]|=x.charCodeAt(i)<<((i%4)*8);
        blks[i>>2]|=0x80<<((i%4)*8);blks[nblk*16-2]=x.length*8;return blks;
    }
    var i,x=sb(inputString),a=1732584193,b=-271733879,c=-1732584194,d=271733878,olda,oldb,oldc,oldd;
    for(i=0;i<x.length;i+=16) {olda=a;oldb=b;oldc=c;oldd=d;
        a=ff(a,b,c,d,x[i+ 0], 7, -680876936);d=ff(d,a,b,c,x[i+ 1],12, -389564586);c=ff(c,d,a,b,x[i+ 2],17,  606105819);
        b=ff(b,c,d,a,x[i+ 3],22,-1044525330);a=ff(a,b,c,d,x[i+ 4], 7, -176418897);d=ff(d,a,b,c,x[i+ 5],12, 1200080426);
        c=ff(c,d,a,b,x[i+ 6],17,-1473231341);b=ff(b,c,d,a,x[i+ 7],22,  -45705983);a=ff(a,b,c,d,x[i+ 8], 7, 1770035416);
        d=ff(d,a,b,c,x[i+ 9],12,-1958414417);c=ff(c,d,a,b,x[i+10],17,     -42063);b=ff(b,c,d,a,x[i+11],22,-1990404162);
        a=ff(a,b,c,d,x[i+12], 7, 1804603682);d=ff(d,a,b,c,x[i+13],12,  -40341101);c=ff(c,d,a,b,x[i+14],17,-1502002290);
        b=ff(b,c,d,a,x[i+15],22, 1236535329);a=gg(a,b,c,d,x[i+ 1], 5, -165796510);d=gg(d,a,b,c,x[i+ 6], 9,-1069501632);
        c=gg(c,d,a,b,x[i+11],14,  643717713);b=gg(b,c,d,a,x[i+ 0],20, -373897302);a=gg(a,b,c,d,x[i+ 5], 5, -701558691);
        d=gg(d,a,b,c,x[i+10], 9,   38016083);c=gg(c,d,a,b,x[i+15],14, -660478335);b=gg(b,c,d,a,x[i+ 4],20, -405537848);
        a=gg(a,b,c,d,x[i+ 9], 5,  568446438);d=gg(d,a,b,c,x[i+14], 9,-1019803690);c=gg(c,d,a,b,x[i+ 3],14, -187363961);
        b=gg(b,c,d,a,x[i+ 8],20, 1163531501);a=gg(a,b,c,d,x[i+13], 5,-1444681467);d=gg(d,a,b,c,x[i+ 2], 9,  -51403784);
        c=gg(c,d,a,b,x[i+ 7],14, 1735328473);b=gg(b,c,d,a,x[i+12],20,-1926607734);a=hh(a,b,c,d,x[i+ 5], 4,    -378558);
        d=hh(d,a,b,c,x[i+ 8],11,-2022574463);c=hh(c,d,a,b,x[i+11],16, 1839030562);b=hh(b,c,d,a,x[i+14],23,  -35309556);
        a=hh(a,b,c,d,x[i+ 1], 4,-1530992060);d=hh(d,a,b,c,x[i+ 4],11, 1272893353);c=hh(c,d,a,b,x[i+ 7],16, -155497632);
        b=hh(b,c,d,a,x[i+10],23,-1094730640);a=hh(a,b,c,d,x[i+13], 4,  681279174);d=hh(d,a,b,c,x[i+ 0],11, -358537222);
        c=hh(c,d,a,b,x[i+ 3],16, -722521979);b=hh(b,c,d,a,x[i+ 6],23,   76029189);a=hh(a,b,c,d,x[i+ 9], 4, -640364487);
        d=hh(d,a,b,c,x[i+12],11, -421815835);c=hh(c,d,a,b,x[i+15],16,  530742520);b=hh(b,c,d,a,x[i+ 2],23, -995338651);
        a=ii(a,b,c,d,x[i+ 0], 6, -198630844);d=ii(d,a,b,c,x[i+ 7],10, 1126891415);c=ii(c,d,a,b,x[i+14],15,-1416354905);
        b=ii(b,c,d,a,x[i+ 5],21,  -57434055);a=ii(a,b,c,d,x[i+12], 6, 1700485571);d=ii(d,a,b,c,x[i+ 3],10,-1894986606);
        c=ii(c,d,a,b,x[i+10],15,   -1051523);b=ii(b,c,d,a,x[i+ 1],21,-2054922799);a=ii(a,b,c,d,x[i+ 8], 6, 1873313359);
        d=ii(d,a,b,c,x[i+15],10,  -30611744);c=ii(c,d,a,b,x[i+ 6],15,-1560198380);b=ii(b,c,d,a,x[i+13],21, 1309151649);
        a=ii(a,b,c,d,x[i+ 4], 6, -145523070);d=ii(d,a,b,c,x[i+11],10,-1120210379);c=ii(c,d,a,b,x[i+ 2],15,  718787259);
        b=ii(b,c,d,a,x[i+ 9],21, -343485551);a=ad(a,olda);b=ad(b,oldb);c=ad(c,oldc);d=ad(d,oldd);
    }
    return rh(a)+rh(b)+rh(c)+rh(d);
}

/**
 * Copyright (c) 2010 Jakob Westhoff
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

// modified by TopXeQ
 tk.spr = function (format) {
    // Check for format definition
    if (typeof(format) != 'string') {
        throw "sprintf: The first arguments need to be a valid format string.";
    }

    /**
     * Define the regex to match a formating string
     * The regex consists of the following parts:
     * percent sign to indicate the start
     * (optional) sign specifier
     * (optional) padding specifier
     * (optional) alignment specifier
     * (optional) width specifier
     * (optional) precision specifier
     * type specifier:
     *  % - literal percent sign
     *  b - binary number
     *  c - ASCII character represented by the given value
     *  d - signed decimal number
     *  f - floating point value
     *  o - octal number
     *  s - string
     *  x - hexadecimal number (lowercase characters)
     *  X - hexadecimal number (uppercase characters)
     *  j - JSON representation
     *  v - value representation
     */
    var r = new RegExp(/%(\+)?([0 ]|'(.))?(-)?([0-9]+)?(\.([0-9]+))?([%bcdfosxXvj])/g);

    /**
     * Each format string is splitted into the following parts:
     * 0: Full format string
     * 1: sign specifier (+)
     * 2: padding specifier (0/<space>/'<any char>)
     * 3: if the padding character starts with a ' this will be the real
     *    padding character
     * 4: alignment specifier
     * 5: width specifier
     * 6: precision specifier including the dot
     * 7: precision specifier without the dot
     * 8: type specifier
     */
    var parts = [];
    var paramIndex = 1;
    while (part = r.exec(format)) {
        // Check if an input value has been provided, for the current
        // format string (no argument needed for %%)
        if ((paramIndex >= arguments.length) && (part[8] != '%')) {
            throw "sprintf: At least one argument was missing.";
        }

        parts[parts.length] = {
            /* beginning of the part in the string */
            begin: part.index,
            /* end of the part in the string */
            end: part.index + part[0].length,
            /* force sign */
            sign: (part[1] == '+'),
            /* is the given data negative */
            negative: (parseFloat(arguments[paramIndex]) < 0) ? true : false,
            /* padding character (default: <space>) */
            padding: (part[2] == undefined)
                ? (' ') /* default */
                : ((part[2].substring(0, 1) == "'")
                    ? (part[3]) /* use special char */
                    : (part[2]) /* use normal <space> or zero */
                ),
            /* should the output be aligned left?*/
            alignLeft: (part[4] == '-'),
            /* width specifier (number or false) */
            width: (part[5] != undefined) ? part[5] : false,
            /* precision specifier (number or false) */
            precision: (part[7] != undefined) ? part[7] : false,
            /* type specifier */
            type: part[8],
            /* the given data associated with this part converted to a string */
            // data: (part[8] != '%') ? String(arguments[paramIndex++]) : false,
            data: (part[8] != '%') ? arguments[paramIndex++] : false
        };
    }

    var newString = "";
    var start = 0;
    // Generate our new formated string
    for (var i = 0; i < parts.length; ++i) {
        // Add first unformated string part
        newString += format.substring(start, parts[i].begin);

        // Mark the new string start
        start = parts[i].end;

        // Create the appropriate preformat substitution
        // This substitution is only the correct type conversion. All the
        // different options and flags haven't been applied to it at this
        // point
        var preSubstitution = "";
        switch (parts[i].type) {
            case '%':
                preSubstitution = "%";
                break;
            case 'b':
                preSubstitution = Math.abs(parseInt(String(parts[i].data))).toString(2);
                break;
            case 'c':
                preSubstitution = String.fromCharCode(Math.abs(parseInt(String(parts[i].data))));
                break;
            case 'd':
                preSubstitution = String(Math.abs(parseInt(String(parts[i].data))));
                break;
            case 'f':
                preSubstitution = (parts[i].precision === false)
                    ? (String((Math.abs(parseFloat(String(parts[i].data))))))
                    : (Math.abs(parseFloat(String(parts[i].data))).toFixed(parts[i].precision));
                break;
            case 'o':
                preSubstitution = Math.abs(parseInt(String(parts[i].data))).toString(8);
                break;
            case 's':
                var strT = String(parts[i].data);
                preSubstitution = strT.substring(0, parts[i].precision ? parts[i].precision : strT.length); /* Cut if precision is defined */
                break;
            case 'x':
                preSubstitution = Math.abs(parseInt(String(parts[i].data))).toString(16).toLowerCase();
                break;
            case 'X':
                preSubstitution = Math.abs(parseInt(String(parts[i].data))).toString(16).toUpperCase();
                break;
            case 'j':
                preSubstitution = JSON.stringify(parts[i].data);
                break;
            case 'v':
                var objT = parts[i].data;
                if (typeof(objT) == "object") {
                    preSubstitution = JSON.stringify(objT);
                } else {
                    preSubstitution = String(objT);
                }
                
                break;
            default:
                throw 'sprintf: Unknown type "' + parts[i].type + '" detected. This should never happen. Maybe the regex is wrong.';
        }

        // The % character is a special type and does not need further processing
        if (parts[i].type == "%") {
            newString += preSubstitution;
            continue;
        }

        // Modify the preSubstitution by taking sign, padding and width
        // into account

        // Pad the string based on the given width
        if (parts[i].width != false) {
            // Padding needed?
            if (parts[i].width > preSubstitution.length) {
                var origLength = preSubstitution.length;
                for (var j = 0; j < parts[i].width - origLength; ++j) {
                    preSubstitution = (parts[i].alignLeft == true)
                        ? (preSubstitution + parts[i].padding)
                        : (parts[i].padding + preSubstitution);
                }
            }
        }

        // Add a sign symbol if neccessary or enforced, but only if we are
        // not handling a string
        if (parts[i].type == 'b'
            || parts[i].type == 'd'
            || parts[i].type == 'o'
            || parts[i].type == 'f'
            || parts[i].type == 'x'
            || parts[i].type == 'X') {
            if (parts[i].negative == true) {
                preSubstitution = "-" + preSubstitution;
            }
            else if (parts[i].sign == true) {
                preSubstitution = "+" + preSubstitution;
            }
        }

        // Add the substitution to the new string
        newString += preSubstitution;
    }

    // Add the last part of the given format string, which may still be there
    newString += format.substring(start, format.length);

    return newString;
};
