const clickDrawiTile = (id) => {
    mapstate = 'placing'
    tiletemp = id
}

const createImageElement = (id) => {
    const element = document.createElement("canvas")
    element.width = 32
    element.height = 32
    const elementCtx = element.getContext("2d")
    
    elementCtx.drawImage(
        tileMap,
        (id % 10) * 16, Math.trunc(id / 10) * 16, 16, 16,
        0, 0, 32, 32
    )

    element.onclick = (() => clickDrawiTile(id))

    return element
}

const editMap = (x,y,newTile) =>{

    let chunk = calculateSourceChunk(x,y)

    if (chunk){

        chunk.array[(x - chunk.startX) + y * chunk.sizeX] = newTile

        redrawChunk(chunk)
    }
}

const populateDrawSidebar =() => {
    for(var i = 0; i < 50; i++){
        sidebar.appendChild(createImageElement(i))
    }
}

