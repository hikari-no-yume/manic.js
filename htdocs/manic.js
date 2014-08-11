(function (manic) {
    'use strict';
    
    /* imports */
    var struct = manic.struct;
    
    var connection, incomingBuffer = null;
    
    var levelData = null, levelArray = null;
    
    function copyBytes(dest, pos, src, len) {
        (new Uint8Array(dest, pos, len)).set(new Uint8Array(src));
    }
    
    /* Thanks to the Minecraft Coalition for protocol info: http://wiki.vg/Classic_Protocol */
    
    /* packet IDs */
    var packetTypes = new manic.Enum({
        Identification: 0x00,
        Ping: 0x01,
        LevelInitialize: 0x02,
        LevelDataChunk: 0x03,
        LevelFinalize: 0x04,
        ClientSetBlock: 0x05,
        ServerSetBlock: 0x06,
        SpawnPlayer: 0x07,
        PositionOrientation: 0x08,
        PositionOrientationUpdate: 0x09,
        PositionUpdate: 0x0a,
        OrientationUpdate: 0x0b,
        DespawnPlayer: 0x0c,
        Message: 0x0d,
        DisconnectPlayer: 0x0e,
        UpdateUserType: 0x0f
    });
    
    var packetFormats = {};
    packetFormats[packetTypes.Identification] = "BBssB";
    packetFormats[packetTypes.Ping] = "B";
    packetFormats[packetTypes.LevelInitialize] = "B";
    packetFormats[packetTypes.LevelDataChunk] = "BhxB";
    packetFormats[packetTypes.LevelFinalize] = "Bhhh";
    packetFormats[packetTypes.ClientSetBlock] = "BhhhBB";
    packetFormats[packetTypes.ServerSetBlock] = "BhhhB";
    packetFormats[packetTypes.SpawnPlayer] = "BbshhhBB";
    packetFormats[packetTypes.PositionOrientation] = "BbhhhBB";
    packetFormats[packetTypes.PositionOrientationUpdate] = "BbbbbBB";
    packetFormats[packetTypes.PositionUpdate] = "Bbbbb";
    packetFormats[packetTypes.OrientationUpdate] = "BbBB";
    packetFormats[packetTypes.DespawnPlayer] = "Bb";
    packetFormats[packetTypes.Message] = "Bbs";
    packetFormats[packetTypes.DisconnectPlayer] = "Bs";
    packetFormats[packetTypes.UpdateUserType] = "BB";
    
    function sendPacket(type) {
        var args = Array.prototype.slice.call(arguments, 0),
            buf;
        args.unshift(packetFormats[type]);
        buf = struct.buildPacket.apply(null, args);
        connection.send(buf);
        console.log('Sent packet of type ' + packetTypes.getKey(type) + ': ' + args.slice(2))
    }
    
    var packetHandlers = {}, serverNameH = null, MOTDH = null;
    packetHandlers[packetTypes.Identification] = function (type, version, serverName, MOTD, userType) {
        serverNameH = document.createElement('h1');
        serverNameH.textContent = serverName;
        MOTDH = document.createElement('h2');
        MOTDH.textContent = MOTD;
        document.body.appendChild(serverNameH);
        document.body.appendChild(MOTDH);
        console.log('Connected to a version ' + version + ' server, "' + serverName + '" - "' + MOTD + '", and you\'re ' + (userType === 0x64 ? '' : 'not') + ' an admin');
    };
    
    var chunkedLevelData = null, progressBar = null, progressText = null;
    packetHandlers[packetTypes.LevelInitialize] = function () {
        chunkedLevelData = [];
        progressBar = document.createElement('progress');
        progressBar.max = 100;
        progressBar.value = 0;
        
        progressText = document.createElement('h1');
        progressText.textContent = "Loading map...";
        
        document.body.appendChild(progressText);
        document.body.appendChild(progressBar);
    };
    packetHandlers[packetTypes.LevelDataChunk] = function (type, length, chunk, progress) {
        if (length < 1024) {
            chunk = chunk.slice(0, length);
        }
        chunkedLevelData.push(chunk);
        progressBar.value = progress;
    };
    packetHandlers[packetTypes.LevelFinalize] = function (type, xSize, ySize, zSize) {
        var length = 0;
        for (var i = 0; i < chunkedLevelData.length; i++) {
            length += chunkedLevelData[i].byteLength;
        }
        
        /* dechunk into a contiguous array */
        levelData = new ArrayBuffer(length);
        length = 0;
        for (var i = 0; i < chunkedLevelData.length; i++) {
            copyBytes(levelData, length, chunkedLevelData[i], chunkedLevelData[i].byteLength);
            length += chunkedLevelData[i].byteLength;
        }
        
        /* decompress */
        var unzip = new Zlib.Gunzip(new Uint8Array(levelData));
        levelArray = new Uint8Array(unzip.decompress());
        
        /* remove first 4 bytes (length is prefixed as Uint32 for some reason) */
        levelArray = levelArray.subarray(4);
        progressText.textContent = 'Loaded map (' + xSize + '×' + ySize + '×' + zSize + ')';
        
        manic.graphics.init(levelArray, xSize, ySize, zSize);
        /*var html = '', y = 0;
        for (var x = 0; x < xSize; x++) {
            html += '<tr>'
            for (var z = 0; z < zSize; z++) {
                html += '<td>' + levelArray[y * xSize * zSize + z * zSize + x] + '</td>';
            }
            html += '</tr>';
        }
        var elem = document.createElement('table');
        elem.innerHTML = html;
        document.body.appendChild(elem);*/
    };
    
    function handlePackets() {
        var pos = 0, byteBuffer = new Uint8Array(incomingBuffer), type, format, data;
        while (pos < incomingBuffer.byteLength) {
            type = byteBuffer[pos];
            if (packetFormats.hasOwnProperty(type)) {
                format = packetFormats[type];
                if (pos + struct.formatSize(format) <= incomingBuffer.byteLength) {
                    data = struct.readPacket(incomingBuffer.slice(pos), format);
                    if (type !== packetTypes.Ping && type !== packetTypes.LevelDataChunk) {
                        console.log('Received packet of type ' + packetTypes.getKey(type) + ': ' + data.slice(1));
                    }
                    pos += data.bytesRead;
                    try {
                        if (packetHandlers.hasOwnProperty(type)) {
                            packetHandlers[type].apply(null, data);
                        }
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    break;
                }
            } else {
                console.log('Unknown packet type: ' + type);
                break;
            }
        }
        if (pos === incomingBuffer.length) {
            incomingBuffer = null;
        } else {
            incomingBuffer = incomingBuffer.slice(pos);
        }
    }
    
    window.onload = function () {
        connection = new WebSocket("ws://localhost:25566/");
        connection.onopen = function () {
            console.log('Connected');
            sendPacket(packetTypes.Identification, 0x07, 'ajf', '--', 0);
            
            window.say = function say(msg) {
                var msgs = []
                while (msg.length > 64) {
                    msgs.push(msg.substr(0, 64));
                    msg = msg.substr(64);
                }
                msgs.push(msg);
                for (var i = 0; i < msgs.length; i++) {
                    sendPacket(packetTypes.Message, -1, msgs[i]);
                }
            };
        };
        connection.onmessage = function (e) {
            if (e.data instanceof Blob) {
                var reader = new FileReader();
                reader.onloadend = function () {
                    if (incomingBuffer === null) {
                        incomingBuffer = reader.result;
                    } else {
                        var newBuffer = new ArrayBuffer(incomingBuffer.byteLength + reader.result.byteLength);
                        copyBytes(newBuffer, 0, incomingBuffer, incomingBuffer.byteLength);
                        copyBytes(newBuffer, incomingBuffer.byteLength, reader.result, reader.result.byteLength);
                        incomingBuffer = newBuffer;
                    }
                    handlePackets();
                };
                reader.onerror = function () {
                    throw new Exception("FileReader errored, :panic:");
                };
                reader.readAsArrayBuffer(e.data);
            } else {
                console.log('Can\'t handle non-Blob data');
            }
        };
        connection.onerror = function () {
            console.log('Connection error');
        };
        connection.onclose = function () {
            console.log('Connection close');
        };
    };
}(window.manic));