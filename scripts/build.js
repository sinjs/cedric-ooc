const fs = require("fs/promises");
const fss = require("fs");
const path = require("path");

async function main() {
  console.log("[👋] Building has started.");

  // Start build timer
  const time = Date.now();

  console.log("[❌] Removing old directory (error can be safely ignored)");

  await fs
    .rmdir(path.join(__dirname, "/../out/"), { recursive: true })
    .catch((e) => {
      if (e)
        console.log(
          `[❌] Failure to delete directory${
            e.code === "ENOENT" ? " because the directory doesnt exist" : ""
          }:\n`,
          e
        );
    });

  console.log("[📄] Scanning images...");

  const images = await fs.readdir(path.join(__dirname, "/../img"), {
    withFileTypes: true,
  });

  console.log("[📁] Creating folder...");

  await fs.mkdir(path.join(__dirname, "/../out"));

  console.log("[💾] Copying images...");

  images.forEach(async (image) => {
    await fs.copyFile(
      path.join(__dirname, "/../img/", image.name),
      path.join(__dirname, "/../out/", image.name)
    );
    console.log(`[✅] Copied ${image.name}`);
  });

  console.log("[📄] Scanning publics...");

  const publics = await fs.readdir(path.join(__dirname, "/../public"), {
    withFileTypes: true,
  });

  console.log("[💾] Copying public...");

  publics.forEach(async (public) => {
    await fs.copyFile(
      path.join(__dirname, "/../public/", public.name),
      path.join(__dirname, "/../out/", public.name)
    );
    console.log(`[✅] Copied ${public.name}`);
  });

  console.log("[📦] Packaging index.html...");

  console.log("[🌐] Package: Read index.html");

  let index = await fs
    .readFile(path.join(__dirname, "/../index.html"), { encoding: "utf-8" })
    .catch((e) => {
      console.error("[❌] ERROR WHILE LOADING INDEX.HTML:\n", e);
      process.exit(1);
    });

  console.log("[🌐] Package: Create image array");

  let htmlImages = "";
  let imageCount = 0;

  for (const img of images) {
    imageCount++;
    htmlImages += `
    <div class="img">
      <img src="${img.name}" alt="" srcset="">
      <p>Image ${imageCount}: ${img.name}</p>
    </div>
    `;
  }

  console.log("[🌐] Package: Add images to HTML");

  index = index.replaceAll("$images", htmlImages);

  console.log("[🌐] Package: Write index.html");

  await fs.writeFile(path.join(__dirname, "/../out/index.html"), index);

  console.log("[📦] Build and package complete! Took", Date.now() - time, "ms");
}

main();
