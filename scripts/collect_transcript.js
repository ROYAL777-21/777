// In-browser: scroll transcript container, collect all segments, merge by timestamp
new Promise(async function(resolve) {
  var findContainer = function() {
    var els = Array.from(document.querySelectorAll('div')).filter(function(e){
      return e.scrollHeight > e.clientHeight + 300 && /\d\d:\d\d/.test(e.textContent) && e.textContent.length > 1000;
    });
    return els.length ? els[els.length - 1] : null;
  };
  var c = findContainer();
  if (!c) { resolve('NO_CONTAINER'); return; }
  var segs = {};
  var collect = function() {
    var leaves = Array.from(c.querySelectorAll('div')).filter(function(d){
      return d !== c && /^\d{1,2}:\d{2}(:\d{2})?/.test(d.textContent) && d.textContent.length > 5 && d.textContent.length < 2500;
    });
    leaves.forEach(function(d){
      var m = d.textContent.match(/^(\d{1,2}:\d{2}(?::\d{2})?)/);
      if (m && !segs[m[1]]) segs[m[1]] = d.textContent.substring(m[1].length);
    });
  };
  var lastCount = -1, stable = 0;
  c.scrollTop = 0;
  await new Promise(function(r){ setTimeout(r, 500); });
  collect();
  for (var i = 0; i < 250 && stable < 4; i++) {
    c.scrollTop = Math.min(c.scrollTop + 170, c.scrollHeight);
    await new Promise(function(r){ setTimeout(r, 250); });
    collect();
    var n = Object.keys(segs).length;
    var atBottom = c.scrollTop + c.clientHeight >= c.scrollHeight - 5;
    if (atBottom && n === lastCount) { stable++; } else { stable = 0; }
    lastCount = n;
  }
  var toSec = function(ts){ var p = ts.split(':').map(Number); return p.length === 3 ? p[0]*3600+p[1]*60+p[2] : p[0]*60+p[1]; };
  var keys = Object.keys(segs).sort(function(a,b){ return toSec(a) - toSec(b); });
  var text = keys.map(function(k){ return segs[k].trim(); }).join(' ');
  window.__fullTranscript = text;
  resolve('SEGMENTS=' + keys.length + ' LEN=' + text.length + ' LASTTS=' + keys[keys.length-1]);
});
