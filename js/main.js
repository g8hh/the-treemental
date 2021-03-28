var diff = 0;
var date = Date.now();
var player

const TABS = {
    1: [
        {id: 'Treemental', unl() { return true }, style: 'normal_tab'},
        {id: 'Options', unl() { return true }, style: 'normal_tab'},
        {id: 'Prestige', unl() { return player.prestige.unl }, style: 'normal_tab'},
    ],
}

const FUNCTIONS = {
    getPointsGain() {
        if (!player.treeUpgs.includes('m13')) return E(0)
        let gain = E(1)
        let pow = E(1)
        for (let x = 0; x < Object.keys(player.canvas.TreeUpgs).length; x++) {
            let u = player.canvas.TreeUpgs[Object.keys(player.canvas.TreeUpgs)[x]]
            if (u.type == 'points' && player.treeUpgs.includes(Object.keys(player.canvas.TreeUpgs)[x])) gain = gain.mul(TreeUpgs.effs[u.eff].eff(u.config))
            if (u.type == 'pow_points' && player.treeUpgs.includes(Object.keys(player.canvas.TreeUpgs)[x])) pow = pow.mul(TreeUpgs.effs[u.eff].eff(u.config))
        }
        if (player.prestige.upgrades.includes(2)) gain = gain.mul(UPGRADES.prestige[2].eff())
        if (player.prestige.upgrades.includes(3)) pow = pow.mul(1.15)
        return gain.pow(pow)
    },
    chTabs(i, x) {
        player.tabs[i] = x
        for (let j = i+1; j < player.tabs.length; j++) player.tabs[j] = 0
    },
    prestige: {
        points() {
            let gain = player.points.pow(1/10).div(10)
            if (gain.lt(1)) return E(0)
            if (gain.gte(1e4)) gain = gain.div(1e4).pow(0.5).mul(1e4)
            if (gain.gte(1e10)) gain = gain.div(1e10).pow(0.5).mul(1e10)

            if (player.prestige.upgrades.includes(5)) gain = gain.mul(UPGRADES.prestige[5].eff())
            gain = gain.pow(E(player.floor).pow(E(1.5).pow((player.floor-1)**0.3)))
            return gain.floor()
        },
        can() { return this.points().gte(1) },
        reset() {
            if (this.can()) {
                player.prestige.points = player.prestige.points.add(this.points())
                this.doReset()
            }
        },
        doReset(msg, force=player.prestige.respec) {
            player.points = E(0)
            player.treeUpgs = []
            player.showUpg = ''
            if (force) {
                if (msg != 'floor') player.floor = Math.max(player.floor-1,1)
                resetTreeData()
            }
            for (let x = 0; x < Object.keys(player.canvas.TreeUpgs).length; x++) {
                let u = player.canvas.TreeUpgs[Object.keys(player.canvas.TreeUpgs)[x]]
                if (u.eff == 'chance1') u.desc = `Gain ${format(TreeUpgs.effs.chance1.eff(u.config), 1)}x more points.`
            }
        },
    },
    floor: {
        can() { return player.canvas.upgArray.length >= 100 && player.treeUpgs.length >= player.canvas.upgArray.length },
        go() {
            if (this.can()) {
                player.floor++
                FUNCTIONS.prestige.doReset('floor', true)
            }
        },
    },
}

function resetTreeData() {
    player.canvas = getNewPlayer().canvas
    canvas()
}

const UPGRADES = {
    prestige: {
        can(x) { return player.prestige.points.gte(this[x].cost) },
        buy(x) {
            if (this.can(x) && !player.prestige.upgrades.includes(x)) {
                player.prestige.points = player.prestige.points.sub(this[x].cost)
                player.prestige.upgrades.push(x)
            }
        },
        cols: 8,
        1: {
            desc: 'Tree Upgrades are 12.5% stronger.',
            cost: E(1),
        },
        2: {
            desc: 'Gain more points based on unspent Prestige points.',
            cost: E(100),
            eff() {
                let eff = player.prestige.points.add(1)
                return eff
            },
            effDesc(x=this.eff()) { return format(x,0)+'x' },
        },
        3: {
            desc: 'Raise points gain by 1.15.',
            cost: E(2000),
        },
        4: {
            desc: 'Unlock new Tree Upgrades (can spawn from generation only over 50 Tree Upgrades created).',
            cost: E(1e7),
        },
        5: {
            desc: 'Gain more prestige points based on unspent prestige points.',
            cost: E(1e10),
            eff() {
                let eff = player.prestige.points.max(1).log10().pow(1.5).add(1)
                return eff
            },
            effDesc(x=this.eff()) { return format(x,1)+'x' },
        },
        6: {
            desc: 'Remove first Tree upgrade for multiplier.',
            cost: E(1e15),
        },
        7: {
            desc: 'Tree Upgrades are stronger based on your floor.',
            cost: E(1e30),
            eff() {
                let eff = E(player.floor).max(1).pow(1/4)
                return eff
            },
            effDesc(x=this.eff()) { return format(x.sub(1).mul(100),1)+'%' },
        },
        8: {
            desc: 'Tree upgrade "Gain more points based on tree upgrades bought." is raised by 2.',
            cost: E(1e50),
        },
    }
}

function loop() {
    diff = Date.now()-date;
    calc(diff/1000);
    date = Date.now();
}

function format(ex, acc=3) {
    ex = E(ex)
    if (ex.isInfinite()) return 'Infinity'
    let e = ex.log10().floor()
    if (e.lt(9)) {
        if (e.lt(3)) {
            return ex.toFixed(acc)
        }
        return ex.floor().toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    } else {
        if (ex.gte("eeee9")) {
            let slog = ex.slog()
            return (slog.gte(1e9)?'':E(10).pow(slog.sub(slog.floor())).toFixed(3)) + "F" + format(slog.floor(), 0)
        }
        let m = ex.div(E(10).pow(e))
        return (e.log10().gte(9)?'':m.toFixed(3))+'e'+format(e,0)
    }
}

setInterval(loop, 50)