const { log } = require("console");
const { createServer } = require("./_server");

createServer({ port: 211 }, async client => {

    client.onGet("g", data => {
        return data == "ha"
    })

    client.onSay("s", log)

})