function E(x){return new ExpantaNum(x)};
function ex(x){
    let nx = new E(0);
    nx.array = x.array;
    nx.sign = x.sign;
    nx.layer = x.layer;
    return nx;
}
function tu(o) {
    return new treeUpg(o.x,o.y,o.id)
}

function calc(dt) {
    if (retrieveCanvasData() && player.canvasReady) {
        canvas()
        player.canvasReady = false
    } else if (!retrieveCanvasData()) {
        player.canvasReady = true
    }
    player.points = player.points.add(FUNCTIONS.getPointsGain().mul(dt))
    updateTree()
}

function getNewPlayer() {
    return {
        points: E(0),
        showUpg: '',
        treeUpgs: [],
        tabs: [0, 0],
        canvasReady: false,
        canvas: {
            lines: {},
            treeGenerated: {'m13': true,},
            TreeUpgs: {
                'm13': new treeUpg2('start', 'Start to generate Points.', E(0), 'start', {}),
            },
            upgArray: [],
        },
    }
}

function wipe(force) {
    if (force) {
        localStorage.setItem("treementalSave",'')
        save()
    }
    player = getNewPlayer()
}

function loadPlayer(load) {
    player = load
    player.tabs = [0, 0]
    player.showUpg = ''
    checkIfUndefined()
    convertToExpNum()
}

function checkIfUndefined() {
    var data = getNewPlayer()

    if (player.points === undefined) player.points = data.points
    if (player.treeUpgs === undefined) player.treeUpgs = data.treeUpgs

    var c = player.canvas
    if (c === undefined) c = data.canvas

    if (c.lines === undefined) c = data.canvas.lines
    if (c.treeGenerated === undefined) c = data.canvas.treeGenerated
    if (c.TreeUpgs === undefined) c = data.canvas.TreeUpgs
    if (c.upgArray === undefined) c = data.canvas.upgArray
}

function convertToExpNum() {
    player.points = E(player.points)
}

function save(){
    if (localStorage.getItem("treementalSave") == '') wipe()
    localStorage.setItem("treementalSave",btoa(JSON.stringify(player)))
}

function load(x){
    if(typeof x == "string" & x != ''){
        loadPlayer(JSON.parse(atob(x)))
    } else {
        wipe()
    }
}

function exporty() {
    save();
    let file = new Blob([btoa(JSON.stringify(player))], {type: "text/plain"})
    window.URL = window.URL || window.webkitURL;
    let a = document.createElement("a")
    a.href = window.URL.createObjectURL(file)
    a.download = "Treemental Save.txt"
    a.click()
}

function importy() {
    let loadgame = prompt("Paste in your save WARNING: WILL OVERWRITE YOUR CURRENT SAVE")
    if (loadgame != null) {
        load(loadgame)
        location.reload()
    }
}

function loadGame() {
    wipe()
    load(localStorage.getItem("treementalSave"))
    loadVue()
    canvas()
    camera_pos = {x:cv.clientWidth/2, y: cv.clientHeight/2}
    setInterval(save,1000)
}