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

    /* blocks that have semi-transparent textures */
    function isTransparentBlock(id) {
        return (id === blockTypes.Leaves
            || id === blockTypes.Glass
            || id === blockTypes.Water
            || id === blockTypes.StationaryWater
            || id === blockTypes.Lava
            || id === blockTypes.StationaryLava);
    }
    
    /* blocks that can be seen through (used for visibility calculation) */
    function isPortalBlock(id) {
        return (id === blockTypes.Air
            || isTransparentBlock(id));
    }

    var texFile = 'terrain.png';
    var texImage = null;
    var texTileSize = 16, texTileCount = 16;
    var tileWidth = 16, tileHeight = 8;
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
    
    var materialCache = {},
        materialSetCache = {};
    function getMaterialSet(id) {
        if (materialSetCache.hasOwnProperty(id)) {
            return materialSetCache[id];
        } else {
            var coords = getTextureCoordinates(id),
                transparent = isTransparentBlock(id),
                materialSet = [];
            for (var i = 0; i < coords.length; i++) {
                var pair = coords[i],
                    pairString = pair[0] + ',' + pair[1],
                    material;
                if (materialCache.hasOwnProperty(pairString)) {
                    material = materialCache[pairString];
                } else {
                    var texture = texImage.clone();
                    texture.offset.set(pair[0] / texTileCount, 1 - (1 + pair[1]) / texTileCount);
                    texture.repeat.set(1 / texTileCount, 1 / texTileCount);
                    texture.needsUpdate = true;
                    material = new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        map: texture,
                        transparent: transparent,
                        overdraw: transparent
                    });
                    materialCache[pairString] = material;
                }
                materialSet[i] = material;
            }
            materialSetCache[id] = materialSet;
            return materialSet;
        }
    }

    function randomMaterialSet() {
        return getMaterialSet(Math.rand(0x31 + 1));
    }

    function calcIsometricSize(mapSize) {
        return [
            (mapSize[0] + mapSize[2]) * tileWidth / 2,
            (mapSize[0] + mapSize[2]) * tileHeight / 2
        ];
    }

    var cachedCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    var cachedPlaneGeometry = new THREE.PlaneGeometry(1, 1);

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

    function makeFace(material, faceId) {
        var face = new THREE.Mesh(cachedPlaneGeometry, material);
        switch (faceId) {
            case faces.Top:
                face.position.set(0, 0.5, -0.5);
                face.rotation.set(-Math.PI / 2, 0, 0);
                break;
            case faces.Bottom:
                face.position.set(0, -0.5, -0.5);
                face.rotation.set(Math.PI / 2, 0, 0);
                break;
            case faces.Front:
                face.position.set(0, 0, 0);
                face.rotation.set(0, 0, 0);
                break;
            case faces.Right:
                face.position.set(0.5, 0, -0.5);
                face.rotation.set(0, Math.PI/2, 0);
                break;
            case faces.Back:
                face.position.set(0, 0, -1);
                face.rotation.set(0, Math.PI, 0);
                break;
            case faces.Left:
                face.position.set(-0.5, 0, -0.5);
                face.rotation.set(0, -Math.PI/2, 0);
                break;
            default:
                break;
        }
        return face;
    }

    /* faceVisibility is used to exclude specific faces
     * e.g. makeCube(blockTypes.Grass, [true, false, false, false, false, false])
     * would only draw the top face
     */
    function makeCube(id, faceVisibility) {
        var materialSet = getMaterialSet(id);
        var transparent = isTransparentBlock(id);
        
        // More efficient to use actual cube than six surfaces, where possible
        if (faceVisibility[0] && faceVisibility[1]
            && faceVisibility[2] && faceVisibility[3]
            && faceVisibility[4] && faceVisibility[5]) {
            var materials = [];
            
            materialSet.forEach(function (material, i) {
                materials[reorderingMap[i]] = material;
            });
            var cube = new THREE.Mesh(cachedCubeGeometry, new THREE.MeshFaceMaterial(materials));
            return cube;
        } else {
            var cube = new THREE.Object3D();
            for (var i = 0; i < faceVisibility.length; i++) {
                if (faceVisibility[i]) {
                    cube.add(makeFace(materialSet[i], i));
                }
            }
            return cube;
        }
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
    
    function init(levelArray, xSize, ySize, zSize) {
        function getBlock(x, y, z) {
            return levelArray[y * xSize * zSize + z * zSize + x];
        }
        
        texImage = THREE.ImageUtils.loadTexture(texFile, THREE.UVMapping, function () {
            // pixelated upscale, smooth downscale
            texImage.magFilter = THREE.NearestFilter;
            texImage.minFilter = THREE.LinearFilter;
            
            var scene = new THREE.Scene();
            var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
            var renderer = new THREE.WebGLRenderer();
            renderer.setClearColor(0xa2d0ff);
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.domElement.id = 'canvas';
            document.body.appendChild(renderer.domElement);
        
            var limit = 16;
        
            camera.position.y = 74;
            camera.position.z = limit / 2 + Math.cos(camera.rotation.y) * limit / 2;
            camera.position.x = limit / 2 + Math.sin(camera.rotation.y) * limit / 2;
            
			var controls = new THREE.FirstPersonControls( camera );

			controls.movementSpeed = 5;
			controls.lookSpeed = 0.125;
			controls.lookVertical = true;
        
            for (var x = 0; x < limit; x++) {
                for (var y = 0; y < ySize; y++) {
                    for (var z = 0; z < limit; z++) {
                        var block = getBlock(x, y, z);
                        
                        if (block === blockTypes.Air) {
                            continue;
                        }
                        
                        var neighbourTop = getBlock(x, y + 1, z),
                            neighbourBottom = getBlock(x, y - 1, z),
                            neighbourFront = getBlock(x - 1, y, z + 1),
                            neighbourRight = getBlock(x + 1, y, z),
                            neighbourBack = getBlock(x, y, z - 1),
                            neighbourLeft = getBlock(x - 1, y, z);
                            
                        var cube = makeCube(block, [
                            block !== neighbourTop && isPortalBlock(neighbourTop),
                            block !== neighbourBottom && isPortalBlock(neighbourBottom),
                            block !== neighbourFront && isPortalBlock(neighbourFront),
                            block !== neighbourRight && isPortalBlock(neighbourRight),
                            block !== neighbourBack && isPortalBlock(neighbourBack),
                            block !== neighbourLeft && isPortalBlock(neighbourLeft)
                        ]);
                        
                        cube.position.x = x;
                        cube.position.y = y;
                        cube.position.z = z;
                        scene.add(cube);
                    }
                }
            }
            
            var clock = new THREE.Clock();
        
            requestAnimationFrame(function render() {
                requestAnimationFrame(render);
                controls.update( clock.getDelta() );
                renderer.render(scene, camera);
            });
            
            window.addEventListener( 'resize', function () {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

				controls.handleResize();
            }, false );
        }, function () {
            alert("Failed to load texture");
        });
    }
    
    return {
        init: init
    };
}(window.manic));