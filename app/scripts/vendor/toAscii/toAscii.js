function utf8_decode (str_data) {
	  // http://kevin.vanzonneveld.net
	  var tmp_arr = [],
	    i = 0,
	    ac = 0,
	    c1 = 0,
	    c2 = 0,
	    c3 = 0;

	  str_data += '';

	  while (i < str_data.length) {
	    c1 = str_data.charCodeAt(i);
	    if (c1 < 128) {
	      tmp_arr[ac++] = String.fromCharCode(c1);
	      i++;
	    } else if (c1 > 191 && c1 < 224) {
	      c2 = str_data.charCodeAt(i + 1);
	      tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
	      i += 2;
	    } else {
	      c2 = str_data.charCodeAt(i + 1);
	      c3 = str_data.charCodeAt(i + 2);
	      tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
	      i += 3;
	    }
	  }

	  return tmp_arr.join('');
}

function strtr (str, from, to) {
	  // http://kevin.vanzonneveld.net
	  var fr = '',
	    i = 0,
	    j = 0,
	    lenStr = 0,
	    lenFrom = 0,
	    tmpStrictForIn = false,
	    fromTypeStr = '',
	    toTypeStr = '',
	    istr = '';
	  var tmpFrom = [];
	  var tmpTo = [];
	  var ret = '';
	  var match = false;

	  // Received replace_pairs?
	  // Convert to normal from->to chars
	  if (typeof from === 'object') {
	    tmpStrictForIn = this.ini_set('phpjs.strictForIn', false); // Not thread-safe; temporarily set to true
	    from = this.krsort(from);
	    this.ini_set('phpjs.strictForIn', tmpStrictForIn);

	    for (fr in from) {
	      if (from.hasOwnProperty(fr)) {
	        tmpFrom.push(fr);
	        tmpTo.push(from[fr]);
	      }
	    }

	    from = tmpFrom;
	    to = tmpTo;
	  }

	  // Walk through subject and replace chars when needed
	  lenStr = str.length;
	  lenFrom = from.length;
	  fromTypeStr = typeof from === 'string';
	  toTypeStr = typeof to === 'string';

	  for (i = 0; i < lenStr; i++) {
	    match = false;
	    if (fromTypeStr) {
	      istr = str.charAt(i);
	      for (j = 0; j < lenFrom; j++) {
	        if (istr == from.charAt(j)) {
	          match = true;
	          break;
	        }
	      }
	    } else {
	      for (j = 0; j < lenFrom; j++) {
	        if (str.substr(i, from[j].length) == from[j]) {
	          match = true;
	          // Fast forward
	          i = (i + from[j].length) - 1;
	          break;
	        }
	      }
	    }
	    if (match) {
	      ret += toTypeStr ? to.charAt(j) : to[j];
	    } else {
	      ret += str.charAt(i);
	    }
	  }

	  return ret;
}


function toAscii( str )
{
    return strtr(utf8_decode(str.replace(" ", "_")), 
        utf8_decode(
        'ŠŒŽšœžŸ¥µÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýÿ'),
        'SOZsozYYuAAAAAAACEEEEIIIIDNOOOOOOUUUUYsaaaaaaaceeeeiiiionoooooouuuuyy');
}
