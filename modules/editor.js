"use strict";
let tiletemp = 1

const enableEditor = () => {
    document.getElementById("editorTabs").hidden = false

    populateTilePallete()
}

const downloadMap = () => {
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapObj))
    let dlAnchorElem = document.createElement('a')
    dlAnchorElem.setAttribute("href",     dataStr     )
    dlAnchorElem.setAttribute("download", "map.json")
    document.body.appendChild(dlAnchorElem)
    dlAnchorElem.click()
    document.body.removeChild(dlAnchorElem)
}

const selectTileElement = (id) => {
    viewportState = 'placing'
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
    const startx = (firstPos[0] < secondPos[0]) ? firstPos[0] : secondPos[0]
    const starty = (firstPos[1] < secondPos[1]) ? firstPos[1]: secondPos[1]
    const rows = Math.abs(firstPos[0] - secondPos[0])
    const cols = Math.abs(firstPos[1] - secondPos[1])

    const chunk = calculateSourceChunk(firstPos[0],firstPos[1])

    for(let j = 0; j <= cols; j++){
        for(let i = 0; i <= rows; i++){
            chunk.array[(startx + i - chunk.startX) + (starty + j - chunk.startY) * chunk.sizeX] = newTile
        }
    }

    redrawChunk(chunk)
}

const showTab = (tab) =>{

    document.getElementById('sidebarInfo').hidden = true
    document.getElementById('sidebarTilePallete').hidden = true
    document.getElementById('sidebarChunkTool').hidden = true
    document.getElementById('sidebarEtcTool').hidden = true
    
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
            document.getElementById('sidebarEtcTool').hidden = false
            break;
    }
}

const createChunk = () => {

    let x = parseInt(document.forms["createChunk"]["sizex"].value)
    let y = parseInt(document.forms["createChunk"]["sizey"].value)

    let array = []
    for(let i =0; i < x*y; i++){
        array.push(1)
    }

    let newChunk = {
        "name": document.forms["createChunk"]["name"].value,
        "pallete": document.forms["createChunk"]["pallete"].value,
        "array": array,
        "interiors": [],
        "signs": [],
        "npc": [],
        "items": [],
        "grass": [],
        "grassencounters": [],
        "water": [],
        "waterencounters": [],
        "fishing":[],
        "startX": parseInt(document.forms["createChunk"]["startx"].value),
        "startY": parseInt(document.forms["createChunk"]["starty"].value),
        "sizeX": x,
        "sizeY": y
    }

    mapObj.chunks.push(newChunk)
    drawMap()
    drawViewport()
}

const deleteLastChunk = () => {
    let last = mapObj.chunks.pop()
    document.forms["createInteriorMap"]["array"].value = last.array
    document.forms["createInteriorMap"]["sizex"].value = last.sizeX
    document.forms["createInteriorMap"]["sizey"].value = last.sizeY

    drawMap()
    drawViewport()
}

const createInteriorMap = () => {

    let newintmap = {
        "name": document.forms["createInteriorMap"]["name"].value,
        "array": document.forms["createInteriorMap"]["array"].value.split(",").map(i => Number(i)),
        "sizeX": parseInt(document.forms["createInteriorMap"]["sizex"].value),
        "sizeY": parseInt(document.forms["createInteriorMap"]["sizey"].value)
    }
    interiors.template.push(newintmap)
}

const createInteriorInstance = () => {
    let newinstance = {
        "name":document.forms["createInteriorInstance"]["name"].value,
        "template":document.forms["createInteriorInstance"]["map"].value,
        "pallete":document.forms["createInteriorInstance"]["pallete"].value,
        "signs": [],
        "npc": [],
        "items": []
    }

    interiors.instances.push(newinstance)
}

const linkInstance = () =>{
    let chunk = mapObj.chunks.find(i => i.name == document.forms["linkInstance"]["chunk"].value)

    let newLink = {
        "x": parseInt(document.forms["createInteriorMap"]["posx"].value),
        "y": parseInt(document.forms["createInteriorMap"]["posy"].value),
        "instance": document.forms["linkInstance"]["instance"].value
    }

    chunk.interiors.push(newLink)
}

const addSign = () => {

    let chunk = mapObj.chunks.find(i => i.name == document.forms["addSign"]["chunk"].value)

    let picture = document.forms["addSign"]["picture"].value

    let newSign = {
        "x": parseInt(document.forms["addSign"]["posx"].value),
        "y": parseInt(document.forms["addSign"]["posy"].value),
        "text": document.forms["addSign"]["text"].value,
        "picture": picture == "" ? false : picture
    }

    chunk.signs.push(newSign)

}

const addItem = () => {
    let chunk = mapObj.chunks.find(i => i.name == document.forms["addItem"]["chunk"].value)

    let other = document.forms["addItem"]["other"].value + 
        document.forms["addItem"]["other"].value ? "₽" : ""

    let newItem = {
        "x": parseInt(document.forms["addItem"]["posx"].value),
        "y": parseInt(document.forms["addItem"]["posy"].value),
        "item": document.forms["addItem"]["item"].value,
        "rarity": parseInt(document.forms["addItem"]["rarity"].value),
        "type": document.forms["addItem"]["type"].value,
        "hidden": document.forms["addItem"]["hidden"].value,
        "other": other,
    }

    chunk.items.push(newItem)
}

const addNPC = () => {
    let chunk = mapObj.chunks.find(i => i.name == document.forms["linkInstance"]["chunk"].value)

    let name = document.forms["addNPC"]["name"].value
    let loss = document.forms["addNPC"]["loss"].value
    let price = document.forms["addNPC"]["price"].value
    
    let newNPC = {
        "name": name == "" ? false : name,
        "sprite": parseInt(document.forms["addNPC"]["posx"].value),
        "x": parseInt(document.forms["addNPC"]["posx"].value),
        "y": parseInt(document.forms["addNPC"]["posy"].value),
        "text": document.forms["addNPC"]["text1"].value,
        "text2": document.forms["addNPC"]["text2"].value,
        "items": false,
        "trainer": false,
        "loss": loss == "" ? false : loss,
        "price": price == "" ? false : parseInt(price)
    }

    chunk.npc.push(newNPC)
}

const addNPCItem = () => {
    let chunk = mapObj.chunks.find(i => i.name == document.forms["addNPCItem"]["chunk"].value)
    let npc = chunk.NPC.find(i => i.x == document.forms["addNPCItem"]["posx"].value
        && i.y == document.forms["addNPCItem"]["posy"].value)

    let newItem = {
        "x": parseInt(document.forms["addNPCItem"]["posx"].value),
        "y": parseInt(document.forms["addNPCItem"]["posy"].value),
        "item": document.forms["addNPCItem"]["item"].value,
        "rarity": parseInt(document.forms["addNPCItem"]["rarity"].value),
        "type": document.forms["addNPCItem"]["type"].value,
        "hidden": document.forms["addNPCItem"]["hidden"].value,
        "other": other
    }

    if (npc.items)
        npc.items.push(newItem)
    else
        npc.items = [newItem]
}

const addNPCPoke = () => {
    let chunk = mapObj.chunks.find(i => i.name == document.forms["addNPCPoke"]["chunk"].value)
    let npc = chunk.NPC.find(i => i.x == document.forms["addNPCPoke"]["posx"].value
        && i.y == document.forms["addNPCPoke"]["posy"].value)

    let newPoke = {
        "species":document.forms["addNPCPoke"]["posx"].value,
        "lvl":parseInt(document.forms["addNPCPoke"]["lvl"].value)
    }

    if (npc.trainer)
        npc.trainer.push(newPoke)
    else
        npc.trainer = [newPoke]
}