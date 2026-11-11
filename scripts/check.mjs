import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const dist=path.join(root,'dist');const context={window:{}};
const dataText=fs.readFileSync(path.join(dist,'content.js'),'utf8');
vm.runInNewContext(dataText,context);
const data=context.window.PORTFOLIO;
const all=[...data.images,...data.videos];const errors=[];
for(const item of all){
  if('source'in item)errors.push('Local source path included');
  for(const url of [item.src,item.thumb]){
    const target=path.resolve(dist,url);
    if(!target.startsWith(dist+path.sep)||!fs.existsSync(target))errors.push(`Missing or unsafe asset: ${url}`);
  }
}
for(const filename of ['app.js','experience.js','content.js'])new vm.Script(fs.readFileSync(path.join(dist,filename),'utf8'),{filename});
const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  const url=match[1];if(!/^(mailto:|tel:|https?:)/.test(url)&&!fs.existsSync(path.resolve(dist,url)))errors.push(`Missing page resource ${url}`);
}
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
if(new Set(ids).size!==ids.length)errors.push('Duplicate element ID');
if(all.length!==111)errors.push(`Unexpected asset count ${all.length}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
console.log(`PASS: ${data.images.filter(x=>x.type==='image').length} images, ${data.images.filter(x=>x.type==='motion').length} loops, ${data.videos.length} videos; all resources present, JS syntax valid, no local source paths.`);
