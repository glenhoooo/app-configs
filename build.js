const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const download = async (url, dest) => {
  const file = fs.createWriteStream(dest);

  function request() {
    const protocol = url.startsWith('https') ? https : http;
    protocol
      .get(url, function (response) {
        if (response.statusCode !== 200) {
          console.log('Error downloading, statusCode error', response.statusCode, url);
          return;
        }

        response.pipe(file);

        // after download completed close fileStream
        file.on('finish', () => {
          file.close();
          console.log('Download Completed', url);
        });
      })
      .on('error', function (err) {
        fs.unlink(dest, (unlinkErr) => {
          throw unlinkErr;
        });
        console.log('Error while downloading', err, url);
      });
  }

  request();
};

const THIRD_PARTY_PATH = './clash/premium/rule-providers/third-party/';
// 使用 ghproxy 代理下载
const USE_GH_PROXY = false;

const chRuleFiles = {
  'reject.yaml': 'https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/reject.txt',
  'icloud.yaml': 'https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/icloud.txt',
  'apple.yaml': 'https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/apple.txt',
  'proxy.yaml': 'https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/proxy.txt',
  'direct.yaml': 'https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/direct.txt',
  'private.yaml': 'https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/private.txt',
  'gfw.yaml': 'https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/gfw.txt',
  'greatfire.yaml':
    'https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/greatfire.txt',
  'tld-not-cn.yaml':
    'https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/tld-not-cn.txt',
  'telegramcidr.yaml':
    'https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/telegramcidr.txt',
  'cncidr.yaml': 'https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/cncidr.txt',
  'lancidr.yaml': 'https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/lancidr.txt',
  'applications.yaml':
    'https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/applications.txt',
  'Netflix.yaml':
    'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Netflix/Netflix.yaml',
  'Google.yaml':
    'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Google/Google.yaml',
  'Microsoft.yaml':
    'https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Providers/Ruleset/Microsoft.yaml',
};

const downloadChRuleFiles = () => {
  Object.keys(chRuleFiles).forEach(async (fileName) => {
    const url = chRuleFiles[fileName];
    await download(
      USE_GH_PROXY ? 'https://ghproxy.com/' + url : url,
      path.resolve(__dirname, THIRD_PARTY_PATH + fileName)
    );
  });
};

const transformChTemplateConfig = () => {
  const HOST = process.env.HOST;
  const templateFile = path.resolve(__dirname, './clash/premium/config-87d508960531.template.yaml');
  const content = fs.readFileSync(templateFile, 'utf8');
  const newFile = path.resolve(__dirname, './clash/premium/config-87d508960531.final.yaml');
  fs.writeFileSync(newFile, content.replace(/\$\$HOST\$\$/g, HOST));
  console.log('Wrote clash template with HOST: ', HOST);
};

downloadChRuleFiles();
transformChTemplateConfig();
