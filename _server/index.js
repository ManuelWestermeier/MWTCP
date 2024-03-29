const { log } = require("console");
const { createServer, } = require("net");
const { randomBytes } = require("crypto")

class Client {

    #rawSocket = false
    #obj = {
        on: {
            get: {
                "API\nISSTREAMEND?": key =>
                    this.#obj.streamEnd?.[key] ?? true
            },
            say: {
                "API\nOnStreamEnd": key => {
                    this.#obj.on.streamEnd?.[key]?.();
                }
            },
            stream: {},
            streamEnd: {},
        },
        getPromises: {},
        streamEnd: {},
    }

    constructor(socket) {

        this.#rawSocket = socket;

        this.#rawSocket.on("close", code => {
            this.onclose(code)
        })

        this.#rawSocket.on("error", err => {
            this.onerror(err)
        })

        this.#rawSocket.on("end", () => {
            this.onend()
        })

        this.#rawSocket.on("data", chunk => {
            this.#onmessage(chunk)
        })

    }

    //noraml listeners

    onSay(key, handler) {

        if (!this.#obj.on.say[key])
            this.#obj.on.say[key] = [handler];
        else this.#obj.on.say[key].push(handler)

    }

    onGet(key, handler) {

        this.#obj.on.get[key] = handler;

    }

    //streams and stream listener

    onStream(key, chunkHandler, onEndHandler) {

        this.#obj.on.stream[key] = chunkHandler;
        this.#obj.on.streamEnd[key] = () => {
            onEndHandler();
            delete this.#obj.on.streamEnd[key];
            delete this.#obj.on.stream[key];
        };

    }

    isStreamEnd = async key =>
        await this.get("API\nISSTREAMEND?", key) ? true : false;

    endStream(key) {

        this.#obj.streamEnd[key] = true;
        this.say("API\nOnStreamEnd", key)

    }

    streamChunk(key, chunk) {

        this.#send("stream", key, chunk, false);
        this.#obj.streamEnd[key] = false;

    }

    //Normal Methodas

    say(key, data) {

        this.#send("say", key, data, false);

    }

    get(key, data) {

        var id = randomBytes(8).toString("base64url");

        return new Promise((reslove) => {

            this.#obj.getPromises[id] = res => {
                delete this.#obj.getPromises[id];
                reslove(res);
            };

            this.#send("get", key, data, id)

        })

    }

    //Send and Onmessage

    #onmessage(chunk) {

        try {

            var data = JSON.parse(chunk.toString("utf-8"));

            //onSay
            if (data?.method == "say" && data?.key) {
                if (this.#obj.on.say?.[data.key])
                    this.#obj.on.say[data.key](data?.cont)
            }
            //onGet
            else if (data?.method == "get" && data?.key && data?.id) {

                const sendBack = cont => {
                    this.#send("getback", false, cont, data.id)
                }

                if (!this.#obj.on.get[data?.key])
                    return sendBack("404")

                var res = this.#obj.on.get[data?.key](data?.cont)

                if (res instanceof Promise) {
                    res.then(res => sendBack(res))
                } else {
                    sendBack(res)
                }

            }
            //For getting data Back
            else if (data?.method == "getback" && data?.id) {
                if (this.#obj.getPromises[data.id])
                    this.#obj.getPromises[data.id](data?.cont);
            }
            //onStream
            else if (data?.method == "stream" && data?.key) {
                if (this.#obj.on.stream?.[data?.key])
                    this.#obj.on.stream[data?.key](data?.cont)
            }
            //on ?
            else log(data)

        } catch (error) {
            console.error(error);
        }

    }

    #send(method, key, cont, id) {

        var data = {
            method,
            cont
        }

        if (key) data.key = key
        if (id) data.id = id;

        this.#rawSocket.write(JSON.stringify(data))

    }

    //Other Handlers

    onclose() { }
    onerror() { }
    onend() { }

}

function defaultHandler(client = new Client()) { }

exports.Client = Client;
exports.createServer = (port, handler = defaultHandler) =>
    createServer(socket =>
        handler(new Client(socket))
    ).listen(port || 2882)


process.on("uncaughtException", err => { console.error(err) })
