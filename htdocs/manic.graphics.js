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

    /* We reuse this single matrix to save having to constantly allocate matrices */
    var reusableMatrix = new THREE.Matrix4();

    var cachedFaceGeometries = faceDirections.map(function (direction, faceId) {
        var face = new THREE.PlaneGeometry(1, 1);
        switch (faceId) {
            case faces.Top:
                reusableMatrix.makeRotationX(-Math.PI / 2);
                break;
            case faces.Bottom:
                reusableMatrix.makeRotationX(Math.PI / 2);
                break;
            case faces.Front:
                // No rotation needed
                reusableMatrix.identity();
                break;
            case faces.Right:
                reusableMatrix.makeRotationY(Math.PI/2);
                break;
            case faces.Back:
                reusableMatrix.makeRotationY(Math.PI);
                break;
            case faces.Left:
                reusableMatrix.makeRotationY(-Math.PI/2);
                break;
            default:
                break;
        }
        face.applyMatrix(reusableMatrix);
        face.applyMatrix(reusableMatrix.makeTranslation(direction[0] / 2, direction[1] / 2, direction[2] / 2));
        return face;
    });

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
                var textureCoordinates = coordinateSet[faceId];
                
                // Face texture co-ordinates (UV mapping)
                var LeftX = textureCoordinates[0] / texTileCount,
                    RightX = LeftX + 1 / texTileCount,
                    TopY = 1 - (1 + textureCoordinates[1]) / texTileCount,
                    BottomY = TopY + 1 / texTileCount;
                
                // Add face geometry to map geometry
                geometry.merge(cachedFaceGeometries[faceId], matrix);
                
                // We update existing (default) UVs for cube face, hence the length offsets
                // PlaneGeometry is made up of two triangles
                var faceVertexUvs =  geometry.faceVertexUvs[0];
                var faceVertexUv = faceVertexUvs[faceVertexUvs.length - 2];
                faceVertexUv[0].set(LeftX, BottomY);
                faceVertexUv[1].set(LeftX, TopY);
                faceVertexUv[2].set(RightX, BottomY);
                
                faceVertexUv = faceVertexUvs[faceVertexUvs.length - 1];
                faceVertexUv[0].set(LeftX, TopY);
                faceVertexUv[1].set(RightX, TopY);
                faceVertexUv[2].set(RightX, BottomY);
            }
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
        
            camera.position.y = ySize / 2 + 10;
            camera.position.z = xSize / 2;
            camera.position.x = xSize / 2;
            
			var controls = new THREE.FirstPersonControls( camera );

			controls.movementSpeed = 5;
			controls.lookSpeed = 0.125;
			controls.lookVertical = true;
        
            var sceneGeometry = new THREE.Geometry;
        
            for (var x = 0; x < xSize; x++) {
                for (var y = 0; y < ySize; y++) {
                    for (var z = 0; z < zSize; z++) {
                        var block = getBlock(x, y, z);
                        
                        if (block === blockTypes.Air) {
                            continue;
                        }
                        
                        var faceVisibility = faceDirections.map(function (direction) {
                            return getBlock(x + direction[0], y + direction[1], z + direction[2]);
                        }).map(function (neighbour) {
                            return block !== neighbour && isPortalBlock(neighbour);
                        });
                        
                        addCube(block, faceVisibility, sceneGeometry, reusableMatrix.makeTranslation(x, y, z));
                    }
                }
            }
            
            var mesh = new THREE.Mesh(sceneGeometry, new THREE.MeshBasicMaterial({
                color: 0xffffff,
                map: texImage,
                transparent: true,
                overdraw: true
            }));
            
            scene.add(mesh);
            
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