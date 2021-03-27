const ALPS = 'abcdefghijklmnopqrstuvwxyz'
const MOVETOUPG = {
    1: [0,-1],
    2: [1,0],
    3: [0,1],
    4: [-1,0],
}
const UPGCHANCES = {
    points: {
        ratio: {
            1: 10,
            2: 3,
            3: 1,
        },
        upgs: {
            1(cost) {
                let mult = randomInt(3,7)
                return new treeUpg2('points', `Gain ${mult}x more points.`, cost, 'chance1', {mult: mult})
            },
            2(cost) {
                return new treeUpg2('points', 'Unspent points boost points gain at reduced rate.', cost, 'chance2', {})
            },
            3(cost) {
                return new treeUpg2('points', 'Gain more points based on tree upgrades bought.', cost, 'chance3', {})
            },
        },
    },
}

function treeUpg2(type, desc, cost, eff, config) {
    this.type = type
    this.desc = desc
    this.cost = cost
    this.eff = eff
    this.config = config
}

var TreeUpgs = {
    effs: {
        chance1: {
            eff(config) {
                return E(config.mult)
            },
        },
        chance2: {
            eff(config) {
                let eff = player.points.max(1).log10().add(1)
                return eff
            },
            effDesc(x=this.eff()) { return format(x,2)+'x' },
        },
        chance3: {
            eff(config) {
                return E(2).pow(player.treeUpgs.length**(0.6))
            },
            effDesc(x=this.eff()) { return format(x,1)+'x' },
        },
    },
    upgs: {
        /*
        'a1':{
            type: 'points',
            desc: 'Placeholder.',
            cost: E(1/0),
            can(x=this.cost) { return player.points.gte(x) },
            eff() {
                let eff = E(1)
                return eff
            },
            effDesc(x=this.eff()) { return format(x,1)+'x' },
        },
        */
        'm13': new treeUpg2('start', 'Start to generate Points.', E(0), 'start', {}),
    },
    can(id) { return ((id == 'm13')?true:player.treeUpgs.includes(player.canvas.lines[id])) && player.points.gte(player.canvas.TreeUpgs[id].cost) },
    buy(id) {
        if (TreeUpgs.can(id) && !player.treeUpgs.includes(id)) {
            player.points = player.points.sub(player.canvas.TreeUpgs[id].cost)
            player.treeUpgs.push(id)
            this.onBuy(id)
        }
    },
    onBuy(id) {
        if (!player.canvas.treeGenerated[id]) {
            let tree = getTreeFromId(id)
            if (id == 'm13') {
                let rand = Math.floor(Math.random()*4)+1
                let newID = ALPS[ALPS.indexOf(id[0])+MOVETOUPG[rand][0]]+(parseInt(id.split(id[0])[1])+MOVETOUPG[rand][1])
                player.canvas.TreeUpgs[newID] = new treeUpg2('points', 'Unspent points boost points gain at reduced rate.', E(15), 'chance2', {})
                player.canvas.lines[newID] = id
                addTreeUpg(tree.x+80*MOVETOUPG[rand][0],tree.y+80*MOVETOUPG[rand][1],newID)
                player.canvas.treeGenerated[id] = true
            } else if (player.canvas.upgArray.length > 1) {
                let free = []
                let x = ALPS.indexOf(id[0]), y = parseInt(id.split(id[0])[1]);
                for (let n = 1; n <= 4; n++) {
                    let X = x+MOVETOUPG[n][0], Y = y+MOVETOUPG[n][1];
                    if (X > 0 && X < 26 && Y > 0 && Y < 26 && getTreeFromId(ALPS[X]+Y) === undefined ) free.push(n)
                }
                if (free.length > 0) {
                    let count = Math.min(randomInt(1,2), Math.min(free.length, 2))
                    let get = []
                    for (let x = 0; x < count; x++){
                        let r = Math.floor(Math.random()*free.length)
                        get.push(free[r])
                        free.splice(r, 1);
                    }
                    for (let x = 0; x < get.length; x++) {
                        let newID = ALPS[ALPS.indexOf(id[0])+MOVETOUPG[get[x]][0]]+(parseInt(id.split(id[0])[1])+MOVETOUPG[get[x]][1])
                        let chance = randomInt(1,UPGCHANCES.points.ratio[1])

                        var length = player.canvas.upgArray.length
                        if (length >= 100) length = length**1.125
                        else if (length >= 50) length = length**1.1
                        else if (length >= 25) length = length**1.075

                        let cost = E(200).mul(E(5+length/5).pow(length-2)).floor()

                        for (let i = 1; i <= Object.keys(UPGCHANCES.points.ratio).length; i++) {
                            if (UPGCHANCES.points.ratio[i] >= chance && chance > (UPGCHANCES.points.ratio[i+1]?UPGCHANCES.points.ratio[i+1]:0)) {
                                player.canvas.TreeUpgs[newID] = UPGCHANCES.points.upgs[i](cost)
                                break
                            }
                        }
                        player.canvas.lines[newID] = id
                        addTreeUpg(tree.x+80*MOVETOUPG[get[x]][0],tree.y+80*MOVETOUPG[get[x]][1],newID)
                    }
                    player.canvas.treeGenerated[id] = true
                }
            }
        }
    },
}

function buyAllTree() {
    for (let x = 0; x < Object.keys(player.canvas.TreeUpgs).length; x++) {
        let id = Object.keys(player.canvas.TreeUpgs)[x]
        if (TreeUpgs.can(id)) TreeUpgs.buy(id)
    }
}

function randomInt(min,max) {
    return Math.floor(Math.random()*(max-min+1))+min
}

function getTreeFromId(id) {
    var got = undefined
    player.canvas.upgArray.forEach(function(element) {
        if (element.id == id) {
            got = element
        }
    })
    return got
}