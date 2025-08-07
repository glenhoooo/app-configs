/**
 * mosdns 辅助脚本
 * 用法：
 * - 生成 macos 配置：`node script-mosdns-v5.js gen`
 * - 下载依赖的配置文件：`node script-mosdns-v5.js down`
 */
const path = require("path");
const fs = require("fs");
const Downloader = require("nodejs-file-downloader");
const yaml = require("js-yaml");

// 配置连接代理
const proxy = "http://127.0.0.1:7890"; // http://username:password@some-proxy.com:22225
const configPath = path.resolve(__dirname, "./mosdns.v5.yml");

const QNAME_DIRECT_MATCH_STRING = "qname $direct_domain";

const CONTENT_OF_COMPANY = {
  matches: "qname $private_company_domain",
  exec: "goto company_sequence",
};

function start() {
  const arg = process.argv[2];

  switch (arg) {
    case "gen":
      generateConfigForCompany();
      break;

    case "down":
      downloadAssets();
      break;

    default:
      break;
  }
}

function downloadAssets() {
  downloadFile(
    "https://raw.githubusercontent.com/yubanmeiqin9048/domain/release/accelerated-domains.china.txt",
    path.resolve(__dirname, "./"),
    "accelerated-domains.china.txt"
  );
  downloadFile(
    "https://ispip.clang.cn/all_cn.txt",
    path.resolve(__dirname, "./"),
    "CN-ip-cidr.txt"
  );
}

function generateConfigForCompany() {
  try {
    const doc = getParsedContent();
    const main_sequence = getPlugin(doc.plugins, "main_sequence");
    const main_sequence_args = main_sequence.args;

    insertCompanyContent(main_sequence_args);

    const writePath = path.resolve(__dirname, "./mosdns.v5.company.yml");
    fs.writeFile(writePath, yaml.dump(doc), (err) => {
      if (!err) {
        console.log("写入文件成功: ", writePath);
      }
    });
  } catch (e) {
    console.log(e);
  }
}

function insertCompanyContent(main_sequence_args) {
  const index = main_sequence_args.findIndex(
    (obj) => obj.matches === QNAME_DIRECT_MATCH_STRING
  );
  main_sequence_args.splice(index, 0, CONTENT_OF_COMPANY);
}

function getPlugin(plugins, tagName) {
  return plugins.find((item) => item.tag === tagName);
}

function getParsedContent() {
  return yaml.load(fs.readFileSync(configPath, "utf8"));
}

async function downloadFile(url, distPath, fileName) {
  const downloader = new Downloader({
    proxy: proxy || undefined,
    url,
    directory: distPath,
    fileName,
    cloneFiles: false, // 覆盖文件
    onProgress: function (percentage, chunk, remainingSize) {
      //Gets called with each chunk.
      // console.log("% ", percentage);
      process.stdout.write(percentage + "%\t");
    },
  });

  try {
    console.info("Start download: " + url + "\n");
    const { filePath, downloadStatus } = await downloader.download();
    console.info("\n");
    console.log(`File successfully downloaded to: ${filePath}\n`);
  } catch (error) {
    console.error("download error", error);
  }
}

start();
