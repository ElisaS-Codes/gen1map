const clickDrawiTile = (id) => {
    mapstate = 'placing'
    tiletemp = id
}

const changeGame = (gameChar) => {
    return
}

const createImageElement = (id) => {
    const element = document.createElement("canvas")
    element.width = 32
    element.height = 32
    const elementCtx = element.getContext("2d")
    
    elementCtx.drawImage(
        tileset,
        (id % 10) * 16, Math.trunc(id / 10) * 16, 16, 16,
        0, 0, 32, 32
    )

    element.onclick = (() => clickDrawiTile(id))

    return element
}

const editMap = (x,y,newTile) =>{

    let chunk = calculateSourceChunk(x,y)

    if (chunk){

        chunk.array[(x - chunk.startX) + (y - chunk.startY) * chunk.sizeX] = newTile

        redrawChunk(chunk)
    }
}

const squarePaint = (firstPos, secondPos, newTile) => {
    let startx = (firstPos[0] < secondPos[0]) ? firstPos[0] + 1 : secondPos[0] + 1
    let starty = (firstPos[1] < secondPos[1]) ? firstPos[1] : secondPos[1]
    let rows = Math.abs(firstPos[0] - secondPos[0]) + 1
    let cols = Math.abs(firstPos[1] - secondPos[1]) + 1

    let chunk = calculateSourceChunk(firstPos[0],firstPos[1])

    for( j = 0; j < cols; j++){
        for( i = 0; i < rows; i++){
            chunk.array[(startx -1 + i - chunk.startX) + (starty + j - chunk.startY) * chunk.sizeX] = newTile
        }
    }

    redrawChunk(chunk)
}

const populateSidebarMapTiles = () => {
    for(var i = 0; i < 100; i++){
        sidebarMap.appendChild(createImageElement(i))
    }
}
const populateSidebarInteriorTiles = () => {
    for(var i = 100; i < 200; i++){
        sidebarInter.appendChild(createImageElement(i))
    }
}

const clearForms = () => {

}

const sidebarInfo = document.getElementById('sidebarInfo')
const sidebarMap = document.getElementById('sidebarMap')
const sidebarInter = document.getElementById('sidebarInter')
const sidebarNPC = document.getElementById('sidebarNPC')
const sidebarEtc = document.getElementById('sidebarEtc')

const showTab = (tab) =>{

    sidebarInfo.hidden = true
    sidebarMap.hidden = true
    sidebarInter.hidden = true
    sidebarNPC.hidden = true
    sidebarEtc.hidden = true
    
    clearForms()
    switch(tab){
        case 0:
            sidebarInfo.hidden = false
            break;
        case 1:
            sidebarMap.hidden = false
            break;
        case 2:
            sidebarInter.hidden = false
            break;
        case 3:
            sidebarNPC.hidden = false
            break;
        case 4:
            sidebarEtc.hidden = false
            break;
    }
}

const statMapCoord = document.getElementById('statMapCoord')
const statChunk = document.getElementById('statChunk')
const statChunkCoord = document.getElementById('statChunkCoord')
const statTile = document.getElementById('statTile')
const statcontent = document.getElementById('statcontent')

const updateStat = (mapCoords, chunkName, chunkCoords) => {
    statMapCoord.innerHTML = mapCoords[0] + ";" + mapCoords[1]
    statChunk.innerHTML = chunkName
    statChunkCoord.innerHTML = chunkCoords[0] + ";" + chunkCoords[1]
    let chunk = map.chunks.find(i => i.name === chunkName)
    statTile.innerHTML = chunk.array[chunkCoords[1] * chunk.sizeX + chunkCoords[0]]
}