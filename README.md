# MWTCP-

The Next Gen of http

# Basic setup

## Client

``` js
const Client = require("./_client");

var API = new Client({
    host: "localhost",
    port: 211,
})

API.onopen = async () => {

    API.say("hello", "__DATA__")

}
```

## Server

``` js
const { createServer } = require("./_server");

createServer({ port: 211 }, async client => {

    client.onSay("hello", data => console.log(data))

})
```


## Methods 
1. Get / onGet
2. Say / onSay
3. streamChunk | endStream | isStreamEnd / onStream