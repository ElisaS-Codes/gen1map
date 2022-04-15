let viewportPos = [400,3500]
let viewportScale = 1
let interiorPos = [0,0]
let interiorScale = 1

const paintPallete = (imagedata, pallete) => {
    const data = imagedata.data

    for (var i = 0; i < data.length; i += 4) {
            
        if (data[i] === 248) { //white
            data[i] = palleteArr[pallete][0][0]
            data[i+1] = palleteArr[pallete][0][1]
            data[i+2] = palleteArr[pallete][0][2]
        } else if (data[i] === 168) { //light gray
            data[i] = palleteArr[pallete][1][0]
            data[i+1] = palleteArr[pallete][1][1]
            data[i+2] = palleteArr[pallete][1][2]
        } else if (data[i] === 96) { //dark gray
            data[i] = palleteArr[pallete][2][0]
            data[i+1] = palleteArr[pallete][2][1]
            data[i+2] = palleteArr[pallete][2][2]
        } else if (data[i] === 0) { //black
            data[i] = palleteArr[pallete][3][0]
            data[i+1] = palleteArr[pallete][3][1]
            data[i+2] = palleteArr[pallete][3][2]
        }
    }
    return imagedata
}

const drawMapChunk = (array, npcs, items, sizeX, sizeY, pallete) => { //TODO: fix for rarity/tipe

    //precolor sprites Pallete
    const tempTileset = document.createElement("canvas")
    tempTileset.width = tileSet.width
    tempTileset.height = tileSet.height
    const tempTilesetCtx = tempTileset.getContext("2d")
    tempTilesetCtx.drawImage(tileSet, 0,0)

    const tempSpriteset = document.createElement("canvas")
    tempSpriteset.width = tileSet.width
    tempSpriteset.height = tileSet.height
    const tempSpritesetCtx = tempSpriteset.getContext("2d")
    tempSpritesetCtx.drawImage(spriteSet, 0,0)

    //Apply colors
    if (pallete != 'bw') {

        tempTilesetCtx.putImageData(
            paintPallete(
                tempTilesetCtx.getImageData(0,0,tempTileset.width,tempTileset.height), pallete
            ), 0, 0
        )

        tempSpritesetCtx.putImageData(
            paintPallete(
                tempSpritesetCtx.getImageData(0,0,tempSpriteset.width,tempSpriteset.height), pallete
            ), 0, 0
        )
    }

    //Draw Chunk
    const chunkImg = document.createElement("canvas")
    const chunkImgCtx = chunkImg.getContext("2d")
    chunkImg.width = sizeX * 16
    chunkImg.height = sizeY * 16

    for (let i = 0 ; i < array.length; i++) {

        chunkImgCtx.drawImage(
            tempTileset,
            (chunk.array[i] % 10) * 16, Math.trunc(chunk.array[i] / 10) * 16, 16, 16,
            i % chunk.sizeX * 16, Math.trunc(i/chunk.sizeX) * 16, 16 , 16
        )
    }

    for(npc of npcs){

        chunkImgCtx.drawImage(
            tempSpriteset,
            (npc.sprite % 10) * 16, Math.trunc(npc.sprite / 10) * 16, 16, 16,
            npc.x  * 16, npc.y * 16, 16 , 16
        )
    }

    for(item of items){ 
        chunkImgCtx.drawImage(
            tempSpriteset,
            0, 0, 16, 16,
            item.x * 16, item.y * 16, 16 , 16
        )
    }

    return chunkImg
}

const redrawChunk = (chunk) => {
    fullMap.getContext("2d").clearRect(
        chunk.startX * 16, chunk.startY * 16,
        chunk.sizeY, chunk.sizeX);

    fullMap.getContext("2d").drawImage(
        drawMapChunk(chunk.array, chunk.npc, chunk.items, chunk.sizeX, chunk.sizeY, chunk.pallete),
        chunk.startX * 16, chunk.startY * 16
    )

    drawViewport()
}

const drawMap = () => {
    fullMap.width = mapObj.sizeX * 16
    fullMap.height = mapObj.sizeY * 16

    for(chunk of mapObj.chunks){
        fullMap.getContext("2d").drawImage(
            drawMapChunk(chunk.array, chunk.npc, chunk.items, chunk.sizeX, chunk.sizeY, chunk.pallete),
            chunk.startX * 16, chunk.startY * 16
        )
    }
}

const drawInterior = (chunk) => { //TODO: fix

    interiorPos = [0,0]
    interiorScale = 1

    interiorMap.width = chunk.sizeX * 16
    interiorMap.height = chunk.sizeY * 16
    interiorMapCtx.clearRect(0,0,interiorMap.width,interiorMap.height)

    interiorMapCtx.drawImage(
        drawMapChunk(chunk),
        0, 0
    )
    viewport.getContext('2d').drawImage(
    interiorMap,
    //cameraPos[0], cameraPos[1],
    //interiorMap.width * scale ,interiorMap.height * scale,
    //700,700,
    //interiorMap.width * 10 ,interiorMap.height * 10
    (viewport.width - interiorMap.width) / 2,
    (viewport.height - interiorMap.height) / 2
    )
}

const drawViewport = () => {

    viewport.getContext('2d').clearRect(0, 0, viewport.width, viewport.height);

    viewport.getContext('2d').drawImage(fullMap,
        viewportPos[0], viewportPos[1],
        viewport.width * viewportScale, viewport.height * viewportScale,
        0, 0,
        viewport.width, viewport.height
    )
}