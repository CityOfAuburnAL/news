prpl = require('prpl-server');
express = require('express');
httpsRedirect = require('express-https-redirect');
rendertron = require('rendertron-middleware');

const app = express();

app.use(rendertron.makeMiddleware({
  proxyUrl: 'https://render-tron.appspot.com/render/',
}));

app.get('/.well-known/assetlinks.json', function(req, res) {
  let assetLink = [
    { "relation": [
        "delegate_permission/common.handle_all_urls"
      ],
      "target": {
        "namespace": "android_app", 
        "package_name": "com.coa.auburnalabamanews",
        "sha256_cert_fingerprints": ["A9:5B:BE:70:72:4D:8D:21:D2:F6:4C:47:70:FA:7F:2C:F2:CB:7B:E2:93:B1:07:90:DA:4F:F0:3C:93:7C:9C:4D"]
      }
    }
  ];
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(assetLink));
});

//Doesn't work in test
let polyConfigFile = require("./polymer.json");
app.get('/*', prpl.makeHandler('./',polyConfigFile));

app.listen(process.env.PORT || 3000);