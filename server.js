var path = require('path');
var express = require('express');

var app = express();

// app.use(express.static(path.join(__dirname, '../client/dist')));
app.set('port', process.env.PORT || 5000);

var server = app.listen(app.get('port'), function () {
    console.log('listening on port ', server.address().port);
});


//以下のコードを入れないとherokuでreact-routerが404になる---------------
// そのまま提供する必要があるすべてのファイルのリスト
let protected = ['bundle.js', 'bundle.js.LICENSE.txt', 'favicon.ico', 'index.html']

app.get("*", (req, res) => {

    let path = req.params['0'].substring(1)

    if (protected.includes(path)) {
        // Return the actual file
        res.sendFile(`${__dirname}/dist/${path}`);
    } else {
        // Otherwise, redirect to /build/index.html
        res.sendFile(`${__dirname}/dist/index.html`);
    }
});