window.manic.struct = (function () {
    'use strict';
    
    /* lengths in bytes */
    var dataTypes = {
        // signed byte
        'b': 1, 
        // unsigned byte
        'B': 1,
        // signed short 
        'h': 2,
        // string
        's': 64,
        // byte array
        'x': 1024
    };
    
    function formatSize(spec) {
        var size = 0;
        for (var i = 0; i < spec.length; i++) {
            if (dataTypes.hasOwnProperty(spec[i])) {
                size += dataTypes[spec[i]];
            } else {
                throw new Exception("Unknown format char: " + spec[i]);
            }
        }
        return size;
    }
    
    function buildPacket(spec) {
        var buf = new ArrayBuffer(formatSize(spec)),
            view = new DataView(buf),
            args = Array.prototype.slice.call(arguments, 1),
            pos = 0;
        
        for (var i = 0; i < spec.length; i++) {
            switch (spec[i]) {
                // signed byte
                case 'b':
                    view.setInt8(pos, args[i]);
                break;
                case 'B':
                    view.setUint8(pos, args[i]);
                break;
                case 'h':
                    view.setInt16(pos, args[i]);
                break;
                case 's':
                    for (var j = 0; j < 64; j++) {
                        if (j < args[i].length) {
                            view.setUint8(pos + j, args[i].charCodeAt(j));
                        } else {
                            view.setUint8(pos + j, 0x20); // space padding
                        }
                    }
                break;
                case 'x':
                    copyBytes(buf, pos, args[i], 1024);
                break;
            }
            pos += dataTypes[spec[i]];
        }
        
        return buf;
    }
    
    function readPacket(buf, spec) {
        var view = new DataView(buf),
            out = [],
            pos = 0;
        
        for (var i = 0; i < spec.length; i++) {
            switch (spec[i]) {
                // signed byte
                case 'b':
                    out[i] = view.getInt8(pos);
                break;
                case 'B':
                    out[i] = view.getUint8(pos);
                break;
                case 'h':
                    out[i] = view.getInt16(pos);
                break;
                case 's':
                    var outChars = [], hitContent = false;
                    for (var j = 63; j >= 0; j--) {
                        /* find last non-space (to ignore padding) */
                        if (!hitContent) {
                            if (view.getUint8(pos + j) !== 0x20) {
                                hitContent = true;
                            }
                        }
                        if (hitContent) {
                            outChars.unshift(view.getUint8(pos + j));
                        }
                    }
                    out[i] = String.fromCharCode.apply(null, outChars);
                break;
                case 'x':
                    out[i] = buf.slice(pos, pos + 1024);
                break;
            }
            pos += dataTypes[spec[i]];
        }
        
        out.bytesRead = pos;
        return out;
    }
    
    return {
        formatSize: formatSize,
        buildPacket: buildPacket,
        readPacket: readPacket
    };
}());