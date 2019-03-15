prpl = require('prpl-server');
express = require('express');
httpsRedirect = require('express-https-redirect');
rendertron = require('rendertron-middleware');

const app = express();

app.use(rendertron.makeMiddleware({
  proxyUrl: 'https://render-tron.appspot.com/render/',
}));

app.get('/.well-known/assetlinks.json', function(req, res) {
  let assetLink = [{
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.coa.auburnalabamanews",
      "sha256_cert_fingerprints":
      ["67:9D:CE:B5:5C:29:DF:31:7C:81:5C:2E:8D:4D:71:6D:48:2D:79:51:3D:DB:1C:1B:8B:65:8A:2A:A0:5A:0F:7C"]
    }
  }];
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(assetLink));
});

//Doesn't work in test
let polyConfigFile = require("./polymer.json");
app.get('/*', prpl.makeHandler('./',polyConfigFile));

app.listen(process.env.PORT || 3000);