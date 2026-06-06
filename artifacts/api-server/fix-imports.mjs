import fs from "fs";
import path from "path";

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let fixed = content.replace(/from ['"](\.[^'"]+)['"]/g, (match, p) => {
    if (p.endsWith(".js") || p.endsWith(".json")) return match;
    return match.slice(0, -1) + ".js" + match.slice(-1);
  });
  if (content !== fixed) {
    fs.writeFileSync(filePath, fixed);
    console.log("Fixed:", filePath);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach((f) => {
    const full = path.join(dir, f);
    fs.statSync(full).isDirectory()
      ? walk(full)
      : f.endsWith(".ts") && fixFile(full);
  });
}

walk("src");
