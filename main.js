//LOAD
const loadJSon = async (url) => {
    const response = await fetch(url);
    return await response.json();
}

const loadImage = (url) => {
    const tilemap =  new Image();
    tilemap.src = url
    return tilemap
}

const downloadMap = () => {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(map));
    var dlAnchorElem = document.getElementById('mapDownload');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", "map.json");
}

//INTERACTION
const keyPress = (event) => {
    //console.log(event)

    switch (event.key){
        case "ArrowUp":
            cameraPos[1] += 5
            drawMain()
            break
        case "ArrowDown":
            cameraPos[1] -= 5
            drawMain()
            break
        case "ArrowLeft":
            cameraPos[0] += 5
            drawMain()
            break
        case "ArrowRight":
            cameraPos[0] -= 5
            drawMain()
            break
    }
}

const wheelScroll = (event) => {
    scale += event.deltaY * 0.0005 

    if (scale < 0.1) {
        scale = 0.1
        return
    }

    cameraPos[0] -= event.deltaY * 0.0005 * mainC.width / 2
    cameraPos[1] -= event.deltaY * 0.0005 * mainC.height / 2

    drawMain()
}

const onMouseDown = (event) => {
    event.preventDefault()
    
    if (mapstate === 'waiting'){
        mapstate = 'drag'
        firstPos = [event.x, event.y]
    } else if (mapstate === 'placing') {
        let [x, y] = calculateClickedTile(event.offsetX, event.offsetY)
        editMap(x, y, tiletemp)
    } else if (mapstate === 'placingdrag'){
        squarePaint(firstPos, calculateClickedTile(event.offsetX, event.offsetY), tiletemp)
        mapstate = 'waiting'
    }

    try {
        a = calculateClickedTile(event.offsetX, event.offsetY)
        b = calculateSourceChunk(a[0],a[1])
        //console.log(a[0]-b.startX,a[1]-b.startY);
        updateStat(a,b.name,[a[0]-b.startX,a[1]-b.startY])
    } catch {
        
    }
}

const onMouseUp = (event) => {
    event.preventDefault()
    if (mapstate === 'drag'){
        mapstate = 'waiting'
    } else if (mapstate === 'placing' && !event.ctrlKey && !event.shiftKey){
        mapstate = 'waiting'
    } else if (mapstate === 'placing' && event.ctrlKey){
        mapstate = 'placingdrag'
        firstPos = calculateClickedTile(event.offsetX, event.offsetY)
    }
    
}

const onMouseMove = (event) => {
    event.preventDefault()
    if (mapstate != 'drag') return
    cameraPos = [cameraPos[0] + (firstPos[0] - event.x) * scale, cameraPos[1] + (firstPos[1] - event.y) * scale]
    firstPos = [event.x, event.y]
    drawMain()
}

const onMouseLeave = (event) => {
    mapstate = 'waiting'
}

const calculateClickedTile = (x,y) => {
    let mapX = Math.trunc((x * scale + cameraPos[0]) / 16)
    let mapY = Math.trunc((y * scale + cameraPos[1]) / 16)

    mapX = Object.is(mapX,-0) ? -1 : mapX
    mapY = Object.is(mapY,-0) ? -1 : mapY

    //console.log(mapX,mapY);
    return [mapX,mapY]
}

const calculateSourceChunk = (x,y) => {

    for(chunk of map.chunks){
        if ((x >= chunk.startX && x <= chunk.startX + chunk.sizeX - 1) && (y >= chunk.startY && y <= chunk.startY + chunk.sizeY - 1)){
            //console.log(chunk.name);
            return chunk
        }
    }
    //console.log("OOB");
    return null
}

//DRAW
const drawMapChunk = (chunk) => {

    const chunkImg = document.createElement("canvas")
    const chunkImgCtx = chunkImg.getContext("2d")
    chunkImg.width = chunk.sizeX * 16
    chunkImg.height = chunk.sizeY * 16

    //Draw Map
    for (let i = 0 ; i < chunk.array.length; i++) {

        chunkImgCtx.drawImage(
            tileset,
            (chunk.array[i] % 10) * 16, Math.trunc(chunk.array[i] / 10) * 16, 16, 16,
            i % chunk.sizeX * 16, Math.trunc(i/chunk.sizeX) * 16, 16 , 16
        )

        //Draw sprites
        for(npc of chunk.npc){

            chunkImgCtx.drawImage(
                spriteset,
                (npc.sprite % 10) * 16, Math.trunc(npc.sprite / 10) * 16, 16, 16,
                npc.x  * 16, npc.y * 16, 16 , 16
            )
        }
        for(item of chunk.items){
            if(!item.hidden){
                chunkImgCtx.drawImage(
                    spriteset,
                    0, 0, 16, 16,
                    item.x * 16, item.y * 16, 16 , 16
                )
            } else {
                hiddenMapCtx.drawImage(
                    spriteset,
                    0, 0, 16, 16,
                    (item.x + chunk.startX) * 16, (item.y + chunk.startY) * 16, 16 , 16
                )
            }
        }
    }

    //Apply colors
    if (chunk.pallete != 'bw') {

        const tempImgData = chunkImgCtx.getImageData(0,0,chunkImg.width,chunkImg.height)
        const tempData = tempImgData.data

        for (var i = 0; i < tempData.length; i += 4) {
            
            if (tempData[i] === 248) { //white
                tempData[i] = palletArray[chunk.pallete][0][0]
                tempData[i+1] = palletArray[chunk.pallete][0][1]
                tempData[i+2] = palletArray[chunk.pallete][0][2]
            } else if (tempData[i] === 168) { //light gray
                tempData[i] = palletArray[chunk.pallete][1][0]
                tempData[i+1] = palletArray[chunk.pallete][1][1]
                tempData[i+2] = palletArray[chunk.pallete][1][2]
            } else if (tempData[i] === 96) { //dark gray
                tempData[i] = palletArray[chunk.pallete][2][0]
                tempData[i+1] = palletArray[chunk.pallete][2][1]
                tempData[i+2] = palletArray[chunk.pallete][2][2]
            } else if (tempData[i] === 0) { //black
                tempData[i] = palletArray[chunk.pallete][3][0]
                tempData[i+1] = palletArray[chunk.pallete][3][1]
                tempData[i+2] = palletArray[chunk.pallete][3][2]
            }
        }

        chunkImgCtx.putImageData(tempImgData,0,0)
    }

    return chunkImg
}

const redrawChunk = (chunk) => {
    fullMapCtx.clearRect(
        chunk.startX * 16, chunk.startY * 16,
        chunk.sizeY, chunk.sizeX);

    fullMapCtx.drawImage(drawMapChunk(chunk),
    chunk.startX * 16, chunk.startY * 16)

    drawMain()
}

const drawMap = () => {
    fullMap.width = map.sizeX * 16
    fullMap.height = map.sizeY * 16

    for(chunk of map.chunks){
        fullMapCtx.drawImage(drawMapChunk(chunk),
        chunk.startX * 16, chunk.startY * 16)
    }
}

const drawDrawInterior = (chunk) => {

    interiorMap.width = chunk.sizeX * 16
    interiorMap.height = chunk.sizeY * 16
    interiorMapCtx.clearRect(0,0,interiorMap.width,interiorMap.height)

    interiorMapCtx.drawImage(
        drawMapChunk(chunk),
        0, 0
    )
    mainCCtx.drawImage(
    interiorMap,
    //cameraPos[0], cameraPos[1],
    //interiorMap.width * scale ,interiorMap.height * scale,
    //700,700,
    //interiorMap.width * 10 ,interiorMap.height * 10
    (mainC.width - interiorMap.width) / 2,
    (mainC.height - interiorMap.height) / 2
    )
}

const drawMain = () => {

    mainCCtx.clearRect(0, 0, mainC.width, mainC.height);

    mainCCtx.drawImage(fullMap,
        cameraPos[0], cameraPos[1],
        mainC.width * scale, mainC.height * scale,
        0, 0,
        mainC.width, mainC.height
    )
}

//Globals
let tileset, spriteset, map, interiors, palletArray
let cameraPos = [400,3500]
let scale = 1

let mapstate = 'waiting'
let tiletemp = 1
let firstPos = [0,0]

let fullMap = document.createElement('canvas')
let fullMapCtx = fullMap.getContext("2d")
let spriteMap = document.createElement('canvas')
let spriteMapCtx = fullMap.getContext("2d")
let hiddenMap = document.createElement('canvas')
let hiddenMapCtx = fullMap.getContext("2d")
let interiorMap = document.createElement('canvas')
let interiorMapCtx = interiorMap.getContext("2d")

//docGolbals
const mainC = document.getElementById('canvas')
const mainCCtx = mainC.getContext('2d')
mainCCtx.imageSmoothingEnabled = false
mainC.width = mainC.clientWidth;
mainC.height = mainC.clientWidth;

document.onkeydown = keyPress
document.onwheel = wheelScroll
mainC.onmousedown = onMouseDown
mainC.onmouseup = onMouseUp
mainC.onmousemove = onMouseMove
mainC.onmouseleave = onMouseLeave

async function start() {
    tileset = loadImage("resources/tilemapRed.png")
    spriteset = loadImage("resources/spriteRed.png")
    map = await loadJSon("resources/map.json")
    interiors = await loadJSon("resources/interiors.json")
    palletArray = await loadJSon("resources/pallete.json")
    mainCCtx.imageSmoothingEnabled = false

    hiddenMap.width = spriteMap.width = fullMap.width = map.sizeX * 16
    hiddenMap.height = spriteMap.height = fullMap.height = map.sizeY * 16
    drawMap()
    populateSidebarMapTiles()
    populateSidebarInteriorTiles()

    drawMain()
}

start()