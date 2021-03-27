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
    if (player.points.gte(1e10)) player.prestige.unl = true
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
        prestige: {
            unl: false,
            points: E(0),
            upgrades: [],
            respec: false,
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

    let c = player.canvas
    if (c === undefined) c = data.canvas

    if (c.lines === undefined) c.lines = data.canvas.lines
    if (c.treeGenerated === undefined) c.treeGenerated = data.canvas.treeGenerated
    if (c.TreeUpgs === undefined) c.TreeUpgs = data.canvas.TreeUpgs
    if (c.upgArray === undefined) c.upgArray = data.canvas.upgArray

    let p = player.prestige
    if (p === undefined) p = data.prestige

    if (p.unl === undefined) p.unl = data.prestige.unl
    if (p.points === undefined) p.points = data.prestige.points
    if (p.upgrades === undefined) p.points = data.prestige.upgrades
    if (p.respec === undefined) p.points = data.prestige.respec

    player.prestige = p
}

function convertToExpNum() {
    player.points = E(player.points)
    player.prestige.points = E(player.prestige.points)
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