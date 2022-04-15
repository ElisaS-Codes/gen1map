let tiletemp = 1

const enableEditor = () => {
    document.getElementById("editorTabs").hidden = false

    populateTilePallete()
}

const downloadMap = () => {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(map));
    var dlAnchorElem = document.getElementById('mapDownload');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", "map.json");
}

const selectTileElement = (id) => {
    mapstate = 'placing'
    tiletemp = id
}

const createTilePalleteElement = (id) => {
    const element = document.createElement("canvas")
    element.width = 32
    element.height = 32
    const elementCtx = element.getContext("2d")
    
    elementCtx.drawImage(
        tileSet,
        (id % 10) * 16, Math.trunc(id / 10) * 16, 16, 16,
        0, 0, 32, 32
    )

    element.onclick = (() => selectTileElement(id))

    return element
}

const populateTilePallete = () => {
    const sidebar = document.getElementById('sidebarTilePallete')
    for(var i = 0; i < 300; i++){
        sidebar.appendChild(createTilePalleteElement(i))
    }
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

const clearForms = () => {

}

const showTab = (tab) =>{

    document.getElementById('sidebarInfo').hidden = true
    document.getElementById('sidebarTilePallete').hidden = true
    document.getElementById('sidebarChunkTool').hidden = true
    document.getElementById('sidebarNPCTool').hidden = true
    document.getElementById('sidebarEtcTool').hidden = true
    
    clearForms()
    switch(tab){
        case 0:
            document.getElementById('sidebarInfo').hidden = false
            break;
        case 1:
            document.getElementById('sidebarTilePallete').hidden = false
            break;
        case 2:
            document.getElementById('sidebarChunkTool').hidden = false
            break;
        case 3:
            document.getElementById('sidebarNPCTool').hidden = false
            break;
        case 4:
            document.getElementById('sidebarEtcTool').hidden = false
            break;
    }
}