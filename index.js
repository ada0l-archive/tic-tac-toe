const http = require('http');
const {v4: uuidv4} = require('uuid');
const WebSocket = require('websocket').server;

const rooms = {
    /*
    room_id: {
        roomId: "...",
        players: [...],
        indexOfPlayerWhoseMove: 0,
        board: [
            [-1, -1, -1],
            [-1, -1, -1],
            [-1, -1, -1]
        ]
    }
     */
}

const players = {
    /*
    player_id: {
        playerId: "...",
        name: "huj",
        win: 0,
        lose: 0
     }
     */
};

const httpServer = http.createServer(() => {
});

const socketServer = new WebSocket({
    'httpServer': httpServer
});

socketServer.on('request', request => {
    const connection = request.accept(null, request.origin);

    connection.on('open', () => {
    });

    connection.on('close', () => {
    });

    connection.on('message', (message) => {
        const msg = JSON.parse(message.utf8Data);
        const methodHandlers = {
            'create': createMethodHandler,
            'join': joinMethodHandler,
            'move': moveMethodHandler,
            'setName': setNameMethodHandler
        }
        methodHandlers[msg.method](msg);
    });

    const playerId = uuidv4();

    console.log(playerId);

    players[playerId] = {
        playerId: playerId,
        name: playerId,
        connection: connection,
        win: 0,
        lose: 0
    };

    connection.send(JSON.stringify({
        'method': 'createPlayer',
        'playerId': playerId
    }));
    sendAvailableRooms();
})

httpServer.listen(3000, () => {
});

function createMethodHandler(message) {
    const roomId = uuidv4();
    rooms[roomId] = {
        roomId: roomId,
        players: [players[message.playerId]],
        indexOfPlayerWhoseMove: 0,
        board: [
            [-1, -1, -1],
            [-1, -1, -1],
            [-1, -1, -1]
        ]
    };
    const connection = players[message.playerId].connection;
    connection.send(JSON.stringify({
        'method': 'create',
        'room': roomId
    }));
    sendAvailableRooms();
}

function joinMethodHandler(message) {
    const room = rooms[message.roomId];
    if (room.players.length < 2) {
        room.players.push(players[message.playerId]);
        for (const c of Object.keys(players)) {
            players[c].connection.send(JSON.stringify({
                'method': 'join',
                'room': room.roomId,
                'data': 'Game is started',
                players: room.players.map((player) => {
                    return {
                        playerId: player.playerId,
                        playerName: player.name
                    }
                })
            }));
        }
    } else {
        const connection = players[message.playerId].connection;
        connection.send(JSON.stringify({
            'method': 'join',
            'error': "Room is filled"
        }));
    }
}

function moveMethodHandler(message) {
    const room = rooms[message.roomId];
    const player = players[message.playerId];
    const indexOfPlayer = room.players.indexOf(player);
    if (indexOfPlayer === room.indexOfPlayerWhoseMove) {
        const x = message.x;
        const y = message.y;
        if (room.board[x][y] !== -1) {
            player.connection.send(JSON.stringify({
                "method": "move",
                "error": "This cell is busy"
            }));
            return;
        }
        room.board[x][y] = indexOfPlayer;
        room.indexOfPlayer = (room.indexOfPlayer + 1) % 2;
        for (const c of Object.keys(players)) {
            players[c].connection.send(JSON.stringify({
                "method": "move",
                "board": room.board
            }));
        }
    } else {
        const connection = players[message.playerId].connection;
        connection.send(JSON.stringify({
            'method': 'move',
            'error': "It's not your move"
        }));
    }
}

function setNameMethodHandler(message) {
    players[message.clientId].name = message.name;
    const connection = players[message.clientId].connection;
    connection.send(JSON.stringify({
        'method': 'setName',
        'data': message.name
    }));
}

function sendAvailableRooms() {

    const allGames = []
    for (const k of Object.keys(rooms)) {
        if (rooms[k].players.length < 2) {
            allGames.push(rooms[k].roomId)
        }
    }
    const payLoad = {'method': 'roomsAvailable', 'rooms': allGames}
    for (const c of Object.keys(players)) {
        players[c].connection.send(JSON.stringify(payLoad))
    }
}