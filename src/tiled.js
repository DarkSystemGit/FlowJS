import { parseFile as parseImp } from "tmx-parser";
import fs from "fs";
async function parse(map){
    return new Promise((resolve, reject) => {
        parseImp(map, (err, map) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(map);
            }
        });
    })
}
console.log(await parse('./test/map.tmx'))