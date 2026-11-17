"""Regenera data.json e index.html. Uso: python3 src/build.py"""
import pathlib, subprocess, sys, json
S = pathlib.Path(__file__).resolve().parent; ROOT = S.parent
subprocess.run([sys.executable, str(S/'build_data.py')], check=True, stdout=subprocess.DEVNULL)
head, js, tail = (S/'head.html').read_text(), (S/'script.js').read_text(), (S/'tail.html').read_text()
(ROOT/'index.html').write_text(head + '<script>' + js + '</script>' + tail)
if '--preview' in sys.argv:  # versión autocontenida (datos embebidos) para vista previa
    data = (ROOT/'data.json').read_text()
    (ROOT.parent/'radar-demo-preview.html').write_text(head + '<script>window.__DATA__=' + json.dumps(json.loads(data), ensure_ascii=False) + ';' + js + '</script>' + tail)
print('index.html + data.json regenerados')
