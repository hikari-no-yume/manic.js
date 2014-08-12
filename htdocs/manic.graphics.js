window.manic.graphics = (function (manic) {
    'use strict';

    Math.rand = function (max) {
        return this.floor(this.random() * max);
    };
    Math.deg = function (deg) {
        return this.PI / 180 * deg;
    };

    /* from here: http://minecraft.gamepedia.com/Data_values_%28Classic%29 */
    var blockTypes = new manic.Enum({
        Air: 0x00,
        Stone: 0x01,
        Grass: 0x02,
        Dirt: 0x03,
        Cobblestone: 0x04,
        WoodenPlank: 0x05,
        Sapling: 0x06,
        Bedrock: 0x07,
        Water: 0x08,
        StationaryWater: 0x09,
        Lava: 0x0a,
        StationaryLava: 0x0b,
        Sand: 0x0c,
        Gravel: 0x0d,
        GoldOre: 0x0e,
        IronOre: 0x0f,
        CoalOre: 0x10,
        Wood: 0x11,
        Leaves: 0x12,
        Sponge: 0x13,
        Glass: 0x14,
        RedCloth: 0x15,
        OrangeCloth: 0x16,
        YellowCloth: 0x17,
        LimeCloth: 0x18,
        GreenCloth: 0x19,
        AquaGreenCloth: 0x1a,
        CyanCloth: 0x1b,
        BlueCloth: 0x1c,
        PurpleCloth: 0x1d,
        IndigoCloth: 0x1e,
        VioletCloth: 0x1f,
        MagentCloth: 0x20,
        PinkCloth: 0x21,
        BlackCloth: 0x22,
        GrayCloth: 0x23,
        WhiteCloth: 0x24,
        Dandelion: 0x25,
        Rose: 0x26,
        BrownMushroom: 0x27,
        RedMushroom: 0x28,
        GoldBlock: 0x29,
        IronBlock: 0x2a,
        DoubleSlab: 0x2b,
        Slab: 0x2c,
        Brick: 0x2d,
        TNT: 0x2e,
        Bookshelf: 0x2f,
        MossyCobblestone: 0x30,
        Obsidian: 0x31
    });

    /* flower-shaped things */
    function isFlower(id) {
        return (id === blockTypes.Sapling
            || id === blockTypes.Dandelion
            || id === blockTypes.Rose
            || id === blockTypes.BrownMushroom
            || id === blockTypes.RedMushroom);
    }

    /* blocks that aren't just cubes */
    function isSpecialBlock(id) {
        return (id === blockTypes.Slab
            || isFlower(id));
    }

    /* blocks that have semi-transparent textures */
    function isTransparentBlock(id) {
        return (id === blockTypes.Leaves
            || id === blockTypes.Glass
            || id === blockTypes.Water
            || id === blockTypes.StationaryWater
            || id === blockTypes.Lava
            || id === blockTypes.StationaryLava
            || isFlower(id));
    }
    
    /* blocks that can be seen through (used for visibility calculation) */
    function isPortalBlock(id) {
        return (id === blockTypes.Air
            || isTransparentBlock(id)
            || isSpecialBlock(id));
    }

    var texFile = 'terrain.png';
    var texImage = null;
    var texTileSize = 16, texTileCount = 16;
    var textureCoordinates = {};
    textureCoordinates[blockTypes.Stone] = [1, 0];
    textureCoordinates[blockTypes.Dirt] = [2, 0];
    textureCoordinates[blockTypes.Wood] = [4, 0];
    textureCoordinates[blockTypes.Brick] = [7, 0];
    textureCoordinates[blockTypes.Water] = textureCoordinates[blockTypes.StationaryWater] = [14, 0];
    textureCoordinates[blockTypes.Cobblestone] = [0, 1];
    textureCoordinates[blockTypes.Bedrock] = [1, 1];
    textureCoordinates[blockTypes.Sand] = [2, 1];
    textureCoordinates[blockTypes.Gravel] = [3, 1];
    textureCoordinates[blockTypes.Leaves] = [6, 1];
    textureCoordinates[blockTypes.Lava] = textureCoordinates[blockTypes.StationaryLava] = [14, 1];
    textureCoordinates[blockTypes.GoldOre] = [0, 2];
    textureCoordinates[blockTypes.IronOre] = [1, 2];
    textureCoordinates[blockTypes.CoalOre] = [2, 2];
    textureCoordinates[blockTypes.MossyCobblestone] = [4, 2];
    textureCoordinates[blockTypes.Obsidian] = [5, 2];
    textureCoordinates[blockTypes.Sponge] = [0, 3];
    textureCoordinates[blockTypes.Glass] = [0, 3];
    textureCoordinates[blockTypes.RedCloth] = [0, 4];
    textureCoordinates[blockTypes.OrangeCloth] = [1, 4];
    textureCoordinates[blockTypes.YellowCloth] = [2, 4];
    textureCoordinates[blockTypes.LimeCloth] = [3, 4];
    textureCoordinates[blockTypes.GreenCloth] = [4, 4];
    textureCoordinates[blockTypes.AquaGreenCloth] = [5, 4];
    textureCoordinates[blockTypes.CyanCloth] = [6, 4];
    textureCoordinates[blockTypes.BlueCloth] = [7, 4];
    textureCoordinates[blockTypes.PurpleCloth] = [8, 4];
    textureCoordinates[blockTypes.IndigoCloth] = [9, 4];
    textureCoordinates[blockTypes.VioletCloth] = [10, 4];
    textureCoordinates[blockTypes.MagentaCloth] = [11, 4];
    textureCoordinates[blockTypes.PinkCloth] = [12, 4];
    textureCoordinates[blockTypes.BlackCloth] = [13, 4];
    textureCoordinates[blockTypes.GrayCloth] = [14, 4];
    textureCoordinates[blockTypes.WhiteCloth] = [15, 4]
    
    /* [top, bottom, side, side, side, side] */
    function getTextureCoordinates(id) {
        var t, ran, tex;

        if (id === blockTypes.TNT) {
            tex = [[9, 0], [10, 0], [8, 0], [8, 0], [8, 0], [8, 0]];
        } else if (id === blockTypes.Grass) {
            tex = [[0, 0], [2, 0], [3, 0], [3, 0], [3, 0], [3, 0]];
        } else if (id === blockTypes.Wood) {
            tex = [[5, 1], [5, 1], [4, 1], [4, 1], [4, 1], [4, 1]];
        } else if (id === blockTypes.DoubleSlab) {
            tex = [[6, 0], [6, 0], [5, 0], [5, 0], [5, 0], [5, 0]];
        } else if (id === blockTypes.IronBlock) {
            tex = [[7, 1], [7, 3], [7, 2], [7, 2], [7, 2], [7, 2]];
        } else if (id === blockTypes.GoldBlock) {
            tex = [[8, 1], [8, 3], [8, 2], [8, 2], [8, 2], [8, 2]];
        } else if (id === blockTypes.Bookshelf) {
            tex = [[4, 0], [4, 0], [3, 2], [3, 2], [3, 2], [3, 2]];
        } else if (textureCoordinates.hasOwnProperty(id)) {
            t = textureCoordinates[id];
            tex = [t, t, t, t, t, t];
        } else {
            tex = [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1]];
        }
        return tex;
    }

    function randomTextureCoordinates() {
        return getTextureCoordinatesSet(Math.rand(0x31 + 1));
    }

    function getFlowerTextureCoordinates(id) {
        if (id === blockTypes.Rose) {
            return [12, 0];
        } else if (id === blockTypes.Dandelion) {
            return [13, 0];
        } else if (id === blockTypes.RedMushroom) {
            return [12, 1];
        } else if (id === blockTypes.BrownMushroom) {
            return [13, 1];
        } else if (id === blockTypes.Sapling) {
            return [15, 0];
        } else {
            return [-1, -1];
        }
    }

    var faces = new manic.Enum({
        Top: 0,
        Bottom: 1,
        Front: 2,
        Right: 3,
        Back: 4,
        Left: 5
    });

    /* three.js orders faces differently so we use this to reorder */
    var reorderingMap = [2, 3, 0, 1, 4, 5];
    
    var faceDirections = [];
    faceDirections[faces.Top] = [0, 1, 0];
    faceDirections[faces.Bottom] = [0, -1, 0];
    faceDirections[faces.Front] = [0, 0, 1];
    faceDirections[faces.Right] = [1, 0, 0];
    faceDirections[faces.Back] = [0, 0, -1];
    faceDirections[faces.Left] = [-1, 0, 0];
    
    var faceRotations = [];
    faceRotations[faces.Top] = [-Math.PI / 2, 0, 0];
    faceRotations[faces.Bottom] = [Math.PI / 2, 0, 0];
    faceRotations[faces.Front] = [0, 0, 0];
    faceRotations[faces.Right] = [0, Math.PI / 2, 0];
    faceRotations[faces.Back] = [0, Math.PI, 0];
    faceRotations[faces.Left] = [0, -Math.PI / 2, 0];

    /* We reuse this single matrix to save having to constantly allocate matrices */
    var reusableMatrix = new THREE.Matrix4();

    var cachedFaceGeometries = faceDirections.map(function (direction, faceId) {
        var face = new THREE.PlaneGeometry(1, 1);
        var rotation = faceRotations[faceId];
        face.applyMatrix(reusableMatrix.makeRotationX(rotation[0]));
        face.applyMatrix(reusableMatrix.makeRotationY(rotation[1]));
        face.applyMatrix(reusableMatrix.makeRotationZ(rotation[2]));
        face.applyMatrix(reusableMatrix.makeTranslation(direction[0] / 2, direction[1] / 2, direction[2] / 2));
        return face;
    });
    
    var cachedFlowerSliceGeometries = [0, 1, 2, 3].map(function (rotation) {
        return rotation * Math.PI / 2 + Math.PI / 4;
    }).map(function (rotation) {
        var face = new THREE.PlaneGeometry(1, 1);
        face.applyMatrix(reusableMatrix.makeRotationY(rotation));
        return face;
    });

    // Utility function to merge a plane geometry into another geometry with a given matrix and set texture coordinates
    function mergePlaneSetTexture(targetGeometry, planeGeometry, matrix, textureCoordinates) {  
        // Face texture co-ordinates (UV mapping)
        var LeftX = textureCoordinates[0] / texTileCount,
            RightX = LeftX + 1 / texTileCount,
            TopY = 1 - (1 + textureCoordinates[1]) / texTileCount,
            BottomY = TopY + 1 / texTileCount;
        
        // Add face geometry to map geometry
        targetGeometry.merge(planeGeometry, matrix);
        
        // We update existing (default) UVs for cube face, hence the length offsets
        // PlaneGeometry is made up of two triangles
        var faceVertexUvs = targetGeometry.faceVertexUvs[0];
        var faceVertexUv = faceVertexUvs[faceVertexUvs.length - 2];
        faceVertexUv[0].set(LeftX, BottomY);
        faceVertexUv[1].set(LeftX, TopY);
        faceVertexUv[2].set(RightX, BottomY);
        
        faceVertexUv = faceVertexUvs[faceVertexUvs.length - 1];
        faceVertexUv[0].set(LeftX, TopY);
        faceVertexUv[1].set(RightX, TopY);
        faceVertexUv[2].set(RightX, BottomY);
    }

    /* Adds geometry for a cube to a map
     *
     * faceVisibility is used to exclude specific faces
     * e.g. makeCube(blockTypes.Grass, [true, false, false, false, false, false])
     * would only draw the top face
     */
    function addCube(id, faceVisibility, geometry, matrix) {
        var coordinateSet = getTextureCoordinates(id);
        
        for (var faceId = 0; faceId < faceVisibility.length; faceId++) {
            if (faceVisibility[faceId]) {
                mergePlaneSetTexture(geometry, cachedFaceGeometries[faceId], matrix, coordinateSet[faceId]);
            }
        }
    }
    
    /* Adds geometry for a "special block" to a map
     *
     * faceVisibility is not handled like addCube (it'll make it visible if ANY side matches)
     */
    function addSpecialBlock(id, faceVisibility, geometry, matrix) {
        if (!faceVisibility[0] && !faceVisibility[1] && !faceVisibility[2]
            && !faceVisibility[3] && !faceVisibility[4] && !faceVisibility[5]) {
            return;
        }
        // This function only supports flowers for now, so for other special  blocks we pass on to addBlock
        if (!isFlower(id)) {
            addBlock(id, faceVisibility, geometry, matrix);
            return;
        }
        
        var coordinates = getFlowerTextureCoordinates(id);
        
        cachedFlowerSliceGeometries.forEach(function (sliceGeometry) {
            mergePlaneSetTexture(geometry, sliceGeometry, matrix, coordinates);
        });
    }
    
    /* Makes a map chunk within the given bounds (begin <= position < end)
       getBlock is a callback taking (x, y, z) and returning the block type */
    function makeChunk(getBlock, xBegin, xEnd, yBegin, yEnd, zBegin, zEnd) {
        var chunkGeometry = new THREE.Geometry(),
            transparentChunkGeometry = new THREE.Geometry();
    
        for (var x = xBegin; x < xEnd; x++) {
            for (var y = yBegin; y < yEnd; y++) {
                for (var z = zBegin; z < zEnd; z++) {
                    var block = getBlock(x, y, z);
                    
                    if (block === blockTypes.Air) {
                        continue;
                    }
                    
                    var faceVisibility = faceDirections.map(function (direction) {
                        return getBlock(x + direction[0], y + direction[1], z + direction[2]);
                    }).map(function (neighbour) {
                        return block !== neighbour && isPortalBlock(neighbour);
                    });
                    
                    // Transparent blocks can't be in same geometry due to rendering issues
                    var targetGeometry = isTransparentBlock(block) ? transparentChunkGeometry : chunkGeometry;
                    var addFunction = isSpecialBlock(block) ? addSpecialBlock : addCube;
                    addFunction(block, faceVisibility, targetGeometry, reusableMatrix.makeTranslation(x - xBegin, y - yBegin, z - zBegin));
                }
            }
        }
        
        chunkGeometry.mergeVertices();
        transparentChunkGeometry.mergeVertices();
        
        var chunkMesh = new THREE.Mesh(chunkGeometry, new THREE.MeshBasicMaterial({
            map: texImage
        }));
        
        var transparentChunkMesh = new THREE.Mesh(transparentChunkGeometry, new THREE.MeshBasicMaterial({
            map: texImage,
            transparent: true
        }));
        
        chunkMesh.add(transparentChunkMesh);
        
        return chunkMesh;
    }
    
    // Adds the bedrock bounds to the sides of the map
    function addBedrock(scene, xSize, ySize, zSize) {
        var textureCoordinateSet = getTextureCoordinates(blockTypes.Bedrock);
        var centreX = xSize / 2,
            centreY = ySize / 4,
            centreZ = zSize / 2;
        [faces.Left, faces.Back, faces.Right, faces.Front].forEach(function (faceId) {
            var direction = faceDirections[faceId];
            var rotation = faceRotations[faceId];
            if (faceId === faces.Left || faceId === faces.Right) {
                var width = zSize, height = ySize / 2;
            } else {
                var width = xSize, height = ySize / 2;
            }
            var geometry = new THREE.PlaneGeometry(width, height);
            var texture = texImage.clone(), pair = textureCoordinateSet[faceId];
            texture.offset.set(pair[0] / texTileCount, 1 - (1 + pair[1]) / texTileCount);
            texture.repeat.set(1 / texTileCount, 1 / texTileCount);
            texture.needsUpdate = true;
            var material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.BackSide // as we're seeing from inside
            });
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
                centreX + (xSize * direction[0]) / 2 + direction[0] / 2,
                centreY + (ySize * direction[1]) / 2 + direction[1] / 2,
                centreZ + (zSize * direction[2]) / 2 + direction[2] / 2
            );
            mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
            scene.add(mesh);
        });
    }

    var requestFrame = (function(){
        return  window.requestAnimationFrame       || 
                window.webkitRequestAnimationFrame || 
                window.mozRequestAnimationFrame    || 
                window.oRequestAnimationFrame      || 
                window.msRequestAnimationFrame     || 
                function (callback) {
                     window.setTimeout(callback, 1000 / 60);
                };
    }());
    
    var camera = null, renderer = null, scene = null;
    var chunks = null;
    var rendering = true, initialised = false;
    
    function teleportPlayer(x, y, z, xRot, yRot) {
        camera.position.set(x, y, z);
        camera.rotation.set(xRot, yRot, 0);
    }
    
    function init(levelArray, xSize, ySize, zSize) {
        function getBlock(x, y, z) {
            if (0 <= x && x < xSize
                && 0 <= y && y < ySize
                && 0 <= z && z < zSize) {
                return levelArray[zSize * (y * xSize + z) + x];
            } else {
                return null;
            }
        }
        
        // pixelated upscale, smooth downscale
        texImage.magFilter = THREE.NearestFilter;
        texImage.minFilter = THREE.LinearFilter;
        
        var skyboxRadius = Math.sqrt(xSize * ySize) / 2, fog = true, fogDist = 128, fogColour = 0xffffff, skyColour = 0xa2d0ff;
        
        scene = new THREE.Scene();
        if (fog) {
            scene.fog = new THREE.Fog(fogColour, 1, fogDist);
        }
        
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, fog ? fogDist : 65535);
        
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(fog ? fogColour : 0xa2d0ff);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.id = 'canvas';
        document.body.appendChild(renderer.domElement);
    
        camera.position.y = ySize / 2 + 10;
        camera.position.z = xSize / 2;
        camera.position.x = zSize / 2;
        
        var controls = new THREE.FirstPersonControls( camera );

        controls.movementSpeed = 5;
        controls.lookSpeed = 0.125;
        controls.lookVertical = true;
    
        var skybox = new THREE.Mesh(
            new THREE.SphereGeometry(xSize),
            new THREE.MeshBasicMaterial({
                color: 0xa2d0ff,
                side: THREE.BackSide // as we're seeing it from inside
            })
        );
        skybox.position.set(xSize / 2, ySize / 2, zSize / 2);
        scene.add(skybox);
    
        var chunkSize = 32;
    
        chunks = [];
        for (var x = 0; x < xSize; x += chunkSize) {
            chunks[x] = [];
            for (var z = 0; z < zSize; z += chunkSize) {
                // When using fog, we can generate on-demand
                if (fog) {
                    chunks[x][z] = null;
                } else {
                    var chunk = makeChunk(getBlock, x, Math.min(x + chunkSize, xSize), 0, ySize, z, Math.min(z + chunkSize, zSize));
                    chunk.position.set(x, 0, z);
                    scene.add(chunk);
                    chunks[x][z] = chunk;
                }
            }
        }
        
        addBedrock(scene, xSize, ySize, zSize);
        
        var clock = new THREE.Clock();
    
        requestAnimationFrame(function render() {
            if (!rendering) {
                return;
            }
            requestAnimationFrame(render);
            
            controls.update( clock.getDelta() );
            
            // hide chunks behind fog
            if (fog) {
                var playerX = camera.position.x, playerZ = camera.position.z;
                var chunkDiameter = Math.sqrt(Math.pow(chunkSize, 2) + Math.pow(chunkSize, 2));
                for (var x = 0; x < xSize; x += chunkSize) {
                    for (var z = 0; z < zSize; z += chunkSize) {
                        var chunkX = x + chunkSize / 2, chunkZ = z + chunkSize / 2,
                            dist = Math.sqrt(Math.pow(chunkX - playerX, 2) + Math.pow(chunkZ - playerZ, 2)),
                            visible = (dist < fogDist + chunkDiameter);
                        if (chunks[x][z] !== null) {
                            chunks[x][z].visible = visible;
                        } else if (visible) {
                            var chunk = makeChunk(getBlock, x, Math.min(x + chunkSize, xSize), 0, ySize, z, Math.min(z + chunkSize, zSize));
                            chunk.position.set(x, 0, z);
                            scene.add(chunk);
                            chunks[x][z] = chunk;
                        }
                    }
                }
            }
            
            renderer.render(scene, camera);
        });
        
        window.addEventListener( 'resize', function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            renderer.setSize( window.innerWidth, window.innerHeight );

            controls.handleResize();
        }, false );
        
        initialised = true;
    }
    
    function deinit() {
        if (!initialised) {
            return;
        }
        initialised = false;
        scene.traverse(function destroyer(item) {
            try {
                if (item instanceof THREE.Mesh) {
                    destroyer(item.material);
                    destroyer(item.geometry);
                } else if (item instanceof THREE.Material) {
                    destroyer(item.map);
                    item.dispose();
                } else if (typeof item === 'object' && item.hasOwnProperty('dispose')) {
                    console.log('Destroyed non-mesh/material thing ' + item.constructor.name);
                    item.dispose();
                }
            } catch (e) {
                console.log(e);
            }
        });
        document.body.removeChild(renderer.domElement);
        rendering = false;
    }
    
    function preLoad(callback) {
        texImage = THREE.ImageUtils.loadTexture(texFile, THREE.UVMapping, function () {
            callback();
        }, function () {
            alert("Failed to load texture");
        });
    }
    
    return {
        preLoad: preLoad,
        init: init,
        deinit: deinit,
        teleportPlayer: teleportPlayer
    };
}(window.manic));