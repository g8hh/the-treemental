var camera_pos = {x:0,y:0}
var starting_cp = {x:0,y:0}
var starting_mouse = {x:0,y:0}
var previous = ''
var moved = false
var onTree = false
var cv, ctx

function lerp(start, end, t) { return start*(1-t)+end*t }

function treeUpg(x, y, id) {
    this.x = x
    this.y = y
    this.id = id
}

function updatePosition(tu) {
    let x = tu.x, y = tu.y, id = tu.id;
    ctx.beginPath()
    ctx.rect(x*player.zoom+camera_pos.x,y*player.zoom+camera_pos.y,50*player.zoom,50*player.zoom)
    if (player.canvas.TreeUpgs[id].type == 'research') {
        ctx.fillStyle = player.treeUpgs.includes(id)?'#00f':TreeUpgs.can(id)?'#009':'#005'
    } else ctx.fillStyle = player.treeUpgs.includes(id)?((id == 'm13')?'#ff0':'#0f0'):TreeUpgs.can(id)?'#999':'#555'
    ctx.fill()
    drawStroked(tu.id, x*player.zoom+camera_pos.x+5*player.zoom,y*player.zoom+camera_pos.y+14*player.zoom)
    if (tu.id == player.showUpg) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
    }
}

function drawStroked(text, x, y) {
    let size = 14*player.zoom
    ctx.font = size+'px consolas';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3*player.zoom;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
}

function retrieveCanvasData() {
	let treeCanv = document.getElementById("tree")
	if (treeCanv===undefined||treeCanv===null) return false;
    cv = treeCanv
	ctx = cv.getContext("2d");
	return true;
}

function canvas() {
    if (!retrieveCanvasData()) return
    if (cv && ctx) {
        cv.addEventListener('mousedown', (event)=>{
            moved = true
            starting_cp.x = camera_pos.x
            starting_cp.y = camera_pos.y
            starting_mouse.x = event.pageX
            starting_mouse.y = event.pageY
        })
        
        cv.addEventListener('mouseup', (event)=>{
            moved = false
        })
        
        cv.addEventListener('mousemove', (event)=>{
            if (moved) {
                camera_pos.x = starting_cp.x + event.pageX - starting_mouse.x
                camera_pos.y = starting_cp.y + event.pageY - starting_mouse.y
                updateTree()
            }
        })

        cv.addEventListener('mouseleave', (event)=>{
            moved = false
        })

        cv.addEventListener('click', (event)=>{
            var x = event.pageX - cv.offsetLeft - cv.clientLeft,
            y = event.pageY - cv.offsetTop - cv.clientTop;
            player.showUpg = ''
            player.canvas.upgArray.forEach(function(element) {
                if (y > element.y*player.zoom + camera_pos.y && y < element.y*player.zoom + camera_pos.y + 50*player.zoom && x > element.x*player.zoom + camera_pos.x && x < element.x*player.zoom + camera_pos.x + 50*player.zoom) {
                    player.showUpg = element.id
                }
            });
        }, false);

        window.addEventListener("resize", resizeCanvas)

        cv.width = cv.clientWidth
        cv.height = cv.clientHeight
        if (!getTreeFromId('m13')) addTreeUpg(0,0, 'm13')
    }
}

function resizeCanvas() {
    if (!retrieveCanvasData()) return
	cv.width = 0;
	cv.height = 0;
	cv.width = cv.clientWidth
	cv.height = cv.clientHeight
    updateTree()
}

function addTreeUpg(x, y, id) {
    player.canvas.treeGenerated[id] = false
    player.canvas.upgArray.push(new treeUpg(x, y, id))
}

function updateTree() {
    if (!retrieveCanvasData()) return
    ctx.clearRect(0,0,cv.clientWidth,cv.clientHeight)
    for(let x = 0; x < Object.keys(player.canvas.lines).length; x++) {
        let p1 = getTreeFromId(Object.keys(player.canvas.lines)[x])
        let p2 = getTreeFromId(player.canvas.lines[Object.keys(player.canvas.lines)[x]])
        ctx.beginPath()
        ctx.moveTo(p1.x*player.zoom+camera_pos.x+25*player.zoom, p1.y*player.zoom+camera_pos.y+25*player.zoom)
        ctx.lineTo(p2.x*player.zoom+camera_pos.x+25*player.zoom, p2.y*player.zoom+camera_pos.y+25*player.zoom)
        ctx.lineWidth = 10*player.zoom
        if (player.canvas.TreeUpgs[p1.id].type == 'research') {
            ctx.strokeStyle = player.treeUpgs.includes(Object.keys(player.canvas.lines)[x])?'#004':'#444'
        } else ctx.strokeStyle = player.treeUpgs.includes(Object.keys(player.canvas.lines)[x])?((player.canvas.lines[Object.keys(player.canvas.lines)[x]] == 'm13')?'#440':'#040'):'#444'
        
        ctx.stroke()
    }
    for(let x = 0; x < player.canvas.upgArray.length; x++) {
        updatePosition(player.canvas.upgArray[x])
    }
}