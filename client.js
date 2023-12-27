const { log } = require("console");
const { Client } = require("./_client");

var API = new Client({
    host: "localhost",
    port: 211,
})

API.onopen = async () => {

    log(await API.get("g", "ha") && "is ha" || "isnt ha")

    API.say("s", { x: true })

}