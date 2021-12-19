'use strict';

const http = require("http");
const router = require("routes")();
const auth = require("basic-auth");
const user = require("./user");

router.addRoute("GET /", (req, res) => {
    res.end("Found");
});

router.addRoute("GET /user", (req, res) => {
    user.validatePassword(auth(req))
        .then((user) => {
            res.end(JSON.stringify({
                "data": user
            }));
        })
        .catch((reason) => {
            res.end(JSON.stringify({
                "error": reason.message
            }));
        })
});

router.addRoute("POST /user", (req, res) => {
    let data = '';
    req.on("data", (chunk) => {
        data += chunk;
    });
    req.on("end", () => {
        data = JSON.parse(data);
        user.createUser(data.name, data.password)
            .then((result) => {
                res.end(JSON.stringify({
                    'data': result
                }));
            }).catch((result) => {
                res.end(JSON.stringify({
                    'error': result.message
                }));
        })
    });
});

router.addRoute("GET /lobby", (req, res) => {
    res.end("Lobby");
});

router.addRoute("GET /lobby/:id", (req, res, params) => {
    res.end(`Lobby ${params.id}`);
});

http.createServer(
    async (req, res) => {
        const methodAndUrl = `${req.method} ${req.url}`;
        console.log(methodAndUrl);
        const match = router.match(methodAndUrl);
        if (match) {
            match.fn(req, res, match.params);
        } else {
            res.statusCode = 404;
            res.end('not found\n');
        }
    }).listen(3000);