const simpleDDP = require("simpleddp"); // nodejs
const ws = require("isomorphic-ws");
var cron = require("node-cron");

var fs = require( "fs");

let opts = {
    endpoint: "ws://localhost:3000/websocket",
    SocketConstructor: ws,
    reconnectInterval: 10000,
};
const server = new simpleDDP(opts);

server.on('connected', async () => {
    // do something
    console.log("Conectado");
    try {

        // let userSub = server.subscribe("user");
        // await userSub.ready();
        let result=""
       let usuariosVPN = await server.call('getusers',{ "vpn": true });
    //    await server.collection('users').filter(user => user.vpn == true).fetch()

        usuariosVPN && usuariosVPN.forEach((element,index) => {
            result =  element.username?`${result}${element.username} l2tpd ${element.passvpn?element.passvpn:"123"} 192.168.18.${index+2}\n`:result
       });
        console.log(result);
        // server.disconnect()

            await fs.writeFile("/etc/ppp/chap-secrets", result, (err) => {
                if (err) console.error("Error: " + err);
                console.info("Datos Guardados Correctamente!!!")
            });
        
            
        server.disconnect()
    } catch (error) {
        console.error(error);
    }


});

server.on('disconnected', () => {
    // for example show alert to user
    console.info("Desconectado");
});

server.on('error', (e) => {
    // global errors from server
    console.error(e);
});

server.on('ready', (e) => {
    // global errors from server
    console.error(e);
});

cron
    .schedule(
        "0-59 0-23 1-31 1-12 *",
        async () => {
            server.connect()
        },
        {
            scheduled: true,
            timezone: "America/Havana",
        }
    )
    .start();
