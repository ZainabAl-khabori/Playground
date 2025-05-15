import chardet from "chardet";
import { readFileSync, writeFileSync } from "fs";

var encoding = await chardet.detectFile("명문고 EX급 조연의 리플레이 1-1333.txt");
var all = readFileSync("Input/명문고 EX급 조연의 리플레이 1-1333.txt", encoding);

var regexp = /명문고 EX급 조연의 리플(레|에)이 \(\d+\)/g;
var chapters = all.match(regexp);

for (var i = 0; i < chapters.length; i++) {
  var ch = chapters[i];
  var num = ch.split("(").pop().slice(0, -1);

  var start = all.indexOf(ch);
  var end = (i + 1) < chapters.length ? all.indexOf(chapters[i + 1]) : null;
  var content = end ? all.slice(start, end) : all.slice(start);

  var name = `${num}.txt`;
  writeFileSync(`Output/${name}`, content, "utf8");

  console.log(name);
}

console.log();
